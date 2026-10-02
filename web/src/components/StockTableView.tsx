import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import { StockItem, StorageLocation } from '@shared/types/models';
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp,
  ArrowDown,
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowLeftRight, 
  Eye, 
  EyeOff,
  Download,
  AlertTriangle, 
  AlertCircle,
  CheckCircle2,
  ChevronLeft, 
  ChevronRight, 
  Package, 
  Share2, 
  MapPin, 
  Filter, 
  QrCode, 
  Scan, 
  Tablet, 
  X, 
  Camera, 
  LayoutGrid, 
  Table as TableIcon,
  RotateCcw,
  SlidersHorizontal,
  Copy,
  Check
} from 'lucide-react';
import { SharedLinkFilters } from '@shared/types/models';
import { AutocompleteInput } from './AutocompleteInput';
import { StockHoverCard } from './StockHoverCard';
import { MaterialVisualTourModal } from './MaterialVisualTourModal';
import { useResponsiveViewMode } from '../hooks/useResponsiveViewMode';
import { ViewModeSwitcher } from './ViewModeSwitcher';
import { MobileTableNotice } from './MobileTableNotice';

interface StockTableViewProps {
  onOpenMaterialModal: (materialId: string) => void;
  onQuickReceipt: (item: StockItem) => void;
  onQuickIssue: (item: StockItem) => void;
  onQuickTransfer: (item: StockItem) => void;
  initialFilter?: string;
  onOpenShareModal?: (filters?: Partial<SharedLinkFilters>) => void;
  isTabletMode?: boolean;
  onOpenLabelModal?: (item: StockItem) => void;
}

type SortField = 'materialCode' | 'materialName' | 'warehouseId' | 'binLocation' | 'quantity' | 'totalValue';
type SortOrder = 'asc' | 'desc';
type StockLevelFilter = 'ALL' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'NORMAL_STOCK';

/**
 * Double-encoding accessible stock status helper.
 * Provides explicit text label, vector icon, and color contrast.
 */
export function getStockStatus(item: StockItem): {
  level: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'NORMAL_STOCK';
  label: string;
  shortLabel: string;
  badgeClass: string;
  tableBadgeClass: string;
  icon: React.ComponentType<{ className?: string }>;
} {
  const qty = item.availableQuantity !== undefined ? item.availableQuantity : item.quantity;
  if (qty <= 0) {
    return {
      level: 'OUT_OF_STOCK',
      label: 'Rupture (0)',
      shortLabel: 'Rupture',
      badgeClass: 'bg-rose-50 text-rose-800 border border-rose-200 ring-1 ring-rose-200/50',
      tableBadgeClass: 'bg-rose-50 text-rose-800 border border-rose-200',
      icon: AlertCircle
    };
  }
  if (qty <= 5) {
    return {
      level: 'LOW_STOCK',
      label: 'Stock bas (≤ 5)',
      shortLabel: 'Stock bas',
      badgeClass: 'bg-amber-50 text-amber-900 border border-amber-200 ring-1 ring-amber-200/50',
      tableBadgeClass: 'bg-amber-50 text-amber-900 border border-amber-200',
      icon: AlertTriangle
    };
  }
  return {
    level: 'NORMAL_STOCK',
    label: 'Normal (> 5)',
    shortLabel: 'Normal',
    badgeClass: 'bg-emerald-50 text-emerald-900 border border-emerald-200 ring-1 ring-emerald-200/50',
    tableBadgeClass: 'bg-emerald-50 text-emerald-900 border border-emerald-200',
    icon: CheckCircle2
  };
}

interface StockThumbnailProps {
  imageUrl?: string;
  materialCode: string;
  onClick: () => void;
  title?: string;
  size?: 'card' | 'table';
}

