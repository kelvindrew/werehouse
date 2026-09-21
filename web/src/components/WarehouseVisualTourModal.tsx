import React, { useState, useEffect, useMemo } from 'react';
import { StorageLocation, LocationType } from '@shared/types/models';
import { dataService } from '../lib/dataService';
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
  Warehouse as WarehouseIcon,
  Box,
  Truck,
  Wrench,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Edit2
} from 'lucide-react';

interface WarehouseVisualTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocationCode?: string;
  onSelectLocationForStock: (locationCode: string) => void;
  onOpenEditLocation?: (location: StorageLocation) => void;
}

export const WarehouseVisualTourModal: React.FC<WarehouseVisualTourModalProps> = ({
  isOpen,
  onClose,
  initialLocationCode,
  onSelectLocationForStock,
  onOpenEditLocation,
}) => {
  const { t, currentUser } = useAuth();
  const [locations, setLocations] = useState<StorageLocation[]>(() => dataService.getLocations());
  const [selectedCode, setSelectedCode] = useState<string>(initialLocationCode || 'B1');
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);

  // Sync locations
  useEffect(() => {
    const update = () => setLocations(dataService.getLocations());
    const unsub = dataService.subscribe(update);
    return () => unsub();
  }, []);

  // Update selected code when initialLocationCode changes
  useEffect(() => {
    if (initialLocationCode) {
      setSelectedCode(initialLocationCode);
      setActivePhotoIdx(0);
    } else if (locations.length > 0 && !locations.some(l => l.code === selectedCode)) {
      setSelectedCode(locations[0].code);
      setActivePhotoIdx(0);
    }
  }, [initialLocationCode, locations]);

  // Current active location
  const currentIndex = useMemo(() => {
    const idx = locations.findIndex(l => l.code === selectedCode);
    return idx >= 0 ? idx : 0;
  }, [locations, selectedCode]);

  const currentLocation = locations[currentIndex] || locations[0];

  // Current location photos
  const photos = useMemo(() => {
    if (!currentLocation) return [];
    if (currentLocation.images && currentLocation.images.length > 0) {
      return currentLocation.images;
    }
    if (currentLocation.imageUrl) {
      return [currentLocation.imageUrl];
    }
    return ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80'];
  }, [currentLocation]);

  const activePhotoUrl = photos[activePhotoIdx] || photos[0];

  // Navigation handlers
  const handlePrevLocation = () => {
    const newIdx = (currentIndex - 1 + locations.length) % locations.length;
    setSelectedCode(locations[newIdx].code);
    setActivePhotoIdx(0);
  };

  const handleNextLocation = () => {
    const newIdx = (currentIndex + 1) % locations.length;
    setSelectedCode(locations[newIdx].code);
    setActivePhotoIdx(0);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevLocation();
      } else if (e.key === 'ArrowRight') {
        handleNextLocation();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, locations]);

  if (!isOpen || !currentLocation) return null;

  const getLocationTypeIcon = (type: LocationType) => {
    switch (type) {
      case 'WAREHOUSE': return <WarehouseIcon className="w-4 h-4 text-zinc-800" />;
      case 'CONTAINER': return <Box className="w-4 h-4 text-zinc-800" />;
      case 'YARD': return <Truck className="w-4 h-4 text-zinc-800" />;
      case 'WORKSHOP': return <Wrench className="w-4 h-4 text-zinc-800" />;
      case 'QUARANTINE': return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default: return <MapPin className="w-4 h-4 text-zinc-800" />;
    }
  };

  const getLocationTypeLabel = (type: LocationType) => {
    switch (type) {
      case 'WAREHOUSE': return t.type_warehouse;
      case 'CONTAINER': return t.type_container;
      case 'YARD': return t.type_yard;
      case 'WORKSHOP': return t.type_workshop;
      case 'TEMPORARY': return t.type_temporary;
      case 'QUARANTINE': return t.type_quarantine;
      case 'OFFICE': return t.type_office;
      default: return t.type_other;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-6xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Top Control Bar with Location Selector Pills */}
        <div className="px-5 py-3.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <Camera className="w-4 h-4 text-zinc-200" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <span>{t.visual_tour_title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-full font-semibold">
                  {currentIndex + 1} / {locations.length}
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                {t.visual_tour_subtitle}
              </p>
            </div>
          </div>

          {/* Quick Site Switcher Pills */}
          <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto py-1 px-2 bg-zinc-950/80 rounded-full border border-zinc-800 scrollbar-none">
            {locations.map((loc) => {
              const isActive = loc.code === selectedCode;
              return (
                <button
                  key={loc.id}
                  onClick={() => {
                    setSelectedCode(loc.code);
                    setActivePhotoIdx(0);
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                  }`}
                >
                  <span>{loc.code}</span>
                  {loc.totalItemsCount !== undefined && loc.totalItemsCount > 0 && (
                    <span className={`text-[9px] px-1 py-0.2 rounded-full ${
                      isActive ? 'bg-zinc-200 text-zinc-900 font-mono' : 'bg-zinc-800 text-zinc-400 font-mono'
                    }`}>
                      {loc.totalItemsCount}
                    </span>
                  )}
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

        {/* Mobile Pills Bar */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto px-4 py-2 bg-zinc-900 border-b border-zinc-800 scrollbar-none shrink-0">
          {locations.map((loc) => {
            const isActive = loc.code === selectedCode;
            return (
              <button
                key={loc.id}
                onClick={() => {
                  setSelectedCode(loc.code);
                  setActivePhotoIdx(0);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white bg-zinc-800/60'
                }`}
              >
                {loc.code} — {loc.name}
              </button>
            );
          })}
        </div>

        {/* Main Immersive Area: Image Viewport + Bottom Information Deck */}
        <div className="relative flex-1 flex flex-col justify-between overflow-hidden bg-zinc-950 min-h-[420px] md:min-h-[520px]">
          {/* Warehouse High-Definition Photo */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              key={activePhotoUrl}
              src={activePhotoUrl}
              alt={`${currentLocation.name} - ${currentLocation.code}`}
              className="w-full h-full object-cover transition-opacity duration-300 animate-fadeIn"
            />
            {/* Scrim gradients to guarantee high-contrast legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-black/30 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent pointer-events-none h-24" />
          </div>

          {/* Top In-Image Controls: Multiple Photo Angles Switcher */}
          <div className="relative z-10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-mono font-bold text-white border border-white/20 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{currentLocation.code}</span>
              </span>
              <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium text-zinc-300 border border-white/10 hidden sm:inline-flex items-center gap-1.5">
                {getLocationTypeIcon(currentLocation.type)}
                <span>{getLocationTypeLabel(currentLocation.type)}</span>
              </span>
            </div>

            {/* Photo Angles Preview (if multiple angles available) */}
            {photos.length > 1 && (
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
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
            onClick={handlePrevLocation}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-lg"
            title="Magasin précédent (Flèche gauche)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNextLocation}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-lg"
            title="Magasin suivant (Flèche droite)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* ========================================================================= */}
          {/* USER REQUIREMENT: Panneau d'informations tout en bas de l'image           */}
          {/* Affichage : Description, Nom, Localisation, Statistiques de stock & Actions*/}
          {/* ========================================================================= */}
          <div className="relative z-10 m-3 sm:m-5 p-4 sm:p-5 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/80 rounded-2xl shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left Column: Warehouse Identity, Physical Location & Description */}
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono font-bold text-sm bg-white text-zinc-950 px-2.5 py-0.5 rounded shadow-xs">
                    {currentLocation.code}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {currentLocation.name}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {getLocationTypeLabel(currentLocation.type)}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{t.active_status || 'ACTIF'}</span>
                  </span>
                </div>

                {/* Physical Location landmark */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300 font-medium">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold text-zinc-100">
                    {currentLocation.physicalLocation || 'Localisation non spécifiée'}
                  </span>
                </div>

                {/* Warehouse Functional Description */}
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {currentLocation.description || 'Aucune description enregistrée pour ce site.'}
                </p>
              </div>

              {/* Right Column: Live Stock KPI Stats & Direct Navigation Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-800">
                {/* Live Stock Numbers */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full sm:w-auto bg-zinc-950/80 p-2.5 sm:p-3 rounded-xl border border-zinc-800/80 text-center">
                  <div className="px-2">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">{t.col_material || 'Articles'}</span>
                    <span className="text-sm sm:text-base font-bold font-mono text-white mt-0.5 block">
                      {currentLocation.totalItemsCount ?? 0}
                    </span>
                  </div>
                  <div className="px-2 border-x border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">{t.kpi_units || 'Unités'}</span>
                    <span className="text-sm sm:text-base font-bold font-mono text-white mt-0.5 block">
                      {(currentLocation.totalQuantity ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="px-2">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">{t.total_value_col || 'Valeur'}</span>
                    <span className="text-sm sm:text-base font-bold font-mono text-emerald-400 mt-0.5 block">
                      ${Math.round(currentLocation.totalValuationUSD ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {onOpenEditLocation && (currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERVISOR') && (
                    <button
                      type="button"
                      onClick={() => onOpenEditLocation(currentLocation)}
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition-colors inline-flex items-center gap-1.5"
                      title="Modifier les informations de ce magasin"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Modifier</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectLocationForStock(currentLocation.code);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-lg shadow-md transition-all inline-flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Boxes className="w-4 h-4" />
                    <span>{t.tour_view_stock}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
