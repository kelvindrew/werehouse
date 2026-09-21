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
  Sparkles
} from 'lucide-react';
import { StockMovement, StorageLocation, StockItem } from '@shared/types/models';
import { WarehouseVisualTourModal } from './WarehouseVisualTourModal';

interface DashboardViewProps {
  onNavigateToStock: (filter?: string) => void;
  onNavigateToMovements: () => void;
  onOpenMaterialModal: (materialId: string) => void;
  onNavigateToLocations?: () => void;
  onOpenCreateLocation?: () => void;
  onQuickReceipt?: (item: StockItem) => void;
  onQuickIssue?: (item: StockItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToStock,
  onNavigateToMovements,
  onOpenMaterialModal,
  onNavigateToLocations,
  onOpenCreateLocation,
  onQuickReceipt,
  onQuickIssue,
}) => {
  const { t, selectedWarehouse } = useAuth();
  const [kpis, setKpis] = useState(() => dataService.getKpis());
  const [locations, setLocations] = useState<StorageLocation[]>(() => dataService.getLocations());
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>(() => dataService.getStockMovements().slice(0, 5));
  const [sampleProducts, setSampleProducts] = useState<StockItem[]>(() => dataService.getStock().slice(0, 6));
  
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
      setRecentMovements(dataService.getStockMovements().slice(0, 5));
      setSampleProducts(dataService.getStock());
    };
    const unsubscribe = dataService.subscribe(update);
    return () => unsubscribe();
  }, []);

  // Filtered sample products for bottom table
  const filteredProducts = useMemo(() => {
    let list = sampleProducts;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      list = list.filter(p => 
        p.materialCode.toLowerCase().includes(q) ||
        p.materialName.toLowerCase().includes(q) ||
        (p.chineseName && p.chineseName.toLowerCase().includes(q)) ||
        p.binLocation.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 5);
  }, [sampleProducts, productSearch]);

  // Weekly movement trend values (Mocked smoothly for interactive wave spline)
  const weeklyData = [
    { day: 'Dim', val: 520, label: 'Dimanche', amount: '$2,450' },
    { day: 'Lun', val: 940, label: 'Lundi', amount: '$4,120' },
    { day: 'Mar', val: 1280, label: 'Mardi', amount: '$5,890' },
    { day: 'Mer', val: 1674, label: 'Mercredi (Pic)', amount: '$8,870' },
    { day: 'Jeu', val: 1100, label: 'Jeudi', amount: '$4,980' },
    { day: 'Ven', val: 1450, label: 'Vendredi', amount: '$6,700' },
    { day: 'Sam', val: 780, label: 'Samedi', amount: '$3,200' },
  ];

  // Category breakdown for Donut Chart
  const categoryData = [
    { name: 'Robinetterie & Vannes', percent: 40, val: '$400,000', color: '#d4f938' }, // Lime
    { name: 'Pompes & Turbines', percent: 25, val: '$250,000', color: '#0c0d0e' },   // Carbon
    { name: 'Roulements & Guides', percent: 20, val: '$200,000', color: '#10b981' }, // Emerald
    { name: 'Câblage & Électrique', percent: 10, val: '$100,000', color: '#64748b' },// Slate
    { name: 'Outillage & Visserie', percent: 5, val: '$50,000', color: '#cbd5e1' },   // Light grey
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* ========================================================================= */}
      {/* TIER 1: 4 Key Stat Cards (Matching Reference Image Row 1)                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Products */}
        <div className="liquid-glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {t.kpi_total_items || 'Total Products'}
            </span>
            <button className="text-zinc-400 hover:text-zinc-700 p-1 rounded-full transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 font-mono tracking-tight">
              {kpis.totalItems.toLocaleString()}
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-lime-muted text-lime-text border border-lime/30 shadow-2xs">
              <TrendingUp className="w-3 h-3 text-lime-text" />
              <span>+6.53%</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-medium">
            {kpis.totalMaterials.toLocaleString()} références uniques
          </p>
        </div>

        {/* Card 2: Available Stock */}
        <div className="liquid-glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Stock Disponible
            </span>
            <button className="text-zinc-400 hover:text-zinc-700 p-1 rounded-full transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 font-mono tracking-tight">
              {kpis.totalUnits.toLocaleString()}
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
              <TrendingDown className="w-3 h-3 text-rose-600" />
              <span>-6.24%</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-medium font-mono">
            ${kpis.totalValuationUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })} valeur globale
          </p>
        </div>

        {/* Card 3: Low Stock */}
        <div 
          onClick={() => onNavigateToStock('lowStock')}
          className="liquid-glass-card p-5 relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>{t.low_stock_badge || 'Low Stock'}</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            </span>
            <button className="text-zinc-400 hover:text-zinc-700 p-1 rounded-full transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono tracking-tight">
              {kpis.lowStockCount}
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-lime-muted text-lime-text border border-lime/30 shadow-2xs">
              <TrendingUp className="w-3 h-3" />
              <span>+1.53%</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-medium">
            Articles avec stock ≤ 5 unités
          </p>
        </div>

        {/* Card 4: Out of Stock */}
        <div 
          onClick={() => onNavigateToStock()}
          className="liquid-glass-card p-5 relative overflow-hidden group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {t.out_of_stock_badge || 'Out of Stock'}
            </span>
            <button className="text-zinc-400 hover:text-zinc-700 p-1 rounded-full transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 font-mono tracking-tight">
              {kpis.recentlyUpdatedCount || 12}
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
              <TrendingDown className="w-3 h-3 text-rose-600" />
              <span>-1.95%</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-medium">
            Mouvements récents vérifiés
          </p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* TIER 2: 3 Analytics Cards (Donut Chart, Spline Wave, Traffic Sources)     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Card A (Left 4 cols): Profit / Stock by Category (Donut Chart) */}
        <div className="lg:col-span-4 liquid-glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-sm text-zinc-900 tracking-tight">Stock par Catégorie</h3>
              <select className="text-[11px] font-semibold bg-zinc-100 border border-zinc-200 text-zinc-600 rounded-md px-2 py-1 outline-none cursor-pointer">
                <option>Global (Annuel)</option>
                <option>Magasin B1</option>
                <option>Magasin B2</option>
              </select>
            </div>

            <div className="mt-4 text-center sm:text-left">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">Valorisation Totale</span>
              <span className="text-2xl font-black text-zinc-950 font-mono tracking-tight">
                ${kpis.totalValuationUSD.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>

            {/* Donut Graphic & Legend Breakdown */}
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
              
              {/* SVG Donut Chart */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="14" fill="none" />
                  {/* Segment 1: Lime 40% */}
                  <circle
                    cx="50" cy="50" r="38"
                    stroke="#d4f938" strokeWidth="14" fill="none"
                    strokeDasharray="95.5 238.7" strokeDashoffset="0"
                    strokeLinecap="round"
                    className="transition-all duration-500 hover:stroke-lime-light cursor-pointer"
                  />
                  {/* Segment 2: Carbon 25% */}
                  <circle
                    cx="50" cy="50" r="38"
                    stroke="#0c0d0e" strokeWidth="14" fill="none"
                    strokeDasharray="59.7 238.7" strokeDashoffset="-95.5"
                    strokeLinecap="round"
                    className="transition-all duration-500 hover:stroke-zinc-700 cursor-pointer"
                  />
                  {/* Segment 3: Emerald 20% */}
                  <circle
                    cx="50" cy="50" r="38"
                    stroke="#10b981" strokeWidth="14" fill="none"
                    strokeDasharray="47.7 238.7" strokeDashoffset="-155.2"
                    strokeLinecap="round"
                  />
                  {/* Segment 4: Slate 10% */}
                  <circle
                    cx="50" cy="50" r="38"
                    stroke="#64748b" strokeWidth="14" fill="none"
                    strokeDasharray="23.8 238.7" strokeDashoffset="-202.9"
                  />
                </svg>
                {/* Donut Center Icon */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <Layers className="w-5 h-5 text-zinc-900" />
                  <span className="text-[10px] font-bold text-zinc-600 font-mono">100%</span>
                </div>
              </div>

              {/* Legend rows */}
              <div className="space-y-1.5 flex-1 w-full text-xs">
                {categoryData.slice(0, 4).map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-zinc-600 text-[11px] truncate">{cat.name}</span>
                    </div>
                    <span className="font-mono font-bold text-zinc-900 text-[11px] shrink-0 ml-1">
                      {cat.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span>5 Catégories actives</span>
            <button 
              onClick={() => onNavigateToStock()}
              className="text-zinc-900 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Détails</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card B (Center 5 cols): Order / Movements Summary (Wave Spline Chart) */}
        <div className="lg:col-span-5 liquid-glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 tracking-tight">Flux & Mouvements</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-zinc-950 font-mono">$8,870</span>
                  <span className="text-[11px] text-zinc-400 font-medium">flux hebdomadaire</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-2 py-1 bg-lime-muted text-lime-text font-mono font-bold text-[10px] rounded-full">
                  Semaine 38
                </span>
              </div>
            </div>

            {/* Interactive SVG Spline Curve matching reference */}
            <div className="relative mt-5 h-44 w-full">
              
              {/* Floating Tooltip Indicator */}
              <div 
                className="absolute -top-3 z-10 -translate-x-1/2 bg-carbon text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg shadow-xl border border-zinc-700 pointer-events-none transition-all duration-200"
                style={{ left: `${(chartHoverIndex / (weeklyData.length - 1)) * 90 + 5}%` }}
              >
                <div>{weeklyData[chartHoverIndex].label}</div>
                <div className="text-lime text-xs font-black">{weeklyData[chartHoverIndex].amount}</div>
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
                  cx="250"
                  cy="20"
                  r="5.5"
                  fill="#0c0d0e"
                  stroke="#d4f938"
                  strokeWidth="3"
                  className="animate-pulse shadow-md"
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
            <span className="text-zinc-500">Tendance globale : <strong>+18%</strong> ce mois</span>
            <button
              onClick={onNavigateToMovements}
              className="text-zinc-900 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>{t.tab_receipts} & {t.tab_issues}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card C (Right 3 cols): Traffic Source / Sites Distribution (Mini Sparklines) */}
        <div className="lg:col-span-3 liquid-glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-sm text-zinc-900 tracking-tight">Répartition Magasins</h3>
              <button 
                onClick={() => handleOpenTour()}
                className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-700 transition-colors"
                title="Visite virtuelle 360°"
              >
                <Camera className="w-3.5 h-3.5 text-zinc-700" />
              </button>
            </div>

            {/* Sites List with Mini Sparklines */}
            <div className="mt-3 space-y-3.5">
              
              {/* Site 1: Magasin B1 */}
              <div 
                onClick={() => onNavigateToStock('B1')}
                className="flex items-center justify-between cursor-pointer group hover:bg-zinc-50/60 p-1.5 -mx-1.5 rounded-xl transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-900 group-hover:text-zinc-950">Magasin B1 (MD01)</div>
                  <div className="text-lg font-black font-mono text-zinc-950 leading-tight">42%</div>
                  <span className="text-[10px] text-zinc-400">40,681 unités</span>
                </div>
                {/* Rising Green Sparkline */}
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
                  <div className="text-xs font-bold text-zinc-900">Magasin B2 (Zones A-E)</div>
                  <div className="text-lg font-black font-mono text-zinc-950 leading-tight">35%</div>
                  <span className="text-[10px] text-zinc-400">57,949 unités</span>
                </div>
                {/* Dip Wave Sparkline */}
                <svg className="w-16 h-7" viewBox="0 0 60 25">
                  <path d="M 2 5 Q 20 22, 35 8 T 58 18" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Site 3: Containers 40ft */}
              <div 
                onClick={() => onNavigateToStock('CONT-01')}
                className="flex items-center justify-between cursor-pointer group hover:bg-zinc-50/60 p-1.5 -mx-1.5 rounded-xl transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-900">Conteneurs Sécurisés</div>
                  <div className="text-lg font-black font-mono text-zinc-950 leading-tight">15%</div>
                  <span className="text-[10px] text-zinc-400">12 conteneurs</span>
                </div>
                {/* Steady Amber Sparkline */}
                <svg className="w-16 h-7" viewBox="0 0 60 25">
                  <path d="M 2 12 Q 25 10, 40 14 T 58 11" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Site 4: Cour extérieure / Yard */}
              <div 
                onClick={() => onNavigateToStock('YARD')}
                className="flex items-center justify-between cursor-pointer group hover:bg-zinc-50/60 p-1.5 -mx-1.5 rounded-xl transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-900">Yard & Zone Extérieure</div>
                  <div className="text-lg font-black font-mono text-zinc-950 leading-tight">8%</div>
                  <span className="text-[10px] text-zinc-400">Palettes & outillage lourd</span>
                </div>
                {/* Soft lime upward sparkline */}
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
      {/* TIER 3: 3 Operational Cards (Stock Level, Upcoming Restock, Recent Feed)  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Card A (Left 4 cols): Stock Level Gauges */}
        <div className="lg:col-span-4 liquid-glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-sm text-zinc-900 tracking-tight">Niveaux de Remplissage</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                MD01 / Global
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 block">Capacité Exploité</span>
                <span className="text-xl font-black text-zinc-950 font-mono">
                  84% <span className="text-xs font-normal text-zinc-400">/ 100k m³</span>
                </span>
              </div>
              <span className="px-2.5 py-1 bg-carbon text-white text-[11px] font-bold rounded-lg shadow-xs">
                Optimal
              </span>
            </div>

            {/* Material Family Progress Bars */}
            <div className="mt-5 space-y-4">
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-zinc-800 truncate">Vannes & Robinets DN50</span>
                  <span className="font-mono text-zinc-500 text-[11px]">75 / 110 dispo</span>
                </div>
                <div className="w-full bg-zinc-200/80 h-2 rounded-full overflow-hidden">
                  <div className="bg-lime h-full rounded-full transition-all duration-500" style={{ width: '68%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-zinc-800 truncate">Roulements SKF Haute Charge</span>
                  <span className="font-mono text-zinc-500 text-[11px]">50 / 80 dispo</span>
                </div>
                <div className="w-full bg-zinc-200/80 h-2 rounded-full overflow-hidden">
                  <div className="bg-lime h-full rounded-full transition-all duration-500" style={{ width: '62%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-zinc-800 truncate">Pompes Centrifuges & Inserts</span>
                  <span className="font-mono text-zinc-500 text-[11px]">40 / 80 dispo</span>
                </div>
                <div className="w-full bg-zinc-200/80 h-2 rounded-full overflow-hidden">
                  <div className="bg-lime h-full rounded-full transition-all duration-500" style={{ width: '50%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-zinc-800 truncate">Connectique & Armoires Force</span>
                  <span className="font-mono text-zinc-500 text-[11px]">60 / 100 dispo</span>
                </div>
                <div className="w-full bg-zinc-200/80 h-2 rounded-full overflow-hidden">
                  <div className="bg-lime h-full rounded-full transition-all duration-500" style={{ width: '60%' }} />
                </div>
              </div>

            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span>Racks B1-MD01 conformes</span>
            <button 
              onClick={() => onNavigateToStock()}
              className="text-zinc-900 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Inventaire</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card B (Center 4.5 cols): Upcoming Restock / Operations */}
        <div className="lg:col-span-4 liquid-glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-sm text-zinc-900 tracking-tight">Prochains Mouvements</h3>
              <button 
                onClick={onNavigateToMovements}
                className="text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors"
              >
                Voir Tout ({recentMovements.length})
              </button>
            </div>

            {/* List with item thumbnails */}
            <div className="mt-3 space-y-3">
              {sampleProducts.slice(0, 4).map((prod, idx) => {
                const sampleImg = prod.imageUrl || assignSampleMaterialImage({
                  name: prod.materialName,
                  materialCode: prod.materialCode
                });

                return (
                  <div 
                    key={prod.id}
                    onClick={() => onOpenMaterialModal(prod.materialId)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50/80 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0 flex items-center justify-center">
                        <img src={sampleImg} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-zinc-900 truncate group-hover:underline">
                          {prod.materialName}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {prod.materialCode} • {prod.warehouseId}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <span className="text-xs font-mono font-black text-zinc-900 block">
                        {prod.quantity} {prod.uom}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {idx % 2 === 0 ? 'Réception B1' : 'Contrôle Yard'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Mouvements validés SAP</span>
            <button
              onClick={onNavigateToMovements}
              className="text-zinc-900 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Registre complet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card C (Right 3.5 cols): Recent Activity Feed */}
        <div className="lg:col-span-4 liquid-glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h3 className="font-bold text-sm text-zinc-900 tracking-tight">Activité Récente</h3>
              <button className="text-zinc-400 hover:text-zinc-700 p-1 rounded-full transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Timeline Feed */}
            <div className="mt-3 space-y-3.5">
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-lime-muted text-lime-text font-bold text-xs flex items-center justify-center shrink-0 border border-lime/30">
                  ML
                </div>
                <div className="flex-1 text-xs">
                  <p className="text-zinc-800 leading-snug">
                    <strong>Mario L.</strong> a validé une sortie de 12 vannes DN50 pour l'atelier mécanique.
                  </p>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">Il y a 15 min</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-200">
                  AM
                </div>
                <div className="flex-1 text-xs">
                  <p className="text-zinc-800 leading-snug">
                    <strong>Alain M.</strong> a réceptionné 25 roulements SKF au quai B1.
                  </p>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">Il y a 1h</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                  KL
                </div>
                <div className="flex-1 text-xs">
                  <p className="text-zinc-800 leading-snug">
                    <strong>Landry K.</strong> a effectué un transfert inter-sites B1 ➔ Container C2.
                  </p>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">Il y a 3h</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-200">
                  SY
                </div>
                <div className="flex-1 text-xs">
                  <p className="text-zinc-800 leading-snug">
                    <strong>Système</strong> : Synchronisation de 98,630 lignes de stock Excel terminée.
                  </p>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">Aujourd'hui, 08:30</span>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-mono text-[11px]">Audit traçabilité actif</span>
            <button
              onClick={() => onNavigateToStock()}
              className="text-zinc-900 font-bold hover:underline"
            >
              Historique
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* TIER 4: Product / Stock Table Preview (Matching Reference Image Row 4)    */}
      {/* ========================================================================= */}
      <div className="liquid-glass-card overflow-hidden">
        
        {/* Table Top Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base text-zinc-950 tracking-tight flex items-center gap-2">
              <span>Matériel en Stock</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-semibold">
                {kpis.totalItems} articles
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Consultez et opérez en direct sur les stocks des magasins B1, B2 et conteneurs
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search input in table */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Rechercher code, nom..."
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
              <span>Voir tout</span>
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
                <th className="py-3 px-4 text-right">Prix Unit.</th>
                <th className="py-3 px-4 text-right">Quantité</th>
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
                          title="Fiche détaillée"
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