export const StockThumbnail: React.FC<StockThumbnailProps> = ({
  imageUrl,
  materialCode,
  onClick,
  title,
  size = 'card'
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  if (size === 'table') {
    return (
      <div
        onClick={onClick}
        className="w-8 h-8 min-w-[32px] max-w-[32px] min-h-[32px] max-h-[32px] aspect-square rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-zinc-900 transition-colors group/item relative"
        title={title || "Agrandir / Visite visuelle"}
        role="button"
        tabIndex={0}
        aria-label={`Photo de ${materialCode}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {imageUrl && !hasError ? (
          <img
            src={imageUrl}
            alt={materialCode}
            loading="lazy"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-200"
          />
        ) : (
          <Package className="w-3.5 h-3.5 text-zinc-400 stroke-[1.8]" />
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="w-12 h-12 sm:w-14 sm:h-14 min-w-[48px] sm:min-w-[56px] max-w-[48px] sm:max-w-[56px] min-h-[48px] sm:min-h-[56px] max-h-[48px] sm:max-h-[56px] aspect-square rounded-2xl bg-zinc-100 border border-zinc-200/90 shadow-2xs flex items-center justify-center overflow-hidden shrink-0 cursor-pointer relative group/thumb hover:border-zinc-950 transition-colors"
      title={title || "Visite Visuelle / Agrandir"}
      tabIndex={0}
      role="button"
      aria-label={`Photo de ${materialCode}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {imageUrl && !hasError ? (
        <img
          src={imageUrl}
          alt={materialCode}
          loading="lazy"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-200"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-zinc-400">
          <Package className="w-6 h-6 stroke-[1.8]" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <Camera className="w-3.5 h-3.5 text-white" />
      </div>
    </div>
  );
};

export const StockTableView: React.FC<StockTableViewProps> = ({
  onOpenMaterialModal,
  onQuickReceipt,
  onQuickIssue,
  onQuickTransfer,
  initialFilter,
  onOpenShareModal,
  isTabletMode = false,
  onOpenLabelModal,
}) => {
  const { selectedWarehouse, setSelectedWarehouse, canOperateStock, t } = useAuth();
  
  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [binFilter, setBinFilter] = useState('');
  const [uomFilter, setUomFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [locationTypeFilter, setLocationTypeFilter] = useState('ALL');
  
  // Explicit stock level filter: 'ALL' | 'OUT_OF_STOCK' | 'LOW_STOCK' | 'NORMAL_STOCK'
  const [stockLevelFilter, setStockLevelFilter] = useState<StockLevelFilter>(() => {
    if (initialFilter === 'lowStock') return 'LOW_STOCK';
    if (initialFilter === 'outOfStock') return 'OUT_OF_STOCK';
    return 'ALL';
  });

  // Financial values privacy toggle
  const [hideFinancialValues, setHideFinancialValues] = useState<boolean>(() => {
    try {
      return localStorage.getItem('wms_hide_financials') === 'true';
    } catch {
      return false;
    }
  });

  // Feedback for code copied
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Sorting state (default by totalValue descending)
  const [sortField, setSortField] = useState<SortField>('totalValue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Responsive View Mode ('cards' vs 'table')
  const [viewMode, handleSetViewMode] = useResponsiveViewMode('wms_stock_view_mode');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Material Visual Tour Modal state
  const [isMaterialTourOpen, setIsMaterialTourOpen] = useState(false);
  const [tourMaterialId, setTourMaterialId] = useState<string | undefined>(undefined);

  const handleOpenMaterialTour = (item?: StockItem) => {
    if (item) {
      setTourMaterialId(item.materialId);
    } else {
      setTourMaterialId(undefined);
    }
    setIsMaterialTourOpen(true);
  };

  // Base Data
  const [locations, setLocations] = useState<StorageLocation[]>(() => dataService.getLocations());
  const [stockItems, setStockItems] = useState<StockItem[]>(() => 
    dataService.getStock({ warehouseId: selectedWarehouse })
  );

  useEffect(() => {
    const update = () => {
      setLocations(dataService.getLocations());
      setStockItems(dataService.getStock({ warehouseId: selectedWarehouse }));
    };
    const unsubscribe = dataService.subscribe(update);
    return () => unsubscribe();
  }, [selectedWarehouse]);

  // Hardware Barcode Douchette Listener
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 130) {
        buffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 2) {
          e.preventDefault();
          const scanned = buffer.trim();
          setLastScannedCode(scanned);
          setTimeout(() => setLastScannedCode(null), 4000);

          // Find matching material
          const match = stockItems.find(s => 
            s.materialCode.toLowerCase() === scanned.toLowerCase() ||
            s.binLocation.toLowerCase() === scanned.toLowerCase()
          );
          if (match) {
            onOpenMaterialModal(match.materialId);
          } else {
            setSearchTerm(scanned);
          }
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stockItems, onOpenMaterialModal]);

  // Extract distinct UOMs for filter dropdown
  const distinctUoms = useMemo(() => {
    const set = new Set<string>();
    stockItems.forEach(s => {
      if (s.uom) set.add(s.uom);
    });
    return Array.from(set).sort();
  }, [stockItems]);

  // Extract distinct categories
  const distinctCategories = useMemo(() => {
    return dataService.getMaterialCategories();
  }, [stockItems]);

  // Level counts within current warehouse context (for interactive legend)
  const stockCountsByLevel = useMemo(() => {
    let outCount = 0;
    let lowCount = 0;
    let normalCount = 0;

    stockItems.forEach(item => {
      const qty = item.availableQuantity !== undefined ? item.availableQuantity : item.quantity;
      if (qty <= 0) outCount++;
      else if (qty <= 5) lowCount++;
      else normalCount++;
    });

    return { outCount, lowCount, normalCount };
  }, [stockItems]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = dataService.getStock({
      warehouseId: selectedWarehouse,
      locationType: locationTypeFilter !== 'ALL' ? locationTypeFilter : undefined,
      search: searchTerm,
      binLocation: binFilter,
      uom: uomFilter || undefined,
      category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
      stockLevel: stockLevelFilter !== 'ALL' ? stockLevelFilter : undefined,
    });

    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        return sortOrder === 'asc' 
          ? (valA || '').localeCompare(valB || '') 
          : (valB || '').localeCompare(valA || '');
      }

      const numA = Number(valA) || 0;
      const numB = Number(valB) || 0;
      return sortOrder === 'asc' ? numA - numB : numB - numA;
    });

    return result;
  }, [
    selectedWarehouse, 
    locationTypeFilter, 
    searchTerm, 
    binFilter, 
    uomFilter, 
    categoryFilter, 
    stockLevelFilter, 
    sortField, 
    sortOrder, 
    stockItems
  ]);

  // Pagination slice
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // Numerical fields default to descending, textual to ascending
      setSortOrder(field === 'quantity' || field === 'totalValue' ? 'desc' : 'asc');
    }
    setCurrentPage(1);
  };

  const handleExport = () => {
    dataService.exportStockToExcel(selectedWarehouse);
  };

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleFinancials = () => {
    setHideFinancialValues(prev => {
      const next = !prev;
      try {
        localStorage.setItem('wms_hide_financials', String(next));
      } catch {}
      return next;
    });
  };

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm, 
    binFilter, 
    uomFilter, 
    categoryFilter, 
    stockLevelFilter, 
    locationTypeFilter, 
    selectedWarehouse
  ]);

  // Check if any filter is active
  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    selectedWarehouse !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    stockLevelFilter !== 'ALL' ||
    binFilter.trim() ||
    uomFilter ||
    locationTypeFilter !== 'ALL'
  );

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedWarehouse('ALL');
    setCategoryFilter('ALL');
    setStockLevelFilter('ALL');
    setBinFilter('');
    setUomFilter('');
    setLocationTypeFilter('ALL');
    setCurrentPage(1);
  };

  const totalValuationUSD = filteredItems.reduce((acc, s) => acc + s.totalValue, 0);
  const totalArticlesInWarehouse = stockItems.length;

  return (
    <div className="space-y-4 pb-28">
      {/* ========================================================================= */}
      {/* 1. HEADER BAR : TITLE, METRICS & TOP ACTIONS                             */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">{t.stock_table_title || 'Tableau de Stock'}</h2>
          
          {/* Dual Article Count: Filtered results vs Total available */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mt-0.5">
            <span className="font-bold text-zinc-900 font-mono">
              {filteredItems.length.toLocaleString()} {t.results_count || 'résultat(s)'}
            </span>
            <span className="text-zinc-400">/</span>
            <span>
              {totalArticlesInWarehouse.toLocaleString()} {t.total_items_count || 'articles au total'}
            </span>
            <span className="text-zinc-400 hidden sm:inline">—</span>
            <span className="hidden sm:inline">{t.total_stock_value_label || 'Valeur totale du stock'} :</span>
            <span className="text-zinc-900 font-mono font-bold">
              {hideFinancialValues 
                ? '••••••••' 
                : `$${totalValuationUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`}
            </span>
            {hasActiveFilters && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                Filtré ({Math.round((filteredItems.length / (totalArticlesInWarehouse || 1)) * 100)}%)
              </span>
            )}
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Toggle Financial Values Visibility */}
          <button
            type="button"
            onClick={toggleFinancials}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
              hideFinancialValues
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-300 shadow-2xs'
            }`}
            title={hideFinancialValues ? "Afficher les montants financiers" : "Masquer les montants financiers pour discrétion en atelier"}
          >
            {hideFinancialValues ? <EyeOff className="w-3.5 h-3.5 text-zinc-300" /> : <Eye className="w-3.5 h-3.5 text-zinc-600" />}
            <span className="hidden md:inline">{hideFinancialValues ? 'Valeurs masquées' : 'Valeurs visibles'}</span>
          </button>

          {/* Visual Tour / Photos Modal */}
          <button
            type="button"
            onClick={() => handleOpenMaterialTour()}
            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-colors active:scale-95"
            title={t.btn_material_tour || "Galerie Visuelle"}
          >
            <Camera className="w-3.5 h-3.5 text-zinc-300" />
            <span className="hidden sm:inline">{t.btn_material_tour || "Galerie Photos"}</span>
          </button>

          {/* Share View Modal */}
          {onOpenShareModal && (
            <button
              type="button"
              onClick={() => onOpenShareModal({
                warehouseId: selectedWarehouse as any,
                searchQuery: searchTerm || undefined,
                binLocation: binFilter || undefined,
                category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
                status: stockLevelFilter === 'LOW_STOCK' ? 'LOW_STOCK' : stockLevelFilter === 'OUT_OF_STOCK' ? 'OUT_OF_STOCK' : 'ALL'
              })}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-zinc-800 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors border border-zinc-300 shadow-2xs active:scale-95"
              title={t.btn_share_this_view || "Partager cette vue"}
            >
              <Share2 className="w-3.5 h-3.5 text-zinc-600" />
              <span className="hidden sm:inline">{t.btn_share_this_view || "Partager"}</span>
            </button>
          )}

          {/* Export Excel */}
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-zinc-800 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors border border-zinc-300 shadow-2xs active:scale-95"
            title={t.btn_export_excel || "Exporter le tableau vers Excel"}
          >
            <Download className="w-3.5 h-3.5 text-zinc-600" />
            <span className="hidden sm:inline">{t.btn_export_excel || "Excel"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STOCK STATUS THRESHOLDS LEGEND & QUICK FILTER BAR                     */}
      {/* ========================================================================= */}
      <div className="bg-zinc-50/90 border border-zinc-200/90 rounded-2xl p-3 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 shadow-2xs">
        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
          <span className="font-bold text-zinc-800 text-[11px] uppercase tracking-wider font-mono">
            {t.stock_legend_title || 'Seuils de stock :'}
          </span>
        </div>

        {/* Interactive Threshold Legend Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Rupture */}
          <button
            type="button"
            onClick={() => setStockLevelFilter(prev => prev === 'OUT_OF_STOCK' ? 'ALL' : 'OUT_OF_STOCK')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all border active:scale-95 ${
              stockLevelFilter === 'OUT_OF_STOCK'
                ? 'bg-rose-700 text-white border-rose-700 shadow-xs ring-2 ring-rose-300'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-200'
            }`}
            title="Cliquer pour afficher uniquement les articles en rupture"
          >
            <AlertCircle className={`w-3.5 h-3.5 ${stockLevelFilter === 'OUT_OF_STOCK' ? 'text-white' : 'text-rose-600'}`} />
            <span>Rupture : 0</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              stockLevelFilter === 'OUT_OF_STOCK' ? 'bg-white/20 text-white' : 'bg-rose-200/80 text-rose-900'
            }`}>
              {stockCountsByLevel.outCount}
            </span>
          </button>

          {/* Stock bas */}
          <button
            type="button"
            onClick={() => setStockLevelFilter(prev => prev === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all border active:scale-95 ${
              stockLevelFilter === 'LOW_STOCK'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-300'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
            }`}
            title="Cliquer pour afficher les articles en stock bas (1 à 5 unités)"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${stockLevelFilter === 'LOW_STOCK' ? 'text-white' : 'text-amber-600'}`} />
            <span>Stock bas : 1 à 5</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              stockLevelFilter === 'LOW_STOCK' ? 'bg-white/20 text-white' : 'bg-amber-200/80 text-amber-900'
            }`}>
              {stockCountsByLevel.lowCount}
            </span>
          </button>

          {/* Stock normal */}
          <button
            type="button"
            onClick={() => setStockLevelFilter(prev => prev === 'NORMAL_STOCK' ? 'ALL' : 'NORMAL_STOCK')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all border active:scale-95 ${
              stockLevelFilter === 'NORMAL_STOCK'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-300'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
            }`}
            title="Cliquer pour afficher les articles avec stock suffisant (> 5 unités)"
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${stockLevelFilter === 'NORMAL_STOCK' ? 'text-white' : 'text-emerald-600'}`} />
            <span>Normal : &gt; 5</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
              stockLevelFilter === 'NORMAL_STOCK' ? 'bg-white/20 text-white' : 'bg-emerald-200/80 text-emerald-900'
            }`}>
              {stockCountsByLevel.normalCount}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SEARCH & ADVANCED FILTERS PANEL                                       */}
      {/* ========================================================================= */}
      <div className="liquid-glass-card p-4 sm:p-5 space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3">
          {/* Universal Multi-Field Search (Ref, Name, Warehouse, Bin, Specs) */}
          <div className="md:col-span-4 relative">
            <AutocompleteInput
              field="materialName"
              placeholder={t.search_placeholder || "Rechercher par référence, désignation, entrepôt, casier..."}
              value={searchTerm}
              onChange={setSearchTerm}
              icon={<Search className="w-4 h-4 text-zinc-400" />}
            />
          </div>

          {/* Warehouse / Site Filter */}
          <div className="md:col-span-3">
            <select
              aria-label={t.col_warehouse || "Entrepôt"}
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-xs text-zinc-800 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-950 font-medium"
            >
              <option value="ALL">{t.all_sites_and_warehouses || 'Tous les magasins & sites'}</option>
              <optgroup label={t.main_warehouses_group || 'Magasins Principaux'}>
                <option value="B1">B1 (MD01)</option>
                <option value="B2">B2 (Zones A-E)</option>
              </optgroup>
              <optgroup label={t.containers_and_sites_group || 'Conteneurs & Chantiers'}>
                {locations.filter(l => l.code !== 'B1' && l.code !== 'B2').map(loc => (
                  <option key={loc.id} value={loc.code}>
                    {loc.code} — {loc.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2">
            <select
              aria-label={t.category_filter_label || "Catégorie d'article"}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-xs text-zinc-800 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-950 font-medium"
            >
              <option value="ALL">{t.all_categories || 'Toutes catégories'}</option>
              {distinctCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Level Dropdown Filter */}
          <div className="md:col-span-2">
            <select
              aria-label="Niveau de stock"
              value={stockLevelFilter}
              onChange={(e) => setStockLevelFilter(e.target.value as StockLevelFilter)}
              className="w-full bg-white border border-zinc-300 text-xs text-zinc-800 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-950 font-medium"
            >
              <option value="ALL">Tous les niveaux</option>
              <option value="OUT_OF_STOCK">Rupture (0)</option>
              <option value="LOW_STOCK">Stock bas (≤ 5)</option>
              <option value="NORMAL_STOCK">Stock normal (&gt; 5)</option>
            </select>
          </div>

          {/* Granular Sub-location / BIN input */}
          <div className="md:col-span-1">
            <AutocompleteInput
              field="binLocation"
              placeholder="Casier..."
              value={binFilter}
              onChange={setBinFilter}
              uppercase
              fontMono
            />
          </div>
        </div>

        {/* ===================================================================== */}
        {/* ACTIVE FILTERS CHIPS STRIP & CONTROLS TOOLBAR                          */}
        {/* ===================================================================== */}
        <div className="pt-2.5 border-t border-zinc-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          {/* Active filter chips (visible and easy to remove) */}
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            {hasActiveFilters ? (
              <>
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-mono mr-1">
                  Filtres actifs :
                </span>

                {/* Search Term Chip */}
                {searchTerm.trim() && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-300">
                    <span>Recherche : « {searchTerm} »</span>
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="p-0.5 hover:text-zinc-950 rounded-full cursor-pointer"
                      aria-label="Supprimer le filtre de recherche"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Warehouse Chip */}
                {selectedWarehouse !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                    <span>Entrepôt : {selectedWarehouse}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedWarehouse('ALL')}
                      className="p-0.5 hover:text-blue-950 rounded-full cursor-pointer"
                      aria-label="Supprimer le filtre entrepôt"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Category Chip */}
                {categoryFilter !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                    <span>Catégorie : {categoryFilter}</span>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter('ALL')}
                      className="p-0.5 hover:text-purple-950 rounded-full cursor-pointer"
                      aria-label="Supprimer le filtre catégorie"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Stock Level Chip */}
                {stockLevelFilter !== 'ALL' && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    stockLevelFilter === 'OUT_OF_STOCK'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : stockLevelFilter === 'LOW_STOCK'
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    <span>
                      {stockLevelFilter === 'OUT_OF_STOCK' ? 'Rupture' : stockLevelFilter === 'LOW_STOCK' ? 'Stock bas' : 'Normal'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setStockLevelFilter('ALL')}
                      className="p-0.5 hover:opacity-100 rounded-full cursor-pointer"
                      aria-label="Supprimer le filtre niveau"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Bin Location Chip */}
                {binFilter.trim() && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-300 font-mono">
                    <span>Casier : {binFilter}</span>
                    <button
                      type="button"
                      onClick={() => setBinFilter('')}
                      className="p-0.5 hover:text-zinc-950 rounded-full cursor-pointer"
                      aria-label="Supprimer le filtre casier"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* UOM Chip */}
                {uomFilter && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-300 font-mono">
                    <span>Unité : {uomFilter}</span>
                    <button
                      type="button"
                      onClick={() => setUomFilter('')}
                      className="p-0.5 hover:text-zinc-950 rounded-full cursor-pointer"
                      aria-label="Supprimer le filtre unité"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Single-Click Reset All Filters Button */}
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 transition-colors ml-1 active:scale-95 cursor-pointer"
                  title="Réinitialiser tous les filtres actifs"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t.clear_all_filters || 'Tout effacer'}</span>
                </button>
              </>
            ) : (
              <span className="text-zinc-400 text-xs italic">
                Aucun filtre actif (affichage complet)
              </span>
            )}
          </div>

          {/* Right Toolbar: Quick Sorting Dropdown & View Mode Switcher */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
            {/* Quick Sort Selector (Available for both Cards and Table) */}
            <div className="flex items-center gap-1 bg-white border border-zinc-200/90 rounded-full px-2.5 py-1 shadow-2xs">
              <span className="text-[11px] text-zinc-500 font-semibold hidden lg:inline">Trier :</span>
              <select
                aria-label="Trier la liste"
                value={sortField}
                onChange={(e) => {
                  setSortField(e.target.value as SortField);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-zinc-900 font-bold focus:outline-none cursor-pointer"
              >
                <option value="totalValue">Valeur totale</option>
                <option value="quantity">Quantité</option>
                <option value="materialCode">Référence</option>
                <option value="materialName">Désignation</option>
                <option value="warehouseId">Entrepôt</option>
                <option value="binLocation">Emplacement</option>
              </select>

              <button
                type="button"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-zinc-600 hover:text-zinc-950 rounded-full hover:bg-zinc-100 transition-colors"
                title={sortOrder === 'asc' ? 'Ordre croissant (cliquer pour décroissant)' : 'Ordre décroissant (cliquer pour croissant)'}
                aria-label="Inverser l'ordre de tri"
              >
                {sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-zinc-900" /> : <ArrowDown className="w-3 h-3 text-zinc-900" />}
              </button>
            </div>

            {/* View Mode Switcher (Cards vs Compact Table) */}
            <ViewModeSwitcher
              viewMode={viewMode}
              onChange={handleSetViewMode}
              cardsLabel={t.btn_cards || 'Cartes'}
              tableLabel={t.btn_table || 'Tableau'}
              showMobileLabel={false}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN CONTENT AREA : TACTILE CARDS OR COMPACT TABLE VIEW               */}
      {/* ========================================================================= */}
      <div className="liquid-glass-card overflow-hidden">
        
        {/* ======================================================================= */}
        {/* 4A. TACTILE CARDS VIEW (CLEAN, WEIGHTED & NON-REPETITIVE)               */}
        {/* ======================================================================= */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 p-3.5 bg-zinc-50/50">
            {paginatedItems.map((item) => {
              const status = getStockStatus(item);

              return (
                <div 
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-zinc-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:border-zinc-300 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  {/* Top: Squircle Vignette + Material Reference + Full Name */}
                  <div>
                    <div className="flex items-start gap-3">
                      {/* Harmonized Squircle Vignette with strictly constrained dimensions and robust image fallback */}
                      <StockThumbnail
                        imageUrl={item.imageUrl}
                        materialCode={item.materialCode}
                        onClick={() => handleOpenMaterialTour(item)}
                        title={t.btn_tour_item || "Visite Visuelle / Agrandir"}
                        size="card"
                      />

                      {/* Code, Site badge & Full Name (adapted to long texts) */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <button
                              type="button"
                              onClick={() => onOpenMaterialModal(item.materialId)}
                              className="font-mono font-bold text-xs text-zinc-950 hover:underline tracking-tight text-left truncate focus-visible:ring-2 focus-visible:ring-zinc-950 rounded"
                              title="Consulter la fiche détaillée"
                            >
                              {item.materialCode}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleCopyCode(item.materialCode, e)}
                              className="text-zinc-400 hover:text-zinc-700 p-0.5 rounded transition-colors"
                              title="Copier le code"
                              aria-label="Copier le code"
                            >
                              {copiedCode === item.materialCode ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
                            {item.warehouseId}
                          </span>
                        </div>

                        {/* Full Designation on 2 lines with title tooltip */}
                        <p 
                          onClick={() => onOpenMaterialModal(item.materialId)}
                          className="text-xs font-semibold text-zinc-900 line-clamp-2 mt-0.5 cursor-pointer leading-snug hover:text-zinc-700 transition-colors"
                          title={item.materialName}
                        >
                          {item.materialName}
                        </p>

                        {/* Technical specs & Chinese name tags */}
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          {item.chineseName && (
                            <span className="text-[10px] text-zinc-500 font-medium truncate max-w-[110px]" title={item.chineseName}>
                              {item.chineseName}
                            </span>
                          )}
                          {item.specification && (
                            <span className="text-[10px] text-zinc-600 font-mono bg-zinc-50 border border-zinc-200 px-1.5 py-0.2 rounded truncate max-w-[170px]" title={item.specification}>
                              {item.specification}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Prominent Quantity Metric & Accessible Stock Status Badge */}
                    <div className="mt-3.5 p-2.5 rounded-xl bg-zinc-50/90 border border-zinc-200/80 flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono font-black text-xl text-zinc-950 tracking-tight">
                          {item.quantity.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-zinc-600 font-mono uppercase">
                          {item.uom}
                        </span>
                      </div>

                      {/* Explicit Double-Encoded Status Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${status.badgeClass}`}>
                        <status.icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{status.label}</span>
                      </span>
                    </div>

                    {/* Secondary Location & Financial Value Strip */}
                    <div className="mt-2.5 flex items-center justify-between text-xs text-zinc-500 font-mono">
                      <div className="flex items-center gap-1 text-zinc-700">
                        <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                        <span className="font-bold">{item.binLocation || 'N/A'}</span>
                      </div>

                      <div className="text-right">
                        {hideFinancialValues ? (
                          <span className="text-zinc-400 select-none">••••••</span>
                        ) : (
                          <span className="font-bold text-zinc-800">
                            ${item.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} USD
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer: High-contrast primary button + secondary subtle controls */}
                  <div className="mt-3.5 pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-1.5">
                    {/* Primary Action Button */}
                    {canOperateStock ? (
                      <button
                        type="button"
                        onClick={() => onQuickIssue(item)}
                        className="flex-1 py-1.5 px-2.5 bg-zinc-950 hover:bg-zinc-800 text-lime font-bold text-xs rounded-xl inline-flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-zinc-950"
                        title="Enregistrer une sortie de stock"
                        aria-label={`Sortie rapide pour ${item.materialCode}`}
                      >
                        <ArrowUpFromLine className="w-3.5 h-3.5 text-lime" />
                        <span>Sortie</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenMaterialModal(item.materialId)}
                        className="flex-1 py-1.5 px-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl inline-flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5 text-lime" />
                        <span>Consulter</span>
                      </button>
                    )}

                    {/* Secondary Controls (Reduced Visual Clutter) */}
                    <div className="flex items-center gap-1">
                      {canOperateStock && (
                        <>
                          <button
                            type="button"
                            onClick={() => onQuickReceipt(item)}
                            className="p-1.5 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-zinc-950"
                            title="Entrée de stock (+)"
                            aria-label={`Entrée de stock pour ${item.materialCode}`}
                          >
                            <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onQuickTransfer(item)}
                            className="p-1.5 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-zinc-950"
                            title="Transférer vers un autre casier/magasin"
                            aria-label={`Transférer ${item.materialCode}`}
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
                          </button>
                        </>
                      )}

                      {onOpenLabelModal && (
                        <button
                          type="button"
                          onClick={() => onOpenLabelModal(item)}
                          className="p-1.5 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-zinc-950"
                          title="Imprimer étiquette QR code"
                          aria-label={`Imprimer étiquette pour ${item.materialCode}`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onOpenMaterialModal(item.materialId)}
                        className="p-1.5 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-zinc-950"
                        title="Détails complets de la fiche"
                        aria-label={`Détails complets pour ${item.materialCode}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {paginatedItems.length === 0 && (
              <div className="col-span-full py-12 text-center text-zinc-500">
                <Package className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
                <p className="text-sm font-semibold text-zinc-700">{t.no_matching_stock || 'Aucun article ne correspond à vos filtres'}</p>
                <p className="text-xs text-zinc-400 mt-1">Essayez de modifier votre recherche ou de réinitialiser les filtres.</p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="mt-3 px-4 py-1.5 bg-zinc-900 text-white rounded-full text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Réinitialiser les filtres</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================================= */}
        {/* 4B. COMPACT TABLE VIEW (HIGH DENSITY, FULL SORTING & COLUMNS)            */}
        {/* ======================================================================= */}
        {viewMode === 'table' && (
          <div>
            <div className="p-3 pb-0">
              <MobileTableNotice
                onSwitchToCards={() => handleSetViewMode('cards')}
                cardsLabel={t.btn_cards || 'Cartes'}
              />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                {/* Table Header with interactive sorting on all columns */}
                <thead className="bg-zinc-50 text-zinc-700 border-b border-zinc-200 uppercase font-mono text-[11px] select-none sticky top-0 z-10">
                  <tr>
                    {/* Référence */}
                    <th className="py-2.5 px-3">
                      <button 
                        type="button"
                        onClick={() => handleSort('materialCode')} 
                        className="flex items-center gap-1 hover:text-zinc-950 font-bold transition-colors focus-visible:ring-2 focus-visible:ring-zinc-950 rounded"
                        aria-label="Trier par référence"
                      >
                        <span>{t.col_code || 'Référence'}</span>
                        {sortField === 'materialCode' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-zinc-950 stroke-[2.5]" /> : <ArrowDown className="w-3 h-3 text-zinc-950 stroke-[2.5]" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                        )}
                      </button>
                    </th>

                    {/* Désignation */}
                    <th className="py-2.5 px-3">
                      <button 
                        type="button"
                        onClick={() => handleSort('materialName')} 
                        className="flex items-center gap-1 hover:text-zinc-950 font-bold transition-colors focus-visible:ring-2 focus-visible:ring-zinc-950 rounded"
                        aria-label="Trier par désignation"
                      >
                        <span>{t.col_name || 'Désignation'}</span>
                        {sortField === 'materialName' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-zinc-950 stroke-[2.5]" /> : <ArrowDown className="w-3 h-3 text-zinc-950 stroke-[2.5]" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                        )}
                      </button>
                    </th>

                    {/* Entrepôt */}
                    <th className="py-2.5 px-3 text-center">
                      <button 
                        type="button"
                        onClick={() => handleSort('warehouseId')} 
                        className="flex items-center gap-1 hover:text-zinc-950 font-bold transition-colors mx-auto focus-visible:ring-2 focus-visible:ring-zinc-950 rounded"
                        aria-label="Trier par entrepôt"
                      >
                        <span>{t.col_warehouse || 'Entrepôt'}</span>
                        {sortField === 'warehouseId' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-zinc-950 stroke-[2.5]" /> : <ArrowDown className="w-3 h-3 text-zinc-950 stroke-[2.5]" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                        )}
                      </button>
                    </th>

                    {/* Emplacement */}
                    <th className="py-2.5 px-3">
                      <button 
                        type="button"
                        onClick={() => handleSort('binLocation')} 
                        className="flex items-center gap-1 hover:text-zinc-950 font-bold transition-colors focus-visible:ring-2 focus-visible:ring-zinc-950 rounded"
                        aria-label="Trier par emplacement"
                      >
                        <span>{t.field_physical_address || 'Emplacement'}</span>
                        {sortField === 'binLocation' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-zinc-950 stroke-[2.5]" /> : <ArrowDown className="w-3 h-3 text-zinc-950 stroke-[2.5]" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                        )}
                      </button>
                    </th>

                    {/* Quantité & Niveau */}
                    <th className="py-2.5 px-3 text-right">
                      <button 
                        type="button"
                        onClick={() => handleSort('quantity')} 
                        className="flex items-center gap-1 hover:text-zinc-950 font-bold transition-colors ml-auto focus-visible:ring-2 focus-visible:ring-zinc-950 rounded"
                        aria-label="Trier par quantité"
                      >
                        <span>{t.col_qty || 'Quantité'}</span>
                        {sortField === 'quantity' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-zinc-950 stroke-[2.5]" /> : <ArrowDown className="w-3 h-3 text-zinc-950 stroke-[2.5]" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                        )}
                      </button>
                    </th>

                    {/* Unité de mesure */}
                    <th className="py-2.5 px-2 text-center font-bold">{t.col_uom || 'Unité'}</th>

                    {/* Valeur totale */}
                    <th className="py-2.5 px-3 text-right">
                      <button 
                        type="button"
                        onClick={() => handleSort('totalValue')} 
                        className="flex items-center gap-1 hover:text-zinc-950 font-bold transition-colors ml-auto focus-visible:ring-2 focus-visible:ring-zinc-950 rounded"
                        aria-label="Trier par valeur"
                      >
                        <span>{t.col_total_value || 'Valeur'}</span>
                        {sortField === 'totalValue' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-zinc-950 stroke-[2.5]" /> : <ArrowDown className="w-3 h-3 text-zinc-950 stroke-[2.5]" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                        )}
                      </button>
                    </th>

                    {/* Actions */}
                    <th className="py-2.5 px-3 text-center font-bold">{t.col_actions || 'Actions'}</th>
                  </tr>
                </thead>

                {/* Table Body (Dense, compact rows) */}
                <tbody className="divide-y divide-zinc-200/90">
                  {paginatedItems.map((item) => {
                    const status = getStockStatus(item);
                    const locationParts = dataService.getLocationParts(item);

                    return (
                      <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors group">
                        {/* Référence & Vignette */}
                        <td className="py-2 px-3 whitespace-nowrap">
                          <StockHoverCard
                            item={item}
                            onQuickReceipt={onQuickReceipt}
                            onQuickIssue={onQuickIssue}
                            onQuickTransfer={onQuickTransfer}
                            onOpenMaterialModal={onOpenMaterialModal}
                            onOpenLabelModal={onOpenLabelModal}
                            onOpenVisualTour={handleOpenMaterialTour}
                          >
                            <div className="flex items-center gap-2">
                              {/* Squircle Thumbnail with strict dimensions & error fallback */}
                              <StockThumbnail
                                imageUrl={item.imageUrl}
                                materialCode={item.materialCode}
                                onClick={() => handleOpenMaterialTour(item)}
                                title="Agrandir / Visite visuelle"
                                size="table"
                              />

                              <div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => onOpenMaterialModal(item.materialId)}
                                    className="text-left font-mono font-bold text-zinc-900 hover:underline block text-xs"
                                  >
                                    {item.materialCode}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleCopyCode(item.materialCode, e)}
                                    className="text-zinc-400 hover:text-zinc-700 p-0.5 rounded transition-colors opacity-0 group-hover:opacity-100"
                                    title="Copier le code"
                                    aria-label="Copier le code"
                                  >
                                    {copiedCode === item.materialCode ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                                {item.chineseName && (
                                  <span className="text-[10px] text-zinc-500 font-sans block truncate max-w-[130px]" title={item.chineseName}>
                                    {item.chineseName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </StockHoverCard>
                        </td>

                        {/* Désignation & Spécification */}
                        <td className="py-2 px-3 max-w-[280px]">
                          <div 
                            onClick={() => onOpenMaterialModal(item.materialId)}
                            className="font-semibold text-zinc-900 truncate hover:underline cursor-pointer" 
                            title={item.materialName}
                          >
                            {item.materialName}
                          </div>
                          {item.specification && (
                            <div className="text-[10px] text-zinc-500 truncate font-mono mt-0.5" title={item.specification}>
                              {item.specification}
                            </div>
                          )}
                        </td>

                        {/* Entrepôt */}
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <span className="inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800">
                            {item.warehouseId}
                          </span>
                        </td>

                        {/* Emplacement / Casier */}
                        <td className="py-2 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-bold text-zinc-800 text-xs">{item.binLocation}</span>
                            {locationParts.length > 0 && (
                              <span className="text-[10px] text-zinc-400 font-mono hidden xl:inline">
                                ({locationParts.map(p => `${p.label}:${p.value}`).join(' ')})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Quantité & Statut explicite */}
                        <td className="py-2 px-3 text-right font-mono whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-black text-sm text-zinc-950">
                              {item.quantity.toLocaleString()}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-sans ${status.tableBadgeClass}`}>
                              <status.icon className="w-3 h-3 shrink-0" />
                              <span>{status.shortLabel}</span>
                            </span>
                          </div>
                        </td>

                        {/* Unité */}
                        <td className="py-2 px-2 text-center text-zinc-600 font-mono text-[11px] whitespace-nowrap">
                          {item.uom}
                        </td>

                        {/* Valeur totale */}
                        <td className="py-2 px-3 text-right font-mono font-bold text-zinc-900 whitespace-nowrap">
                          {hideFinancialValues ? (
                            <span className="text-zinc-400 select-none">••••••</span>
                          ) : (
                            `$${item.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          )}
                        </td>

                        {/* Actions compactes */}
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            {canOperateStock && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onQuickIssue(item)}
                                  className="p-1 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
                                  title="Sortie de stock"
                                  aria-label={`Sortie pour ${item.materialCode}`}
                                >
                                  <ArrowUpFromLine className="w-3.5 h-3.5 text-zinc-800" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onQuickReceipt(item)}
                                  className="p-1 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
                                  title="Entrée de stock"
                                  aria-label={`Entrée pour ${item.materialCode}`}
                                >
                                  <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-600" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onQuickTransfer(item)}
                                  className="p-1 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
                                  title="Transférer"
                                  aria-label={`Transfert pour ${item.materialCode}`}
                                >
                                  <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
                                </button>
                              </>
                            )}
                            {onOpenLabelModal && (
                              <button
                                type="button"
                                onClick={() => onOpenLabelModal(item)}
                                className="p-1 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
                                title="Étiquette QR Code"
                                aria-label={`Étiquette pour ${item.materialCode}`}
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onOpenMaterialModal(item.materialId)}
                              className="p-1 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors"
                              title="Détails"
                              aria-label={`Détails pour ${item.materialCode}`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {paginatedItems.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-400">
                        <Package className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                        <p className="text-sm font-semibold text-zinc-700">{t.no_matching_stock || 'Aucun article ne correspond à votre recherche'}</p>
                        <button
                          type="button"
                          onClick={resetAllFilters}
                          className="mt-3 px-3 py-1 bg-zinc-900 text-white rounded-full text-xs font-bold inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Réinitialiser les filtres</span>
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* 5. PAGINATION FOOTER BAR                                                */}
        {/* ======================================================================= */}
        <div className="bg-zinc-50 px-4 py-3 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <span>{t.showing_items || 'Affichage de'} :</span>
            <select
              aria-label={t.showing_items || 'Nombre d\'éléments par page'}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-zinc-300 text-zinc-900 text-xs px-2.5 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950 font-medium"
            >
              <option value={25}>25 par page</option>
              <option value={50}>50 par page</option>
              <option value={100}>100 par page</option>
              <option value={200}>200 par page</option>
            </select>
            <span className="ml-2 font-mono text-zinc-500">
              {filteredItems.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, filteredItems.length)} sur {filteredItems.length.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-700 transition-colors"
              title={t.prev_page || 'Page précédente'}
              aria-label="Page précédente"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-1 bg-white rounded-lg border border-zinc-200 text-zinc-800 font-semibold">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-700 transition-colors"
              title={t.next_page || 'Page suivante'}
              aria-label="Page suivante"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hardware Douchette Scanned Code Feedback Banner */}
      {lastScannedCode && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-900/95 text-emerald-100 border border-emerald-500 rounded-full px-4 py-2 text-xs font-bold shadow-xl flex items-center gap-2 animate-bounce">
          <Scan className="w-4 h-4 text-emerald-300" />
          <span>{t.barcode_scanner_detected || 'Code scanné :'} <strong className="font-mono text-white">{lastScannedCode}</strong></span>
        </div>
      )}

      {/* Tablet Mode Persistent Floating Action Deck */}
      {isTabletMode && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl bg-zinc-900/95 backdrop-blur-md border border-zinc-700 text-white rounded-2xl shadow-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 animate-slideUp">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.tablet_scan_hint || "Scannez avec la douchette ou tapez un code SAP / BIN..."}
              className="w-full pl-10 pr-9 py-2 bg-zinc-800 border border-zinc-600 rounded-xl text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-amber-400 font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                aria-label="Effacer la recherche"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
            <button
              type="button"
              onClick={() => setSelectedWarehouse('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedWarehouse === 'ALL'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              Tous
            </button>
            <button
              type="button"
              onClick={() => setSelectedWarehouse('B1')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedWarehouse === 'B1'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              B1
            </button>
            <button
              type="button"
              onClick={() => setSelectedWarehouse('B2')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedWarehouse === 'B2'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              B2
            </button>
            <button
              type="button"
              onClick={() => setStockLevelFilter(prev => prev === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                stockLevelFilter === 'LOW_STOCK'
                  ? 'bg-amber-500 text-zinc-950 font-black shadow-sm'
                  : 'bg-zinc-800 text-amber-300 hover:bg-zinc-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Stock Faible</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400 font-mono shrink-0 pl-2 border-l border-zinc-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t.barcode_gun_ready || t.barcode_scanner_detected || 'Douchette prête'}</span>
          </div>
        </div>
      )}

      {/* Material Visual Tour Modal */}
      <MaterialVisualTourModal
        isOpen={isMaterialTourOpen}
        onClose={() => {
          setIsMaterialTourOpen(false);
          setTourMaterialId(undefined);
        }}
        initialMaterialId={tourMaterialId}
        items={filteredItems}
        onQuickReceipt={onQuickReceipt}
        onQuickIssue={onQuickIssue}
        onQuickTransfer={onQuickTransfer}
        onOpenLabelModal={onOpenLabelModal}
        onOpenMaterialModal={onOpenMaterialModal}
      />
    </div>
  );
};

export default StockTableView;
