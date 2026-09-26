import React, { useState, useMemo, useEffect } from 'react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import { StockItem, StorageLocation } from '@shared/types/models';
import { 
  Search, 
  ArrowUpDown, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowLeftRight, 
  Eye, 
  Download,
  AlertTriangle, 
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
  Table as TableIcon
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

type SortField = 'quantity' | 'totalValue' | 'materialCode' | 'binLocation' | 'materialName';
type SortOrder = 'asc' | 'desc';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [binFilter, setBinFilter] = useState('');
  const [uomFilter, setUomFilter] = useState('');
  const [locationTypeFilter, setLocationTypeFilter] = useState('ALL');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyLowStock, setOnlyLowStock] = useState(initialFilter === 'lowStock');

  const [sortField, setSortField] = useState<SortField>('totalValue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, handleSetViewMode] = useResponsiveViewMode('wms_stock_view_mode');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

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

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = dataService.getStock({
      warehouseId: selectedWarehouse,
      locationType: locationTypeFilter !== 'ALL' ? locationTypeFilter : undefined,
      search: searchTerm,
      binLocation: binFilter,
      uom: uomFilter || undefined,
      onlyAvailable,
      onlyLowStock
    });

    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [selectedWarehouse, locationTypeFilter, searchTerm, binFilter, uomFilter, onlyAvailable, onlyLowStock, sortField, sortOrder, stockItems]);

  // Pagination slice
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleExport = () => {
    dataService.exportStockToExcel(selectedWarehouse);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, binFilter, uomFilter, locationTypeFilter, onlyAvailable, onlyLowStock, selectedWarehouse]);

  const totalValuationUSD = filteredItems.reduce((acc, s) => acc + s.totalValue, 0);

  return (
    <div className="space-y-4 pb-28">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">{t.stock_table_title}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {filteredItems.length.toLocaleString()} {t.catalog_items_listed} — {t.total_stock_value_label} :{' '}
            <span className="text-zinc-900 font-mono font-bold">
              ${totalValuationUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Prominent View Mode Switcher: Cartes | Tableau */}
          <ViewModeSwitcher
            viewMode={viewMode}
            onChange={handleSetViewMode}
            cardsLabel={t.btn_cards}
            tableLabel={t.btn_table}
          />

          <button
            onClick={() => handleOpenMaterialTour()}
            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-colors"
            title={t.btn_material_tour}
          >
            <Camera className="w-3.5 h-3.5 text-zinc-300" />
            <span className="hidden sm:inline">{t.btn_material_tour}</span>
          </button>

          {onOpenShareModal && (
            <button
              onClick={() => onOpenShareModal({
                warehouseId: selectedWarehouse as any,
                searchQuery: searchTerm || undefined,
                binLocation: binFilter || undefined,
                status: onlyLowStock ? 'LOW_STOCK' : onlyAvailable ? 'IN_STOCK' : 'ALL'
              })}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-zinc-800 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors border border-zinc-300 shadow-2xs"
              title={t.btn_share_this_view}
            >
              <Share2 className="w-3.5 h-3.5 text-zinc-600" />
              <span className="hidden sm:inline">{t.btn_share_this_view}</span>
            </button>
          )}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-zinc-800 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors border border-zinc-300 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-zinc-600" />
            <span className="hidden sm:inline">{t.btn_export_excel}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="liquid-glass-card p-5 space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3">
          {/* Search input */}
          <div className="md:col-span-4 relative">
            <AutocompleteInput
              field="materialName"
              placeholder={t.search_placeholder}
              value={searchTerm}
              onChange={setSearchTerm}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Location / Site Selector */}
          <div className="md:col-span-3">
            <select
              aria-label={t.col_warehouse}
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-xs text-zinc-800 px-3 py-2 rounded focus:outline-none focus:border-zinc-900 font-medium"
            >
              <option value="ALL">{t.all_sites_and_warehouses}</option>
              <optgroup label={t.main_warehouses_group}>
                <option value="B1">B1 (MD01)</option>
                <option value="B2">B2 (Zones A-E)</option>
              </optgroup>
              <optgroup label={t.containers_and_sites_group}>
                {locations.filter(l => l.code !== 'B1' && l.code !== 'B2').map(loc => (
                  <option key={loc.id} value={loc.code}>
                    {loc.code} — {loc.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Location Type Filter */}
          <div className="md:col-span-2">
            <select
              aria-label={t.filter_by_type}
              value={locationTypeFilter}
              onChange={(e) => setLocationTypeFilter(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-xs text-zinc-800 px-3 py-2 rounded focus:outline-none focus:border-zinc-900"
            >
              <option value="ALL">{t.all_site_types}</option>
              <option value="WAREHOUSE">{t.type_warehouse}</option>
              <option value="CONTAINER">{t.type_container}</option>
              <option value="YARD">{t.type_yard}</option>
              <option value="WORKSHOP">{t.type_workshop}</option>
              <option value="TEMPORARY">{t.type_temporary}</option>
              <option value="QUARANTINE">{t.type_quarantine}</option>
            </select>
          </div>

          {/* Granular Sub-location / BIN input */}
          <div className="md:col-span-2">
            <AutocompleteInput
              field="binLocation"
              placeholder={t.search_by_bin_placeholder}
              value={binFilter}
              onChange={setBinFilter}
              uppercase
              fontMono
            />
          </div>

          {/* UOM Filter */}
          <div className="md:col-span-1">
            <select
              aria-label={t.col_uom}
              value={uomFilter}
              onChange={(e) => setUomFilter(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-xs text-zinc-800 px-2 py-2 rounded focus:outline-none focus:border-zinc-900"
            >
              <option value="">{t.col_uom}</option>
              {distinctUoms.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkbox filters strip & ViewModeSwitcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-zinc-700">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              />
              <span>{t.available_gt_zero}</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none text-amber-800">
              <input
                type="checkbox"
                checked={onlyLowStock}
                onChange={(e) => setOnlyLowStock(e.target.checked)}
                className="rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="font-medium">{t.low_stock_badge} (≤ 5)</span>
            </label>

            {(searchTerm || binFilter || uomFilter || locationTypeFilter !== 'ALL' || onlyAvailable || onlyLowStock || selectedWarehouse !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setBinFilter('');
                  setUomFilter('');
                  setLocationTypeFilter('ALL');
                  setSelectedWarehouse('ALL');
                  setOnlyAvailable(false);
                  setOnlyLowStock(false);
                }}
                className="text-xs text-zinc-500 hover:text-zinc-900 underline ml-2"
              >
                {t.reset_filters}
              </button>
            )}
          </div>

          <ViewModeSwitcher
            viewMode={viewMode}
            onChange={handleSetViewMode}
            cardsLabel={t.btn_cards}
            tableLabel={t.btn_table}
            showMobileLabel
          />
        </div>
      </div>

      {/* Stock Table / Tactile Cards (Liquid Glass Card) */}
      <div className="liquid-glass-card overflow-hidden">
        {/* Tactile Cards View (Active by default) */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 p-3.5 bg-zinc-50/60">
            {paginatedItems.map((item) => {
              const isLow = item.availableQuantity > 0 && item.availableQuantity <= 5;
              const isZero = item.availableQuantity <= 0;

              return (
                <div 
                  key={item.id}
                  className="bg-white rounded-2xl p-3.5 border border-zinc-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all active:scale-[0.99]"
                >
                  {/* Top row: Squircle Image Well + Code/Name + Qty Pill */}
                  <div className="flex items-start gap-3">
                    {/* Tactile Squircle Well */}
                    <div
                      onClick={() => handleOpenMaterialTour(item)}
                      className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] flex items-center justify-center overflow-hidden shrink-0 cursor-pointer relative group"
                      title={t.btn_tour_item || "Visite Visuelle"}
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.materialCode} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <Package className="w-5 h-5 text-zinc-400" />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                        <Camera className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>

                    {/* Title & Specs */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenMaterialModal(item.materialId)}
                          className="font-mono font-bold text-xs text-zinc-950 hover:underline truncate text-left"
                        >
                          {item.materialCode}
                        </button>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-black shrink-0 ${
                          isZero
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : isLow
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-lime-muted text-lime-text border border-lime/30'
                        }`}>
                          {item.quantity.toLocaleString()} {item.uom}
                        </span>
                      </div>

                      <p 
                        onClick={() => onOpenMaterialModal(item.materialId)}
                        className="text-xs font-medium text-zinc-800 line-clamp-1 mt-0.5 cursor-pointer"
                      >
                        {item.materialName}
                      </p>

                      {item.chineseName && (
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {item.chineseName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sub-strip: Emplacement & Valeur */}
                  <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-mono font-bold text-[10px]">
                        {item.warehouseId}
                      </span>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono font-bold text-[10px]">
                        <MapPin className="w-2.5 h-2.5" />
                        {item.binLocation || 'N/A'}
                      </span>
                    </div>

                    <span className="font-mono font-bold text-[11px] text-zinc-900">
                      ${item.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} USD
                    </span>
                  </div>

                  {/* Tactile Action Chips */}
                  <div className="mt-2.5 pt-2 border-t border-zinc-100 grid grid-cols-4 gap-1.5">
                    {canOperateStock && (
                      <>
                        <button
                          type="button"
                          onClick={() => onQuickIssue(item)}
                          className="py-1.5 px-1 bg-zinc-950 text-lime rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-transform"
                        >
                          <ArrowUpFromLine className="w-3 h-3 text-lime" />
                          <span>Sortie</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onQuickReceipt(item)}
                          className="py-1.5 px-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform"
                        >
                          <ArrowDownToLine className="w-3 h-3 text-emerald-600" />
                          <span>Entrée</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onQuickTransfer(item)}
                          className="py-1.5 px-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform"
                        >
                          <ArrowLeftRight className="w-3 h-3 text-blue-600" />
                          <span>Transf.</span>
                        </button>
                      </>
                    )}
                    {onOpenLabelModal ? (
                      <button
                        type="button"
                        onClick={() => onOpenLabelModal(item)}
                        className="py-1.5 px-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 active:scale-95 transition-transform"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>QR</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenMaterialModal(item.materialId)}
                        className="py-1.5 px-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 active:scale-95 transition-transform"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Détail</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {paginatedItems.length === 0 && (
              <div className="py-8 text-center text-zinc-400">
                <p className="text-xs">{t.no_matching_stock}</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'table' && (
          <div>
            <div className="p-3 pb-0">
              <MobileTableNotice
                onSwitchToCards={() => handleSetViewMode('cards')}
                cardsLabel={t.btn_cards}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3 px-3">
                  <button onClick={() => handleSort('materialCode')} className="flex items-center gap-1 hover:text-zinc-900 font-semibold">
                    <span>{t.col_code}</span>
                    <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button onClick={() => handleSort('materialName')} className="flex items-center gap-1 hover:text-zinc-900 font-semibold">
                    <span>{t.col_name}</span>
                    <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                  </button>
                </th>
                <th className="py-3 px-3 text-center font-semibold">{t.col_warehouse}</th>
                <th className="py-3 px-3 font-semibold">{t.field_physical_address}</th>
                <th className="py-3 px-3 text-right">
                  <button onClick={() => handleSort('quantity')} className="flex items-center gap-1 hover:text-zinc-900 font-semibold ml-auto">
                    <span>{t.col_qty}</span>
                    <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                  </button>
                </th>
                <th className="py-3 px-2 text-center font-semibold">{t.col_uom}</th>
                <th className="py-3 px-3 text-right font-semibold">{t.col_unit_price}</th>
                <th className="py-3 px-3 text-right">
                  <button onClick={() => handleSort('totalValue')} className="flex items-center gap-1 hover:text-zinc-900 font-semibold ml-auto">
                    <span>{t.col_total_value}</span>
                    <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                  </button>
                </th>
                <th className="py-3 px-3 text-center font-semibold">{t.col_actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {paginatedItems.map((item) => {
                const isLow = item.availableQuantity > 0 && item.availableQuantity <= 5;
                const isZero = item.availableQuantity <= 0;
                const locationParts = dataService.getLocationParts(item);

                return (
                  <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                    {/* Material Code & Photo Thumbnail (with Quick Hover Card) */}
                    <td className={`${isTabletMode ? 'py-3.5 sm:py-4' : 'py-2.5'} px-3 whitespace-nowrap`}>
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
                          <div
                            onClick={() => handleOpenMaterialTour(item)}
                            className={`${isTabletMode ? 'w-10 h-10' : 'w-8 h-8'} rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-zinc-900 transition-colors group relative`}
                            title={t.btn_tour_item || "Visite Visuelle"}
                          >
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.materialCode} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200" />
                            ) : (
                              <Package className={`${isTabletMode ? 'w-5 h-5' : 'w-3.5 h-3.5'} text-zinc-400`} />
                            )}
                          </div>
                          <div>
                            <button
                              onClick={() => onOpenMaterialModal(item.materialId)}
                              className={`text-left font-mono font-bold text-zinc-900 hover:underline block ${isTabletMode ? 'text-sm' : 'text-xs'}`}
                            >
                              {item.materialCode}
                            </button>
                            {item.chineseName && (
                              <span className="text-[11px] text-zinc-500 font-sans block truncate max-w-[130px]" title={item.chineseName}>
                                {item.chineseName}
                              </span>
                            )}
                          </div>
                        </div>
                      </StockHoverCard>
                    </td>

                    {/* Name & Spec */}
                    <td className="py-2.5 px-3 max-w-[260px]">
                      <div className="font-semibold text-zinc-900 truncate" title={item.materialName}>
                        {item.materialName}
                      </div>
                      {item.specification && (
                        <div className="text-[11px] text-zinc-500 truncate font-mono mt-0.5" title={item.specification}>
                          {item.specification}
                        </div>
                      )}
                    </td>

                    {/* Site / Warehouse Badge */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className="inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 border border-zinc-300 text-zinc-900">
                        {item.warehouseId}
                      </span>
                    </td>

                    {/* Flexible Populated Location Tags ONLY */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap items-center gap-1 max-w-[280px]">
                        {locationParts.length > 0 ? (
                          locationParts.map((part, idx) => (
                            <span 
                              key={idx} 
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 border border-zinc-200 text-zinc-700 font-mono"
                            >
                              <span className="text-zinc-400 mr-1">{part.label}:</span>
                              <span className="font-semibold text-zinc-900">{part.value}</span>
                            </span>
                          ))
                        ) : (
                          <span className="font-mono text-zinc-700 text-xs">{item.binLocation}</span>
                        )}
                        {item.locationNotes && (
                          <span className="text-[10px] text-zinc-400 italic block w-full mt-0.5">
                            {item.locationNotes}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                      <div className="font-bold text-sm text-zinc-900">
                        {item.quantity.toLocaleString()}
                      </div>
                      {isLow && (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-sans mt-0.5">
                          <AlertTriangle className="w-2.5 h-2.5 mr-0.5 text-amber-600" /> {t.low_stock_badge}
                        </span>
                      )}
                      {isZero && (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-red-50 text-red-700 border border-red-200 font-sans mt-0.5">
                          {t.out_of_stock_badge}
                        </span>
                      )}
                    </td>

                    {/* UoM */}
                    <td className="py-2.5 px-2 text-center text-zinc-600 font-mono text-[11px] whitespace-nowrap">
                      {item.uom}
                    </td>

                    {/* Unit Price */}
                    <td className="py-2.5 px-3 text-right font-mono text-zinc-700 whitespace-nowrap">
                      ${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Total Value */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900 whitespace-nowrap">
                      ${item.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Actions */}
                    <td className={`${isTabletMode ? 'py-3.5 sm:py-4' : 'py-2.5'} px-3 text-center whitespace-nowrap`}>
                      <div className="flex items-center justify-center gap-1">
                        {isTabletMode ? (
                          /* Large touch targets in Tablet Mode */
                          <div className="flex items-center gap-1.5">
                            {canOperateStock && (
                              <>
                                <button
                                  onClick={() => onQuickReceipt(item)}
                                  className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                                  title={t.action_receipt}
                                >
                                  <ArrowDownToLine className="w-3.5 h-3.5" />
                                  <span>+ Entrée</span>
                                </button>
                                <button
                                  onClick={() => onQuickIssue(item)}
                                  className="px-2.5 py-1.5 bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                                  title={t.action_issue}
                                >
                                  <ArrowUpFromLine className="w-3.5 h-3.5 text-zinc-700" />
                                  <span>- Sortie</span>
                                </button>
                                <button
                                  onClick={() => onQuickTransfer(item)}
                                  className="px-2.5 py-1.5 bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                                  title={t.action_transfer}
                                >
                                  <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-700" />
                                  <span>⇄ Transférer</span>
                                </button>
                              </>
                            )}
                            {onOpenLabelModal && (
                              <button
                                onClick={() => onOpenLabelModal(item)}
                                className="p-2 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-300 rounded transition-colors"
                                title="Imprimer QR Code / Étiquette"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => onOpenMaterialModal(item.materialId)}
                              className="p-2 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-300 rounded transition-colors"
                              title={t.btn_details}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenMaterialTour(item)}
                              className="p-2 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-300 rounded transition-colors"
                              title={t.btn_tour_item || "Visite Visuelle"}
                            >
                              <Camera className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          /* Standard compact desktop mode */
                          <>
                            <button
                              onClick={() => handleOpenMaterialTour(item)}
                              className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                              title={t.btn_tour_item || "Visite Visuelle"}
                            >
                              <Camera className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenMaterialModal(item.materialId)}
                              className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                              title={t.btn_details}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {onOpenLabelModal && (
                              <button
                                onClick={() => onOpenLabelModal(item)}
                                className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                                title="Imprimer QR Code / Étiquette"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canOperateStock && (
                              <>
                                <button
                                  onClick={() => onQuickReceipt(item)}
                                  className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                                  title={t.action_receipt}
                                >
                                  <ArrowDownToLine className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onQuickIssue(item)}
                                  className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                                  title={t.action_issue}
                                >
                                  <ArrowUpFromLine className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onQuickTransfer(item)}
                                  className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                                  title={t.action_transfer}
                                >
                                  <ArrowLeftRight className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-400">
                    <p className="text-sm">{t.no_matching_stock}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

        {/* Pagination Bar */}
        <div className="bg-zinc-50 px-4 py-3 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <span>{t.showing_items} :</span>
            <select
              aria-label={t.showing_items}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-zinc-300 text-zinc-900 text-xs px-2 py-1 rounded focus:outline-none"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
            <span className="ml-2 font-mono text-zinc-500">
              {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredItems.length)} {t.pagination_of} {filteredItems.length.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-white hover:bg-zinc-100 border border-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-700 transition-colors"
              title={t.prev_page}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-1 bg-white rounded border border-zinc-200 text-zinc-800 font-semibold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded bg-white hover:bg-zinc-100 border border-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-700 transition-colors"
              title={t.next_page}
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
          {/* Left: Quick search with touch clear button */}
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
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Center: Site quick filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
            <button
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
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                onlyLowStock
                  ? 'bg-amber-500 text-zinc-950 font-black shadow-sm'
                  : 'bg-zinc-800 text-amber-300 hover:bg-zinc-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Stock Faible</span>
            </button>
          </div>

          {/* Right: Hardware scanner status badge */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400 font-mono shrink-0 pl-2 border-l border-zinc-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Douchette prête</span>
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
