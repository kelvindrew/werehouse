import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StockItem, Material } from '@shared/types/models';
import { dataService, assignSampleMaterialImage } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Package,
  Layers,
  DollarSign,
  Boxes,
  Camera,
  Search,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  QrCode,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Warehouse as WarehouseIcon,
  Sparkles
} from 'lucide-react';

export interface MaterialVisualTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMaterialId?: string;
  items?: StockItem[];
  onQuickReceipt?: (item: StockItem) => void;
  onQuickIssue?: (item: StockItem) => void;
  onQuickTransfer?: (item: StockItem) => void;
  onOpenLabelModal?: (item: StockItem) => void;
  onOpenMaterialModal?: (materialId: string) => void;
}

export const MaterialVisualTourModal: React.FC<MaterialVisualTourModalProps> = ({
  isOpen,
  onClose,
  initialMaterialId,
  items: providedItems,
  onQuickReceipt,
  onQuickIssue,
  onQuickTransfer,
  onOpenLabelModal,
  onOpenMaterialModal,
}) => {
  const { t, currentUser, canOperateStock } = useAuth();
  
  // All stock items if not passed
  const [catalogItems, setCatalogItems] = useState<StockItem[]>(() => {
    return providedItems && providedItems.length > 0
      ? providedItems
      : dataService.getStock();
  });

  // Sync with data service updates
  useEffect(() => {
    if (providedItems && providedItems.length > 0) {
      setCatalogItems(providedItems);
      return;
    }
    const update = () => setCatalogItems(dataService.getStock());
    const unsub = dataService.subscribe(update);
    return () => unsub();
  }, [providedItems]);

  // Modal internal filters
  const [siteFilter, setSiteFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStockId, setSelectedStockId] = useState<string>('');
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const thumbnailCarouselRef = useRef<HTMLDivElement>(null);

  // Filtered materials list for the tour
  const displayItems = useMemo(() => {
    let list = catalogItems;

    if (siteFilter !== 'ALL') {
      list = list.filter(item => item.warehouseId === siteFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(item =>
        item.materialCode.toLowerCase().includes(q) ||
        item.materialName.toLowerCase().includes(q) ||
        (item.chineseName && item.chineseName.toLowerCase().includes(q)) ||
        (item.specification && item.specification.toLowerCase().includes(q)) ||
        item.binLocation.toLowerCase().includes(q)
      );
    }

    return list;
  }, [catalogItems, siteFilter, searchQuery]);

  // Available sites in the items for filter pills
  const availableSites = useMemo(() => {
    const set = new Set<string>();
    catalogItems.forEach(item => {
      if (item.warehouseId) set.add(item.warehouseId);
    });
    return Array.from(set).sort();
  }, [catalogItems]);

  // Initialize selected item on open or when initialMaterialId changes
  useEffect(() => {
    if (!isOpen) return;

    if (initialMaterialId) {
      const target = displayItems.find(i => i.materialId === initialMaterialId || i.id === initialMaterialId);
      if (target) {
        setSelectedStockId(target.id);
        setActivePhotoIdx(0);
        return;
      }
    }

    if (displayItems.length > 0 && !displayItems.some(i => i.id === selectedStockId)) {
      setSelectedStockId(displayItems[0].id);
      setActivePhotoIdx(0);
    }
  }, [isOpen, initialMaterialId, displayItems, selectedStockId]);

  // Current active item
  const currentIndex = useMemo(() => {
    const idx = displayItems.findIndex(i => i.id === selectedStockId);
    return idx >= 0 ? idx : 0;
  }, [displayItems, selectedStockId]);

  const currentItem = displayItems[currentIndex] || displayItems[0];

  // Fetch full Material entity for extra metadata (description, images, manufacturer)
  const currentMaterial = useMemo<Material | undefined>(() => {
    if (!currentItem) return undefined;
    return dataService.getMaterial(currentItem.materialId);
  }, [currentItem]);

  // Current item photo list
  const photos = useMemo<string[]>(() => {
    if (!currentItem) return [];
    const list: string[] = [];

    if (currentMaterial?.images && currentMaterial.images.length > 0) {
      list.push(...currentMaterial.images);
    } else if (currentItem.imageUrl) {
      list.push(currentItem.imageUrl);
    } else if (currentMaterial?.imageUrl) {
      list.push(currentMaterial.imageUrl);
    } else {
      const sample = assignSampleMaterialImage(currentMaterial || {
        name: currentItem.materialName,
        materialCode: currentItem.materialCode,
        chineseName: currentItem.chineseName,
        specification: currentItem.specification
      });
      list.push(sample);
    }

    return list;
  }, [currentItem, currentMaterial]);

  const activePhotoUrl = photos[activePhotoIdx] || photos[0];

  // Navigation handlers
  const handlePrevItem = () => {
    if (displayItems.length === 0) return;
    const newIdx = (currentIndex - 1 + displayItems.length) % displayItems.length;
    setSelectedStockId(displayItems[newIdx].id);
    setActivePhotoIdx(0);
    scrollThumbnailIntoView(newIdx);
  };

  const handleNextItem = () => {
    if (displayItems.length === 0) return;
    const newIdx = (currentIndex + 1) % displayItems.length;
    setSelectedStockId(displayItems[newIdx].id);
    setActivePhotoIdx(0);
    scrollThumbnailIntoView(newIdx);
  };

  const scrollThumbnailIntoView = (idx: number) => {
    if (thumbnailCarouselRef.current) {
      const el = thumbnailCarouselRef.current.children[idx] as HTMLElement;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in search input
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'INPUT') return;

      if (e.key === 'ArrowLeft') {
        handlePrevItem();
      } else if (e.key === 'ArrowRight') {
        handleNextItem();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, displayItems]);

  if (!isOpen) return null;

  const locationParts = currentItem ? dataService.getLocationParts(currentItem) : [];
  const locationSummary = currentItem ? dataService.formatLocationSummary(currentItem) : '';

  const isLowStock = currentItem && currentItem.availableQuantity > 0 && currentItem.availableQuantity <= 5;
  const isOutOfStock = currentItem && currentItem.availableQuantity <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-6xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden text-white">
        
        {/* ========================================================================= */}
        {/* Top Control Bar: Title, Live Search & Site Filter Pills                   */}
        {/* ========================================================================= */}
        <div className="px-4 sm:px-5 py-3 bg-zinc-900/95 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <Camera className="w-4 h-4 text-zinc-200" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <span>{t.material_tour_title}</span>
                {displayItems.length > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-full font-semibold">
                    {currentIndex + 1} / {displayItems.length}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                {t.material_tour_subtitle}
              </p>
            </div>
          </div>

          {/* Center search bar */}
          <div className="flex-1 max-w-xs relative hidden sm:block">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher code, nom, spécification..."
              className="w-full bg-zinc-950/90 border border-zinc-700/80 rounded-full pl-8 pr-3 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Site Switcher Pills */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto py-1 px-2 bg-zinc-950/80 rounded-full border border-zinc-800 scrollbar-none">
            <button
              onClick={() => setSiteFilter('ALL')}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                siteFilter === 'ALL'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
              }`}
            >
              Tous ({catalogItems.length})
            </button>
            {availableSites.map((site) => {
              const count = catalogItems.filter(i => i.warehouseId === site).length;
              const isActive = siteFilter === site;
              return (
                <button
                  key={site}
                  onClick={() => setSiteFilter(site)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                    isActive
                      ? 'bg-white text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                  }`}
                >
                  <span>{site}</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-zinc-200 text-zinc-900' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors shrink-0"
            title={t.btn_close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Search & Site Pills Bar */}
        <div className="sm:hidden px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex flex-col gap-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher code, nom..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-full pl-8 pr-3 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSiteFilter('ALL')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                siteFilter === 'ALL' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              Tous
            </button>
            {availableSites.map(s => (
              <button
                key={s}
                onClick={() => setSiteFilter(s)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                  siteFilter === s ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Main Immersive Area: Image Viewport + Bottom Information Deck             */}
        {/* ========================================================================= */}
        <div className="relative flex-1 flex flex-col justify-between overflow-hidden bg-zinc-950 min-h-[440px] md:min-h-[540px]">
          
          {currentItem ? (
            <>
              {/* Material High-Definition Photo */}
              <div className="absolute inset-0 z-0 overflow-hidden bg-zinc-950 flex items-center justify-center">
                <img
                  key={activePhotoUrl}
                  src={activePhotoUrl}
                  alt={`${currentItem.materialCode} - ${currentItem.materialName}`}
                  className="w-full h-full object-cover transition-opacity duration-300 animate-fadeIn"
                />
                {/* Scrim gradients to guarantee high-contrast legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-black/30 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent pointer-events-none h-28" />
              </div>

              {/* Top In-Image Badges & Photo Angles Switcher */}
              <div className="relative z-10 p-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-xs font-mono font-bold text-white border border-white/20 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{currentItem.materialCode}</span>
                  </span>

                  <span className="px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-xs font-medium text-zinc-200 border border-white/15 flex items-center gap-1.5">
                    <WarehouseIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentItem.warehouseId}</span>
                  </span>

                  {currentItem.uom && (
                    <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-full text-xs font-mono text-zinc-300 border border-white/10 hidden sm:inline-flex">
                      {currentItem.uom}
                    </span>
                  )}

                  {/* Stock Availability Pill */}
                  {isOutOfStock ? (
                    <span className="px-2.5 py-1 bg-red-950/80 backdrop-blur-md text-red-300 border border-red-700/80 rounded-full text-xs font-semibold">
                      {t.out_of_stock_badge}
                    </span>
                  ) : isLowStock ? (
                    <span className="px-2.5 py-1 bg-amber-950/80 backdrop-blur-md text-amber-300 border border-amber-700/80 rounded-full text-xs font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>{t.low_stock_badge} ({currentItem.availableQuantity})</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-700/80 rounded-full text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>En stock ({currentItem.availableQuantity} {currentItem.uom})</span>
                    </span>
                  )}
                </div>

                {/* Multiple Photo Angles Preview (if available) */}
                {photos.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
                    <span className="text-[10px] text-zinc-400 font-semibold px-2 uppercase tracking-wider hidden sm:inline">
                      {t.tour_angle_photo || 'Vues'} ({photos.length}) :
                    </span>
                    {photos.map((photo, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => setActivePhotoIdx(pIdx)}
                        className={`relative w-9 h-7 rounded-md overflow-hidden border transition-all ${
                          pIdx === activePhotoIdx
                            ? 'border-white scale-105 shadow-md'
                            : 'border-white/30 opacity-70 hover:opacity-100'
                        }`}
                        title={`Angle ${pIdx + 1}`}
                      >
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Lateral Navigation Arrows */}
              <button
                onClick={handlePrevItem}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/65 hover:bg-black/90 backdrop-blur-md text-white border border-white/25 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
                title="Article précédent (Flèche gauche)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNextItem}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/65 hover:bg-black/90 backdrop-blur-md text-white border border-white/25 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
                title="Article suivant (Flèche droite)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Horizontal Thumbnail Strip Carousel (for quick material jumps) */}
              <div className="relative z-10 mx-3 sm:mx-5 mb-2 overflow-hidden">
                <div
                  ref={thumbnailCarouselRef}
                  className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none"
                >
                  {displayItems.map((item, idx) => {
                    const isSelected = item.id === currentItem.id;
                    const thumbUrl = item.imageUrl || assignSampleMaterialImage({
                      name: item.materialName,
                      materialCode: item.materialCode
                    });

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedStockId(item.id);
                          setActivePhotoIdx(0);
                        }}
                        className={`relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border transition-all flex flex-col justify-end p-1 text-left ${
                          isSelected
                            ? 'border-white ring-2 ring-white/60 scale-105 shadow-lg opacity-100'
                            : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'
                        }`}
                        title={`${item.materialCode} - ${item.materialName}`}
                      >
                        <img
                          src={thumbUrl}
                          alt={item.materialCode}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <span className="relative z-10 text-[9px] font-mono font-bold text-white truncate drop-shadow-xs">
                          {item.materialCode}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ========================================================================= */}
              {/* USER REQUIREMENT: Panneau d'informations tout en bas de l'image           */}
              {/* Affichage : Description, Nom, Localisation, Statistiques de stock & Actions*/}
              {/* ========================================================================= */}
              <div className="relative z-10 m-3 sm:m-5 p-4 sm:p-5 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/80 rounded-2xl shadow-2xl">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  
                  {/* Left Column: Material Identity, Physical Location & Technical Description */}
                  <div className="space-y-2 max-w-2xl">
                    
                    {/* Identification Header */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono font-bold text-sm bg-white text-zinc-950 px-2.5 py-0.5 rounded shadow-xs">
                        {currentItem.materialCode}
                      </span>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight">
                        {currentItem.materialName}
                      </h3>
                      {currentItem.chineseName && (
                        <span className="text-xs sm:text-sm text-zinc-300 font-sans px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700">
                          {currentItem.chineseName}
                        </span>
                      )}
                      {currentMaterial?.category && (
                        <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {currentMaterial.category}
                        </span>
                      )}
                    </div>

                    {/* Physical Location landmark & Granular Sub-tags */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-300 font-medium">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-100 border border-zinc-700">
                        {currentItem.warehouseId}
                      </span>

                      {locationParts.length > 0 ? (
                        locationParts.map((part, pIdx) => (
                          <span
                            key={pIdx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-zinc-800/90 border border-zinc-700 text-zinc-200 font-mono"
                          >
                            <span className="text-zinc-400 mr-1">{part.label}:</span>
                            <span className="font-semibold text-white">{part.value}</span>
                          </span>
                        ))
                      ) : (
                        <span className="font-mono text-zinc-200">{currentItem.binLocation}</span>
                      )}

                      {currentItem.locationNotes && (
                        <span className="text-[11px] text-amber-300/90 italic ml-1">
                          ({currentItem.locationNotes})
                        </span>
                      )}
                    </div>

                    {/* Material Technical Specification & Description */}
                    <div className="space-y-1">
                      {currentItem.specification && (
                        <p className="text-xs sm:text-sm font-mono text-zinc-300">
                          <span className="text-zinc-400 font-sans">Spécification : </span>
                          <span className="text-white font-semibold">{currentItem.specification}</span>
                        </p>
                      )}
                      {(currentMaterial?.description || currentItem.remarks) && (
                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                          {currentMaterial?.description || currentItem.remarks}
                        </p>
                      )}
                      {currentMaterial?.manufacturer && (
                        <p className="text-[11px] text-zinc-400">
                          Fabricant : <span className="text-zinc-200 font-medium">{currentMaterial.manufacturer}</span>
                          {currentMaterial.plant && (
                            <span className="ml-2 font-mono">| Usine : {currentMaterial.plant}</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Live Stock KPI Stats & Direct Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-800">
                    
                    {/* Live Stock Numbers */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full sm:w-auto bg-zinc-950/90 p-2.5 sm:p-3 rounded-xl border border-zinc-800 text-center shadow-inner">
                      <div className="px-2">
                        <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Stock Dispo</span>
                        <span className="text-sm sm:text-base font-bold font-mono text-white mt-0.5 block">
                          {currentItem.availableQuantity.toLocaleString()}
                          <span className="text-[10px] text-zinc-400 font-normal ml-1">{currentItem.uom}</span>
                        </span>
                      </div>
                      <div className="px-2 border-x border-zinc-800">
                        <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Prix Unit.</span>
                        <span className="text-sm sm:text-base font-bold font-mono text-zinc-200 mt-0.5 block">
                          ${currentItem.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="px-2">
                        <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Valeur Totale</span>
                        <span className="text-sm sm:text-base font-bold font-mono text-emerald-400 mt-0.5 block">
                          ${currentItem.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Quick Operation Action Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
                      {canOperateStock && onQuickReceipt && (
                        <button
                          type="button"
                          onClick={() => onQuickReceipt(currentItem)}
                          className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors border border-zinc-700"
                          title="Entrée rapide de matériel"
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                          <span>+ Entrée</span>
                        </button>
                      )}

                      {canOperateStock && onQuickIssue && (
                        <button
                          type="button"
                          onClick={() => onQuickIssue(currentItem)}
                          className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors border border-zinc-700"
                          title="Sortie rapide de matériel"
                        >
                          <ArrowUpFromLine className="w-3.5 h-3.5" />
                          <span>- Sortie</span>
                        </button>
                      )}

                      {canOperateStock && onQuickTransfer && (
                        <button
                          type="button"
                          onClick={() => onQuickTransfer(currentItem)}
                          className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors border border-zinc-700"
                          title="Transférer vers un autre magasin"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                          <span>⇄ Transfert</span>
                        </button>
                      )}

                      {onOpenLabelModal && (
                        <button
                          type="button"
                          onClick={() => onOpenLabelModal(currentItem)}
                          className="p-1.5 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors"
                          title="Imprimer QR Code & Étiquette"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      )}

                      {onOpenMaterialModal && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenMaterialModal(currentItem.materialId);
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                          title="Ouvrir la fiche complète 360°"
                        >
                          <span>Fiche 360°</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400">
              <Package className="w-12 h-12 text-zinc-600 mb-3" />
              <p className="text-sm font-medium text-zinc-300">Aucun matériel ne correspond aux critères de recherche.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSiteFilter('ALL');
                }}
                className="mt-3 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs rounded-full border border-zinc-700 transition-colors"
              >
                Réinitialiser la recherche
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
