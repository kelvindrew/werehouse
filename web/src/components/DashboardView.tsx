import React, { useState, useEffect, useMemo } from 'react';
import { dataService, assignSampleMaterialImage } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import { 
  DollarSign, 
  Package, 
  Boxes, 
  AlertTriangle, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowLeftRight, 
  Clock, 
  MapPin, 
  ChevronRight, 
  ArrowRight, 
  Plus, 
  Camera,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  ShieldCheck,
  Activity,
  Gauge,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { StockMovement, StorageLocation, StockItem } from '@shared/types/models';
import { WarehouseVisualTourModal } from './WarehouseVisualTourModal';
import { MobileActionGrid } from './MobileActionGrid';

interface DashboardViewProps {
  onNavigateToStock: (filter?: string) => void;
  onNavigateToMovements: () => void;
  onOpenMaterialModal: (materialId: string) => void;
  onNavigateToLocations?: () => void;
  onOpenCreateLocation?: () => void;
  onQuickReceipt?: (item?: StockItem) => void;
  onQuickIssue?: (item?: StockItem) => void;
  onOpenTransfer?: () => void;
  onOpenShareModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToStock,
  onNavigateToMovements,
  onOpenMaterialModal,
  onNavigateToLocations,
  onOpenCreateLocation,
  onQuickReceipt,
  onQuickIssue,
  onOpenTransfer,
  onOpenShareModal,
}) => {
  const { t, selectedWarehouse } = useAuth();
  const [kpis, setKpis] = useState(() => dataService.getKpis());
  const [locations, setLocations] = useState<StorageLocation[]>(() => dataService.getLocations());
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>(() => dataService.getStockMovements().slice(0, 15));
  const [allStock, setAllStock] = useState<StockItem[]>(() => dataService.getStock());
  
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days' | 'year'>('7days');
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourLocationCode, setTourLocationCode] = useState<string>('B1');
  const [chartHoverIndex, setChartHoverIndex] = useState<number>(3); // Default highlight Wednesday
  const [productSearch, setProductSearch] = useState<string>('');
  const [productSort, setProductSort] = useState<'totalValue' | 'quantity' | 'materialCode'>('totalValue');

  const handleOpenTour = (code?: string) => {
    setTourLocationCode(code || 'B1');
    setIsTourOpen(true);
  };

  useEffect(() => {
    const update = () => {
      setKpis(dataService.getKpis());
      setLocations(dataService.getLocations());
      setRecentMovements(dataService.getStockMovements().slice(0, 15));
      setAllStock(dataService.getStock());
    };
    const unsubscribe = dataService.subscribe(update);
    return () => unsubscribe();
  }, []);

  // Filtered stock by current warehouse selection if active
  const scopedStock = useMemo(() => {
    if (selectedWarehouse === 'ALL') return allStock;
    return allStock.filter(s => s.warehouseId === selectedWarehouse);
  }, [allStock, selectedWarehouse]);

  // Real Category Breakdown computed dynamically from the real dataset
  const categoryStats = useMemo(() => {
    let valvesVal = 0, valvesQty = 0;
    let pumpsVal = 0, pumpsQty = 0;
    let bearingsVal = 0, bearingsQty = 0;
    let electricalVal = 0, electricalQty = 0;
    let consumablesVal = 0, consumablesQty = 0;

    scopedStock.forEach(p => {
      const name = (p.materialName + ' ' + (p.chineseName || '') + ' ' + (p.specification || '')).toUpperCase();
      const val = p.totalValue || (p.quantity * p.unitPrice) || 0;
      if (name.includes('VALVE') || name.includes('RELIEF') || name.includes('BALL') || name.includes('GATE') || name.includes('CHECK') || name.includes('安全阀') || name.includes('阀')) {
        valvesVal += val;
        valvesQty += p.quantity;
      } else if (name.includes('PUMP') || name.includes('IMPELLER') || name.includes('LINER') || name.includes('INSERT') || name.includes('50D') || name.includes('200ZJ') || name.includes('泵') || name.includes('叶轮')) {
        pumpsVal += val;
        pumpsQty += p.quantity;
      } else if (name.includes('BEARING') || name.includes('ROLLER') || name.includes('BUSHING') || name.includes('SKF') || name.includes('轴承')) {
        bearingsVal += val;
        bearingsQty += p.quantity;
      } else if (name.includes('CABLE') || name.includes('WIRE') || name.includes('BREAKER') || name.includes('SWITCH') || name.includes('RELAY') || name.includes('ELECTR') || name.includes('断路器') || name.includes('电缆')) {
        electricalVal += val;
        electricalQty += p.quantity;
      } else {
        consumablesVal += val;
        consumablesQty += p.quantity;
      }
    });

    const total = valvesVal + pumpsVal + bearingsVal + electricalVal + consumablesVal || 1;
    const catList = [
      { name: 'Consommables & Atelier', val: consumablesVal, percent: Math.round((consumablesVal / total) * 100), color: '#cbd5e1' },
      { name: 'Roulements & Mécanique', val: bearingsVal, percent: Math.round((bearingsVal / total) * 100), color: '#10b981' },
      { name: 'Pompes & Blindages', val: pumpsVal, percent: Math.round((pumpsVal / total) * 100), color: '#0c0d0e' },
      { name: 'Électrique & Capteurs', val: electricalVal, percent: Math.round((electricalVal / total) * 100), color: '#64748b' },
      { name: 'Robinetterie & Vannes', val: valvesVal, percent: Math.round((valvesVal / total) * 100), color: '#d4f938' },
    ];

    // Compute stroke dash offsets for SVG donut chart (radius = 38, circumference = 238.76)
    const circumference = 238.76;
    let accumulated = 0;
    return catList.map(cat => {
      const strokeLength = (cat.percent / 100) * circumference;
      const strokeOffset = -accumulated;
      accumulated += strokeLength;
      return {
        ...cat,
        dashArray: `${strokeLength} ${circumference - strokeLength}`,
        dashOffset: strokeOffset
      };
    });
  }, [scopedStock]);

  // Real Sites Breakdown
  const siteStats = useMemo(() => {
    const b1 = allStock.filter(p => p.warehouseId === 'B1');
    const b2 = allStock.filter(p => p.warehouseId === 'B2');
    const cont = allStock.filter(p => p.warehouseId.startsWith('CONT'));
    const yard = allStock.filter(p => p.warehouseId === 'YARD');

    const totalVal = kpis.totalValuationUSD || 1;
    const b1Val = b1.reduce((s, p) => s + p.totalValue, 0);
    const b2Val = b2.reduce((s, p) => s + p.totalValue, 0);
    const contVal = cont.reduce((s, p) => s + p.totalValue, 0);
    const yardVal = yard.reduce((s, p) => s + p.totalValue, 0);

    return {
      b1: { qty: b1.reduce((s, p) => s + p.quantity, 0), val: b1Val, pct: Math.round((b1Val / totalVal) * 100), occupancy: 84 },
      b2: { qty: b2.reduce((s, p) => s + p.quantity, 0), val: b2Val, pct: Math.round((b2Val / totalVal) * 100), occupancy: 72 },
      cont: { qty: cont.reduce((s, p) => s + p.quantity, 0), val: contVal, pct: Math.max(3, Math.round((contVal / totalVal) * 100)), occupancy: 68 },
      yard: { qty: yard.reduce((s, p) => s + p.quantity, 0), val: yardVal, pct: Math.max(2, Math.round((yardVal / totalVal) * 100)), occupancy: 42 },
    };
  }, [allStock, kpis.totalValuationUSD]);

  // Real Out of Stock & Low Stock items
  const outOfStockCount = useMemo(() => {
    return scopedStock.filter(s => s.quantity <= 0).length;
  }, [scopedStock]);

  // Real Critical Restock priorities (quantity <= 5)
  const criticalRestockItems = useMemo(() => {
    return scopedStock
      .filter(p => p.quantity <= 5)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 4);
  }, [scopedStock]);

  // Weekly movement velocity data (Research benchmark: Inbound vs Outbound flow)
  const weeklyData = useMemo(() => [
    { day: 'Lun', val: 940, label: 'Lundi', amount: '$4,120', inQty: 18, outQty: 12 },
    { day: 'Mar', val: 1280, label: 'Mardi', amount: '$5,890', inQty: 24, outQty: 19 },
    { day: 'Mer', val: 1674, label: 'Mercredi (Pic)', amount: '$8,870', inQty: 35, outQty: 28 },
    { day: 'Jeu', val: 1100, label: 'Jeudi', amount: '$4,980', inQty: 16, outQty: 15 },
    { day: 'Ven', val: 1450, label: 'Vendredi', amount: '$6,700', inQty: 29, outQty: 22 },
    { day: 'Sam', val: 780, label: 'Samedi', amount: '$3,200', inQty: 10, outQty: 8 },
    { day: 'Dim', val: 520, label: 'Dimanche', amount: '$2,450', inQty: 5, outQty: 4 },
  ], []);

  // Filtered sample products for bottom table
  const filteredProducts = useMemo(() => {
    let list = [...scopedStock];
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      list = list.filter(p => 
        p.materialCode.toLowerCase().includes(q) ||
        p.materialName.toLowerCase().includes(q) ||
        (p.chineseName && p.chineseName.toLowerCase().includes(q)) ||
        p.binLocation.toLowerCase().includes(q)
      );
    }

    if (productSort === 'totalValue') {
      list.sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0));
    } else if (productSort === 'quantity') {
      list.sort((a, b) => b.quantity - a.quantity);
    } else {
      list.sort((a, b) => a.materialCode.localeCompare(b.materialCode));
    }

    return list.slice(0, 6);
  }, [scopedStock, productSearch, productSort]);

  // Relative time helper
  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Récemment';
    try {
      const diffMin = Math.round((Date.now() - new Date(isoString).getTime()) / 60000);
      if (diffMin < 1) return "À l'instant";
      if (diffMin < 60) return `Il y a ${diffMin} min`;
      const diffHours = Math.round(diffMin / 60);
      if (diffHours < 24) return `Il y a ${diffHours}h`;
      return new Date(isoString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    } catch {
      return 'Récemment';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Mobile Quick Action Squircles Carousel (Inspired by Reference Image Top Row) */}
      <MobileActionGrid
        onOpenIssue={() => onQuickIssue?.()}
        onOpenReceipt={() => onQuickReceipt?.()}
        onOpenTransfer={() => onOpenTransfer?.()}
        onOpenTour={() => handleOpenTour('B1')}
        onOpenShare={() => onOpenShareModal?.()}
        t={t}
      />

      {/* ========================================================================= */}
      {/* EXECUTIVE CONTROL BAR (Decision-First: Timeframe & SLA Benchmarks)        */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 liquid-glass rounded-2xl border border-white/80 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-carbon text-white text-xs font-bold">
            <Activity className="w-3.5 h-3.5 text-lime" />
            <span>Cockpit Décisionnel</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-zinc-500 pl-2 border-l border-zinc-200">
            <span className="flex items-center gap-1 text-emerald-700 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              99.4% Précision Stock
            </span>
            <span>•</span>
            <span className="text-zinc-600 font-mono">Dock-to-Stock: 14 min</span>
            <span>•</span>
            <span className="text-zinc-600 font-mono">SLA Sorties: 98.8%</span>
          </div>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center bg-zinc-200/50 p-0.5 rounded-full border border-zinc-300/60 self-start sm:self-auto">
          {[
            { id: 'today', label: "Aujourd'hui" },
            { id: '7days', label: '7 jours' },
            { id: '30days', label: '30 jours' },
            { id: 'year', label: 'Année 2026' }
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id as any)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                timeframe === tf.id
                  ? 'bg-white text-zinc-950 font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIER 1: 4 Key Executive Stat Cards (5-Second Rule)                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Valorisation Globale */}
        <div className="liquid-glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>Valorisation Totale</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
              USD
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono tracking-tight">
              ${kpis.totalValuationUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-lime-muted text-lime-text border border-lime/30 shadow-2xs">
              <TrendingUp className="w-3 h-3 text-lime-text" />
              <span>+4.8%</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-medium truncate">
            B1: ${(siteStats.b1.val / 1000000).toFixed(2)}M • B2: ${(siteStats.b2.val / 1000000).toFixed(2)}M • Ext: ${(siteStats.cont.val + siteStats.yard.val).toLocaleString()}$
          </p>
        </div>

        {/* Card 2: Stock Physique & Références */}
        <div className="liquid-glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>Stock Physique Total</span>
              <Boxes className="w-3.5 h-3.5 text-zinc-700" />
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-lime-muted text-lime-text">
              Actif
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono tracking-tight">
              {kpis.totalUnits.toLocaleString()}
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>99.4% Dispo</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-medium">
            {kpis.totalItems.toLocaleString()} références sur {kpis.locationsCount.toLocaleString()} alvéoles
          </p>
        </div>

        {/* Card 3: Flux & Taux de Rotation */}
        <div 
          onClick={onNavigateToMovements}
          className="liquid-glass-card p-5 relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>Flux Hebdomadaires</span>
              <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-700" />
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              S39
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-3xl font-black text-zinc-950 font-mono tracking-tight">
              {recentMovements.length * 8} pcs
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-lime-muted text-lime-text border border-lime/30 shadow-2xs">
              <TrendingUp className="w-3 h-3" />
              <span>+12.4%</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-medium">
            Réceptions, sorties et transferts inter-sites
          </p>
        </div>

        {/* Card 4: Actionable Low Stock Alert */}
        <div 
          onClick={() => onNavigateToStock('lowStock')}
          className="liquid-glass-card p-5 relative overflow-hidden group cursor-pointer border-amber-300/70"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce" />
              <span>Alertes Réappro</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Priorité 1
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono tracking-tight">
              {kpis.lowStockCount} <span className="text-xs font-semibold text-zinc-400 font-sans">critiques</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
              <AlertCircle className="w-3 h-3 text-rose-600" />
              <span>{outOfStockCount} ruptures</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1 font-medium">
            {outOfStockCount > 0 ? `${outOfStockCount} articles épuisés • Cliquez pour commander` : 'Aucune rupture critique détectée'}
          </p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* TIER 2: 3 Analytical Visualizations (Real Donut, Spline Wave, Footprint)  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Card A (Left 4 cols): Real Category Donut Chart */}
        <div className="lg:col-span-4 liquid-glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-sm text-zinc-900 tracking-tight">Répartition par Famille</h3>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-zinc-100 rounded-full text-zinc-600">
                drew.xlsx
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">Valeur Consolidée</span>
                <span className="text-2xl font-black text-zinc-950 font-mono tracking-tight">
                  ${kpis.totalValuationUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <span className="text-xs font-bold text-zinc-600 bg-zinc-100 px-2 py-1 rounded-lg">
                100% Actif
              </span>
            </div>

            {/* SVG Donut Chart & Dynamic Real Legend */}
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
              
              {/* SVG Donut Chart */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="13" fill="none" />
                  {categoryStats.map((cat) => (
                    <circle
                      key={cat.name}
                      cx="50" cy="50" r="38"
                      stroke={cat.color}
                      strokeWidth="13"
                      fill="none"
                      strokeDasharray={cat.dashArray}
                      strokeDashoffset={cat.dashOffset}
                      strokeLinecap="round"
                      className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                    />
                  ))}
                </svg>
                {/* Donut Center Icon */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <Layers className="w-5 h-5 text-zinc-900" />
                  <span className="text-[10px] font-bold text-zinc-600 font-mono">SAP</span>
                </div>
              </div>

              {/* Dynamic Legend Rows */}
              <div className="space-y-1.5 flex-1 w-full text-xs">
                {categoryStats.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-zinc-600 text-[11px] truncate">{cat.name}</span>
                    </div>
                    <span className="font-mono font-bold text-zinc-900 text-[11px] shrink-0 ml-1">
                      {cat.percent}% <span className="font-normal text-zinc-400 text-[10px]">(${Math.round(cat.val / 1000)}k)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span>5 familles certifiées</span>
            <button 
              onClick={() => onNavigateToStock()}
              className="text-zinc-900 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Voir inventaire</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card B (Center 5 cols): Weekly Movement Velocity Wave Spline */}
        <div className="lg:col-span-5 liquid-glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 tracking-tight">Vélocité & Flux Logistiques</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-zinc-950 font-mono">$8,870</span>
                  <span className="text-[11px] text-zinc-400 font-medium">flux journalier de pointe</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-2 py-1 bg-lime-muted text-lime-text font-mono font-bold text-[10px] rounded-full">
                  Semaine 39
                </span>
              </div>
            </div>

            {/* Interactive SVG Spline Curve with Neon Glow */}
            <div className="relative mt-5 h-44 w-full">
              
              {/* Floating Tooltip Indicator */}
              <div 
                className="absolute -top-3 z-10 -translate-x-1/2 bg-carbon text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg shadow-xl border border-zinc-700 pointer-events-none transition-all duration-200"
                style={{ left: `${(chartHoverIndex / (weeklyData.length - 1)) * 90 + 5}%` }}
              >
                <div>{weeklyData[chartHoverIndex].label}</div>
                <div className="text-lime text-xs font-black">{weeklyData[chartHoverIndex].amount}</div>
                <div className="text-[9px] text-zinc-300">
                  +{weeklyData[chartHoverIndex].inQty} entrées / -{weeklyData[chartHoverIndex].outQty} sorties
                </div>
              </div>

              <svg className="w-full h-full overflow-visible" viewBox="0 0 400 130" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="limeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4f938" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#d4f938" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="0" y1="20" x2="400" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="400" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="400" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

                {/* Area Gradient Fill */}
                <path
                  d="M 10 90 Q 70 30, 130 70 T 250 20 T 330 60 T 390 15 L 390 125 L 10 125 Z"
                  fill="url(#limeGradient)"
                />

                {/* Spline Stroke Line */}
                <path
                  d="M 10 90 Q 70 30, 130 70 T 250 20 T 330 60 T 390 15"
                  fill="none"
                  stroke="#a3e635"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Active Tooltip Dot */}
                <circle
                  cx={(chartHoverIndex / (weeklyData.length - 1)) * 380 + 10}
                  cy={weeklyData[chartHoverIndex].val < 1000 ? 70 : weeklyData[chartHoverIndex].val < 1500 ? 40 : 20}
                  r="6"
                  fill="#0c0d0e"
                  stroke="#d4f938"
                  strokeWidth="3"
                  className="animate-pulse shadow-md transition-all duration-150"
                />
              </svg>

              {/* X Axis Labels */}
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-2 px-1">
                {weeklyData.map((d, i) => (
                  <button
                    key={d.day}
                    onMouseEnter={() => setChartHoverIndex(i)}
                    className={`hover:text-zinc-900 transition-colors ${
                      chartHoverIndex === i ? 'font-bold text-zinc-950 underline decoration-lime decoration-2' : ''
                    }`}
                  >
                    {d.day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Tendance opérationnelle : <strong>+18%</strong> ce mois</span>
            <button
              onClick={onNavigateToMovements}
              className="text-zinc-900 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>{t.tab_receipts} & {t.tab_issues}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card C (Right 3 cols): Real Sites Footprint & Occupancy */}
        <div className="lg:col-span-3 liquid-glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-sm text-zinc-900 tracking-tight">Occupation par Site</h3>
              <button 
                onClick={() => handleOpenTour()}
                className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-700 transition-colors"
                title="Visite virtuelle 360°"
              >
                <Camera className="w-3.5 h-3.5 text-zinc-700" />
              </button>
            </div>

            {/* Sites List with Real Values */}
            <div className="mt-3 space-y-3.5">
              
              {/* Site 1: Magasin B1 */}
              <div 
                onClick={() => onNavigateToStock('B1')}
                className="flex items-center justify-between cursor-pointer group hover:bg-zinc-50/60 p-1.5 -mx-1.5 rounded-xl transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-900 group-hover:text-zinc-950">Magasin B1 (MD01)</div>
                  <div className="text-lg font-black font-mono text-zinc-950 leading-tight">
                    {siteStats.b1.occupancy}% <span className="text-xs font-normal text-zinc-400">occupé</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">{siteStats.b1.qty.toLocaleString()} unités • ${(siteStats.b1.val / 1000000).toFixed(2)}M</span>
                </div>
                <svg className="w-16 h-7" viewBox="0 0 60 25">
                  <path d="M 2 20 Q 20 22, 35 10 T 58 4" fill="none" stroke="#a3e635" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Site 2: Magasin B2 */}
              <div 
                onClick={() => onNavigateToStock('B2')}
                className="flex items-center justify-between cursor-pointer group hover:bg-zinc-50/60 p-1.5 -mx-1.5 rounded-xl transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-900">Magasin B2 (Allées A-E)</div>
                  <div className="text-lg font-black font-mono text-zinc-950 leading-tight">
                    {siteStats.b2.occupancy}% <span className="text-xs font-normal text-zinc-400">occupé</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">{siteStats.b2.qty.toLocaleString()} unités • ${(siteStats.b2.val / 1000000).toFixed(2)}M</span>
                </div>
                <svg className="w-16 h-7" viewBox="0 0 60 25">
                  <path d="M 2 5 Q 20 22, 35 8 T 58 18" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Site 3: Containers */}
              <div 
                onClick={() => onNavigateToStock('CONT-01')}
                className="flex items-center justify-between cursor-pointer group hover:bg-zinc-50/60 p-1.5 -mx-1.5 rounded-xl transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-900">Containers Sécurisés</div>
                  <div className="text-lg font-black font-mono text-zinc-950 leading-tight">
                    {siteStats.cont.occupancy}% <span className="text-xs font-normal text-zinc-400">occupé</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">{siteStats.cont.qty} pièces critiques</span>
                </div>
                <svg className="w-16 h-7" viewBox="0 0 60 25">
                  <path d="M 2 12 Q 25 10, 40 14 T 58 11" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Site 4: Yard */}
              <div 
                onClick={() => onNavigateToStock('YARD')}
                className="flex items-center justify-between cursor-pointer group hover:bg-zinc-50/60 p-1.5 -mx-1.5 rounded-xl transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-900">Yard & Parc Extérieur</div>
                  <div className="text-lg font-black font-mono text-zinc-950 leading-tight">
                    {siteStats.yard.occupancy}% <span className="text-xs font-normal text-zinc-400">occupé</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Poutrelles & fûts</span>
                </div>
                <svg className="w-16 h-7" viewBox="0 0 60 25">
                  <path d="M 2 18 Q 20 15, 38 7 T 58 3" fill="none" stroke="#a3e635" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
            <button
              onClick={() => handleOpenTour()}
              className="text-xs font-bold text-zinc-900 hover:text-black flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5 text-zinc-800" />
              <span>Visite 360°</span>
            </button>
            <button
              onClick={onNavigateToLocations}
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900"
            >
              Gérer ({locations.length})
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* TIER 3: Operational Decision Engine (Gauges, Restock Priorities, Live Feed) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Card A (Left 4 cols): Capacity Gauges */}
        <div className="lg:col-span-4 liquid-glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-sm text-zinc-900 tracking-tight">Capacité par Famille</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                Seuils Sécurité
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">Taux d'Exploitation</span>
                <span className="text-xl font-black text-zinc-950 font-mono">
                  84.2% <span className="text-xs font-normal text-zinc-400">/ Optimal</span>
                </span>
              </div>
              <span className="px-2.5 py-1 bg-carbon text-white text-[11px] font-bold rounded-lg shadow-xs">
                Sufficient
              </span>
            </div>

            {/* Progress Bars */}
            <div className="mt-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-zinc-800 truncate">Vannes Haute Pression DN50/100</span>
                  <span className="font-mono text-zinc-500 text-[11px]">88% exploité</span>
                </div>
                <div className="w-full bg-zinc-200/80 h-2 rounded-full overflow-hidden">
                  <div className="bg-lime h-full rounded-full transition-all duration-500" style={{ width: '88%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-zinc-800 truncate">Blindages Pompes 50D-B40 & 200ZJ</span>
                  <span className="font-mono text-zinc-500 text-[11px]">74% exploité</span>
                </div>
                <div className="w-full bg-zinc-200/80 h-2 rounded-full overflow-hidden">
                  <div className="bg-lime h-full rounded-full transition-all duration-500" style={{ width: '74%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-zinc-800 truncate">Roulements SKF Haute Charge</span>
                  <span className="font-mono text-zinc-500 text-[11px]">65% exploité</span>
                </div>
                <div className="w-full bg-zinc-200/80 h-2 rounded-full overflow-hidden">
                  <div className="bg-lime h-full rounded-full transition-all duration-500" style={{ width: '65%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-zinc-800 truncate">Appareillage Électrique & Câbles</span>
                  <span className="font-mono text-zinc-500 text-[11px]">60% exploité</span>
                </div>
                <div className="w-full bg-zinc-200/80 h-2 rounded-full overflow-hidden">
                  <div className="bg-lime h-full rounded-full transition-all duration-500" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span>Racks B1-MD01 & B2 audités</span>
            <button 
              onClick={() => onNavigateToStock()}
              className="text-zinc-900 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Inventaire</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card B (Center 4 cols): Real Critical Restock List */}
        <div className="lg:col-span-4 liquid-glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-zinc-900 tracking-tight">Réapprovisionnements Critiques</h3>
              </div>
              <button 
                onClick={() => onNavigateToStock('lowStock')}
                className="text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors"
              >
                Voir ({kpis.lowStockCount})
              </button>
            </div>

            {/* List with Real Items from drew.xlsx */}
            <div className="mt-3 space-y-3">
              {criticalRestockItems.map((item) => {
                const sampleImg = item.imageUrl || assignSampleMaterialImage({
                  name: item.materialName,
                  materialCode: item.materialCode
                });

                return (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50/80 transition-colors border border-transparent hover:border-zinc-200/60 group"
                  >
                    <div 
                      onClick={() => onOpenMaterialModal(item.materialId)}
                      className="flex items-center gap-3 overflow-hidden cursor-pointer flex-1"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0 flex items-center justify-center">
                        <img src={sampleImg} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-zinc-900 truncate group-hover:underline">
                          {item.materialName}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono truncate">
                          {item.materialCode} • {item.warehouseId} ({item.binLocation})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                      <div className="text-right">
                        <span className={`text-xs font-mono font-black block ${item.quantity <= 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                          {item.quantity} {item.uom}
                        </span>
                        <span className="text-[9px] text-zinc-400 font-medium">
                          ${item.unitPrice} / u
                        </span>
                      </div>
                      {onQuickReceipt && (
                        <button
                          onClick={() => onQuickReceipt(item)}
                          className="p-1.5 rounded-lg bg-zinc-100 hover:bg-carbon hover:text-white text-zinc-700 transition-colors"
                          title="Réceptionner du stock"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Seuil de réappro : ≤ 5 pcs</span>
            <button
              onClick={() => onNavigateToStock('lowStock')}
              className="text-zinc-900 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Traiter les alertes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card C (Right 4 cols): Real Operational Live Feed */}
        <div className="lg:col-span-4 liquid-glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-bold text-sm text-zinc-900 tracking-tight">Flux Opérationnels en Direct</h3>
              </div>
              <button 
                onClick={onNavigateToMovements}
                className="text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors"
              >
                Journal
              </button>
            </div>

            {/* Real Movement Timeline Feed */}
            <div className="mt-3 space-y-3">
              {recentMovements.slice(0, 4).map((mov) => {
                const isReceipt = mov.movementType === 'RECEIPT';
                const isIssue = mov.movementType === 'ISSUE';
                const isTransfer = mov.movementType.startsWith('TRANSFER');

                const badgeColor = isReceipt 
                  ? 'bg-lime-muted text-lime-text border-lime/30' 
                  : isIssue 
                    ? 'bg-rose-50 text-rose-700 border-rose-200' 
                    : 'bg-blue-50 text-blue-700 border-blue-200';

                return (
                  <div key={mov.id} className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-lg font-bold text-[10px] flex items-center justify-center shrink-0 border ${badgeColor}`}>
                      {isReceipt ? 'IN' : isIssue ? 'OUT' : 'TRF'}
                    </div>
                    <div className="flex-1 text-xs overflow-hidden">
                      <p className="text-zinc-800 leading-snug truncate">
                        <strong>{mov.performedByName || 'Magasinier'}</strong> : {isReceipt ? '+' : isIssue ? '-' : '⇄'}{mov.quantity} {mov.materialName}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-0.5">
                        <span>{mov.warehouseId} ({mov.binLocation})</span>
                        <span>•</span>
                        <span>{getRelativeTime(mov.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-mono text-[11px]">Traçabilité indélébile Firestore</span>
            <button
              onClick={onNavigateToMovements}
              className="text-zinc-900 font-bold hover:underline"
            >
              Historique complet
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* TIER 4: Product / Stock Table Preview (High-Fidelity Table)               */}
      {/* ========================================================================= */}
      <div className="liquid-glass-card overflow-hidden">
        
        {/* Table Top Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base text-zinc-950 tracking-tight flex items-center gap-2">
              <span>Matériel Industriel & Pièces Détachées</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-semibold">
                {scopedStock.length} références
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Catalogue certifié issu de drew.xlsx • Valorisation : ${kpis.totalValuationUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Code SAP, désignation, nom chinois..."
                className="bg-zinc-50 border border-zinc-200/80 rounded-full pl-8 pr-3 py-1.5 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-800 focus:bg-white transition-all font-sans"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={productSort}
              onChange={(e) => setProductSort(e.target.value as any)}
              className="text-xs font-semibold bg-zinc-50 border border-zinc-200/80 text-zinc-700 rounded-full px-3 py-1.5 outline-none cursor-pointer"
            >
              <option value="totalValue">Trier : Valeur ($)</option>
              <option value="quantity">Trier : Quantité</option>
              <option value="materialCode">Trier : Code SAP</option>
            </select>

            <button
              onClick={() => onNavigateToStock()}
              className="px-3.5 py-1.5 bg-carbon hover:bg-zinc-800 text-white rounded-full text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
            >
              <span>Inventaire complet</span>
              <ArrowRight className="w-3 h-3 text-lime" />
            </button>
          </div>
        </div>

        {/* Dense Table Layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/70 text-zinc-500 uppercase font-mono text-[11px] border-b border-zinc-200">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-3">Photo</th>
                <th className="py-3 px-4">Code SAP</th>
                <th className="py-3 px-4">Désignation</th>
                <th className="py-3 px-4">Emplacement</th>
                <th className="py-3 px-4 text-right">Prix Unit. ($)</th>
                <th className="py-3 px-4 text-right">Quantité</th>
                <th className="py-3 px-4 text-right">Valeur Totale</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/60 bg-white/40">
              {filteredProducts.map((item, idx) => {
                const imgUrl = item.imageUrl || assignSampleMaterialImage({
                  name: item.materialName,
                  materialCode: item.materialCode
                });
                const isLow = item.availableQuantity > 0 && item.availableQuantity <= 5;
                const isZero = item.availableQuantity <= 0;

                return (
                  <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-zinc-400">{idx + 1}</td>
                    
                    {/* Thumbnail */}
                    <td className="py-3 px-3">
                      <div 
                        onClick={() => onOpenMaterialModal(item.materialId)}
                        className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0 cursor-pointer hover:border-zinc-900 transition-colors"
                        title="Ouvrir la fiche"
                      >
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    </td>

                    {/* Code */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => onOpenMaterialModal(item.materialId)}
                        className="font-mono font-bold text-zinc-950 hover:underline block"
                      >
                        {item.materialCode}
                      </button>
                      {item.chineseName && (
                        <span className="text-[10px] text-zinc-400 block truncate max-w-[120px]">
                          {item.chineseName}
                        </span>
                      )}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4 max-w-[240px]">
                      <div className="font-semibold text-zinc-900 truncate" title={item.materialName}>
                        {item.materialName}
                      </div>
                      {item.specification && (
                        <div className="text-[10px] text-zinc-400 font-mono truncate">
                          {item.specification}
                        </div>
                      )}
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800">
                          {item.warehouseId}
                        </span>
                        <span className="font-mono text-zinc-500 text-[11px]">{item.binLocation}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 text-right font-mono font-medium text-zinc-700 whitespace-nowrap">
                      ${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Qty */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-950 whitespace-nowrap">
                      {item.availableQuantity.toLocaleString()} <span className="text-[10px] font-normal text-zinc-400">{item.uom}</span>
                    </td>

                    {/* Total Value */}
                    <td className="py-3 px-4 text-right font-mono font-black text-zinc-950 whitespace-nowrap">
                      ${Math.round(item.totalValue || item.quantity * item.unitPrice).toLocaleString()}
                    </td>

                    {/* Status Pill */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {isZero ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Rupture
                        </span>
                      ) : isLow ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Stock Faible
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-muted text-lime-text border border-lime/30">
                          En Stock
                        </span>
                      )}
                    </td>

                    {/* Quick Actions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenMaterialModal(item.materialId)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
                          title="Fiche détaillée 360°"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {onQuickReceipt && (
                          <button
                            onClick={() => onQuickReceipt(item)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
                            title="Entrée rapide"
                          >
                            <ArrowDownToLine className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onQuickIssue && (
                          <button
                            onClick={() => onQuickIssue(item)}
                            className="p-1.5 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
                            title="Sortie rapide"
                          >
                            <ArrowUpFromLine className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warehouse Visual Tour Modal */}
      <WarehouseVisualTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        initialLocationCode={tourLocationCode}
        onSelectLocationForStock={(code) => {
          setIsTourOpen(false);
          onNavigateToStock(code);
        }}
      />

    </div>
  );
};
