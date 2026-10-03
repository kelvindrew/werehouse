import React, { useState, useMemo, useEffect } from 'react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import { StockItem, StorageLocation } from '@shared/types/models';
import { 
  ClipboardCheck, 
  Search, 
  Save, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  AlertTriangle, 
  Check, 
  Play, 
  Boxes, 
  MapPin, 
  Plus, 
  Minus, 
  Equal, 
  Clock, 
  User as UserIcon, 
  Sparkles, 
  Filter,
  CheckCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { AutocompleteInput } from './AutocompleteInput';
import { useResponsiveViewMode } from '../hooks/useResponsiveViewMode';
import { ViewModeSwitcher } from './ViewModeSwitcher';
import { MobileTableNotice } from './MobileTableNotice';

export const InventoryView: React.FC = () => {
  const { currentUser, selectedWarehouse, setSelectedWarehouse, t } = useAuth();

  // Storage key for active session warehouse
  const SESSION_KEY = 'wms_active_inventory_session_wh';
  const VERIFIED_KEY_PREFIX = 'wms_inventory_verified_';

  // Session state: Step 1 (selection & validation) vs Step 2 (active counting)
  const [isSessionActive, setIsSessionActive] = useState<boolean>(() => {
    return !!sessionStorage.getItem(SESSION_KEY);
  });

  const [activeWarehouse, setActiveWarehouse] = useState<string>(() => {
    return sessionStorage.getItem(SESSION_KEY) || (selectedWarehouse !== 'ALL' ? selectedWarehouse : 'B1');
  });

  // Target warehouse chosen in Step 1 (before validation)
  const [pendingWarehouse, setPendingWarehouse] = useState<string>(activeWarehouse);

  // Search filter for Step 1 location selector
  const [locationSearch, setLocationSearch] = useState('');

  // Verified items in current session
  const [verifiedItemIds, setVerifiedItemIds] = useState<Set<string>>(() => {
    try {
      const stored = sessionStorage.getItem(`${VERIFIED_KEY_PREFIX}${activeWarehouse}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (e) {
      return new Set();
    }
  });

  // Inputs for active session
  const [binSearch, setBinSearch] = useState('');
  const [materialSearch, setMaterialSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'DIFF' | 'OK'>('ALL');
  const [counts, setCounts] = useState<Record<string, number | ''>>({});
  const [adjustmentReasons, setAdjustmentReasons] = useState<Record<string, string>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [viewMode, handleSetViewMode] = useResponsiveViewMode('wms_inventory_view_mode');

  // Trigger haptic vibration for mobile phones
  const triggerHaptic = (duration = 15) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (e) {}
    }
  };

  // Subscribe to dataService updates
  const [dataVersion, setDataVersion] = useState(0);
  useEffect(() => {
    const unsub = dataService.subscribe(() => {
      setDataVersion(v => v + 1);
    });
    return () => unsub();
  }, []);

  // Locations list
  const locations = useMemo(() => dataService.getLocations(), [dataVersion]);

  // Stock items for the active warehouse
  const stockItems = useMemo(() => {
    if (!activeWarehouse) return [];
    return dataService.getStock({ warehouseId: activeWarehouse });
  }, [activeWarehouse, dataVersion]);

  // Save verified items into sessionStorage
  const markItemAsVerified = (stockId: string) => {
    setVerifiedItemIds(prev => {
      const next = new Set(prev);
      next.add(stockId);
      try {
        sessionStorage.setItem(`${VERIFIED_KEY_PREFIX}${activeWarehouse}`, JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });
  };

  // Filtered stock items based on search and status tabs
  const filteredItems = useMemo(() => {
    return stockItems.filter(s => {
      const matchBin = !binSearch || s.binLocation.toLowerCase().includes(binSearch.toLowerCase());
      const matchMat = !materialSearch || 
        s.materialCode.toLowerCase().includes(materialSearch.toLowerCase()) ||
        s.materialName.toLowerCase().includes(materialSearch.toLowerCase()) ||
        (s.specification && s.specification.toLowerCase().includes(materialSearch.toLowerCase()));

      if (!matchBin || !matchMat) return false;

      const isVerified = verifiedItemIds.has(s.id);
      const rawCount = counts[s.id];
      const hasCount = rawCount !== undefined && rawCount !== '';
      const countedQty = hasCount ? Number(rawCount) : s.quantity;
      const isDiff = hasCount && countedQty !== s.quantity;

      if (statusFilter === 'PENDING') {
        return !isVerified && !hasCount;
      }
      if (statusFilter === 'DIFF') {
        return isDiff;
      }
      if (statusFilter === 'OK') {
        return isVerified || (hasCount && !isDiff);
      }

      return true;
    });
  }, [stockItems, binSearch, materialSearch, statusFilter, counts, verifiedItemIds]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = stockItems.length;
    let diffCount = 0;
    let okCount = 0;

    stockItems.forEach(s => {
      const isVerified = verifiedItemIds.has(s.id);
      const rawCount = counts[s.id];
      const hasCount = rawCount !== undefined && rawCount !== '';
      const countedQty = hasCount ? Number(rawCount) : s.quantity;
      const isDiff = hasCount && countedQty !== s.quantity;

      if (isDiff) {
        diffCount++;
      } else if (isVerified || (hasCount && !isDiff)) {
        okCount++;
      }
    });

    const pendingCount = total - okCount - diffCount;
    const progressPercent = total > 0 ? Math.round(((okCount + diffCount) / total) * 100) : 0;

    return { total, diffCount, okCount, pendingCount, progressPercent };
  }, [stockItems, counts, verifiedItemIds]);

  // Handle validating Step 1 and starting active inventory
  const handleStartInventory = () => {
    triggerHaptic(25);
    setActiveWarehouse(pendingWarehouse);
    setIsSessionActive(true);
    sessionStorage.setItem(SESSION_KEY, pendingWarehouse);

    // Sync active warehouse with AuthContext
    if (pendingWarehouse !== selectedWarehouse) {
      setSelectedWarehouse(pendingWarehouse);
    }

    setFeedbackMsg({
      text: `Session d'inventaire validée et ouverte pour : ${pendingWarehouse}. Bon comptage !`,
      type: 'success'
    });
  };

  // Change warehouse / close session
  const handleChangeWarehouse = () => {
    triggerHaptic(15);
    if (Object.keys(counts).length > 0) {
      const confirmed = window.confirm("Des comptages sont en cours. Voulez-vous vraiment changer de magasin ou clôturer la session ?");
      if (!confirmed) return;
    }
    setIsSessionActive(false);
    sessionStorage.removeItem(SESSION_KEY);
    setPendingWarehouse(activeWarehouse);
    setCounts({});
    setAdjustmentReasons({});
  };

  // Count changes
  const handleCountChange = (stockId: string, val: string) => {
    setCounts(prev => ({
      ...prev,
      [stockId]: val === '' ? '' : Number(val)
    }));
  };

  // Stepper increment / decrement
  const handleStepCount = (item: StockItem, delta: number) => {
    triggerHaptic(10);
    const currentVal = counts[item.id];
    const base = currentVal !== undefined && currentVal !== '' ? Number(currentVal) : item.quantity;
    const nextVal = Math.max(0, base + delta);
    setCounts(prev => ({
      ...prev,
      [item.id]: nextVal
    }));
  };

  // One-tap quick match theoretical stock
  const handleMatchTheoretical = (item: StockItem) => {
    triggerHaptic(15);
    setCounts(prev => ({
      ...prev,
      [item.id]: item.quantity
    }));
    markItemAsVerified(item.id);
    setFeedbackMsg({
      text: `${item.materialCode} (${item.binLocation}) : Conforme (${item.quantity} ${item.uom}) validé !`,
      type: 'success'
    });
  };

  // Reason changes
  const handleReasonChange = (stockId: string, reason: string) => {
    setAdjustmentReasons(prev => ({
      ...prev,
      [stockId]: reason
    }));
  };

  // Save adjustment for discrepancies
  const handleSaveAdjustment = (item: StockItem) => {
    triggerHaptic(20);
    setFeedbackMsg(null);
    const countedVal = counts[item.id];
    if (countedVal === undefined || countedVal === '' || isNaN(Number(countedVal))) {
      setFeedbackMsg({ text: t.physical_count, type: 'error' });
      return;
    }

    const countedQty = Number(countedVal);
    if (countedQty < 0) {
      setFeedbackMsg({ text: t.qty_cannot_be_negative, type: 'error' });
      return;
    }

    const reason = adjustmentReasons[item.id] || t.mov_adjustment;

    try {
      dataService.performInventoryAdjustment({
        stockId: item.id,
        physicalQuantity: countedQty,
        reason,
        user: currentUser
      });

      markItemAsVerified(item.id);

      setFeedbackMsg({
        text: `${t.inventory_updated} : ${item.materialCode} (${item.binLocation}) -> ${countedQty} ${item.uom}.`,
        type: 'success'
      });

      // Clear the temporary inputs for this item
      setCounts(prev => {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      });
      setAdjustmentReasons(prev => {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      });
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Error', type: 'error' });
    }
  };

  // Quick preset discrepancy reasons
  const REASON_PRESETS = [
    'Casse / Perte constatée',
    'Erreur d\'adressage',
    'Surplus physique',
    'Non trouvé en rayon'
  ];

  // =========================================================================
  // STEP 1: WAREHOUSE SELECTION & VALIDATION GATE
  // =========================================================================
  if (!isSessionActive) {
    const selectedLocationObj = locations.find(l => l.code === pendingWarehouse) || locations[0];
    const pendingStockCount = selectedLocationObj ? dataService.getStock({ warehouseId: selectedLocationObj.code }).length : 0;

    const filteredLocations = locations.filter(l => {
      if (!locationSearch) return true;
      const q = locationSearch.toLowerCase();
      return l.code.toLowerCase().includes(q) || l.name.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q);
    });

    return (
      <div className="max-w-4xl mx-auto space-y-5 pb-32">
        {/* Step 1 Header Hero Card */}
        <div className="relative overflow-hidden bg-white rounded-3xl p-5 sm:p-7 border border-zinc-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-lime/20 via-transparent to-transparent -mr-20 -mt-20 pointer-events-none rounded-full blur-2xl" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-lime text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <ClipboardCheck className="w-3.5 h-3.5 text-lime" />
              <span>Inventaire Physique Mobile</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
              {t.inventory_step1_title || 'Étape 1 : Choix du magasin à inventorier'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 max-w-2xl leading-relaxed">
              {t.inventory_step1_subtitle || 'Sélectionnez le magasin ou le conteneur à auditer avant de démarrer le comptage terrain.'}
            </p>

            {/* Operator & Session Info */}
            <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-200/80">
                <UserIcon className="w-3.5 h-3.5 text-zinc-700" />
                <span className="font-semibold text-zinc-900">{currentUser.name}</span>
                <span className="text-[10px] bg-zinc-200 text-zinc-700 px-1.5 py-0.2 rounded font-mono font-bold">
                  {currentUser.role}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-200/80">
                <Clock className="w-3.5 h-3.5 text-zinc-700" />
                <span>Session du {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between border shadow-xs ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <span>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Search / Filter for Locations */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            placeholder={t.inv_search_site_placeholder}
            className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200/90 rounded-2xl text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all shadow-xs"
          />
        </div>

        {/* Interactive Warehouse Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredLocations.map((loc) => {
            const isSelected = pendingWarehouse === loc.code;
            const itemsCount = dataService.getStock({ warehouseId: loc.code }).length;

            return (
              <div
                key={loc.id}
                onClick={() => {
                  triggerHaptic(12);
                  setPendingWarehouse(loc.code);
                }}
                className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 text-left relative overflow-hidden select-none active:scale-[0.98] ${
                  isSelected
                    ? 'bg-zinc-950 text-white ring-2 ring-lime/80 shadow-[0_12px_28px_rgba(0,0,0,0.22)]'
                    : 'bg-white hover:bg-zinc-50 border border-zinc-200/90 text-zinc-900 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${
                      isSelected 
                        ? 'bg-lime text-zinc-950 shadow-[0_0_15px_rgba(200,255,0,0.4)]' 
                        : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono font-bold text-sm px-1.5 py-0.5 rounded text-xs ${
                          isSelected ? 'bg-zinc-800 text-lime' : 'bg-zinc-100 text-zinc-900'
                        }`}>
                          {loc.code}
                        </span>
                        <span className="font-bold text-xs sm:text-sm line-clamp-1">
                          {loc.name}
                        </span>
                      </div>
                      <span className={`text-[10px] block mt-0.5 line-clamp-1 ${
                        isSelected ? 'text-zinc-400' : 'text-zinc-500'
                      }`}>
                        {loc.physicalLocation || loc.type}
                      </span>
                    </div>
                  </div>

                  {/* Radio Checkmark */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-lime text-zinc-950 scale-110'
                      : 'border-2 border-zinc-300 text-transparent'
                  }`}>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                {loc.description && (
                  <p className={`text-[11px] mt-2.5 line-clamp-1 ${
                    isSelected ? 'text-zinc-300' : 'text-zinc-500'
                  }`}>
                    {loc.description}
                  </p>
                )}

                <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs font-mono ${
                  isSelected ? 'border-zinc-800 text-zinc-300' : 'border-zinc-100 text-zinc-600'
                }`}>
                  <span className="flex items-center gap-1">
                    <Boxes className="w-3.5 h-3.5" />
                    <span className="font-bold text-sm">{itemsCount}</span> articles
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    isSelected ? 'bg-zinc-800 text-lime' : 'bg-zinc-100 text-zinc-700'
                  }`}>
                    {loc.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Location Summary Gate */}
        {selectedLocationObj && (
          <div className="bg-lime/10 border-2 border-lime/40 rounded-2xl sm:rounded-3xl p-3.5 xs:p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 shadow-sm">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 xs:gap-2">
                <span className="text-[11px] xs:text-xs font-bold uppercase tracking-wider text-zinc-700">{t.col_warehouse || 'Magasin'} :</span>
                <span className="font-mono font-bold text-xs xs:text-sm bg-zinc-900 text-lime px-2 py-0.5 rounded-md">
                  {selectedLocationObj.code}
                </span>
                <span className="font-bold text-zinc-950 text-xs xs:text-sm truncate">{selectedLocationObj.name}</span>
              </div>
              <p className="text-[11px] xs:text-xs text-zinc-600 mt-1 line-clamp-2">
                {selectedLocationObj.physicalLocation} • <span className="font-bold text-zinc-900">{pendingStockCount} {t.dash_refs_locations || 'références'}</span> {t.inventory_filter_pending || 'à vérifier'}.
              </p>
            </div>

            {/* Validation & Start Button */}
            <button
              type="button"
              onClick={handleStartInventory}
              className="w-full sm:w-auto px-4 xs:px-6 py-3 xs:py-3.5 bg-zinc-950 hover:bg-zinc-900 text-lime font-black text-xs xs:text-sm sm:text-base rounded-xl xs:rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(0,0,0,0.25)] active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-lime shrink-0" />
              <span className="truncate">{t.inventory_btn_start || "Valider et commencer l'inventaire"}</span>
              <ArrowRight className="w-4 h-4 text-lime shrink-0" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // STEP 2: ACTIVE INVENTORY COUNTING SESSION (TERRAIN / MOBILE)
  // =========================================================================
  const activeLocationObj = locations.find(l => l.code === activeWarehouse);

  return (
    <div className="space-y-4 pb-36">
      {/* Top Active Session Sticky Control Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-950 text-lime flex items-center justify-center shrink-0 shadow-md">
              <ClipboardCheck className="w-5 h-5 text-lime" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {t.inventory_session_active || 'Inventaire en cours'}
                </span>
                <span className="font-mono font-bold text-sm bg-zinc-900 text-lime px-2 py-0.5 rounded">
                  {activeWarehouse}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight mt-0.5">
                {activeLocationObj?.name || `Magasin ${activeWarehouse}`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Prominent View Mode Switcher: Cartes | Tableau */}
            <ViewModeSwitcher
              viewMode={viewMode}
              onChange={handleSetViewMode}
              cardsLabel={t.btn_cards}
              tableLabel={t.btn_table}
            />

            {/* Change Warehouse / Exit Session Button */}
            <button
              type="button"
              onClick={handleChangeWarehouse}
              className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-full transition-all flex items-center gap-1 active:scale-95 border border-zinc-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.inventory_change_wh || 'Changer de magasin'}</span>
              <span className="sm:hidden">Quitter</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Counter */}
        <div className="pt-2 border-t border-zinc-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span className="text-zinc-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{stats.okCount + stats.diffCount} / {stats.total} vérifiés</span>
            </span>
            <span className="text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-md">
              {stats.progressPercent}%
            </span>
          </div>

          <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden border border-zinc-200/60 p-0.5">
            <div 
              className="h-full bg-linear-to-r from-emerald-500 to-lime rounded-full transition-all duration-300"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between border shadow-xs ${
          feedbackMsg.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-4 border border-zinc-200/90 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Bin / Allée Filter */}
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              {t.col_bin} / {t.col_location}
            </label>
            <AutocompleteInput
              field="binLocation"
              placeholder={`${t.filter_by || 'Filtrer'} : ${t.col_bin}...`}
              value={binSearch}
              onChange={setBinSearch}
              fontMono
              uppercase
              inputClassName="rounded-2xl bg-zinc-50 border-zinc-200 text-xs py-2 px-3.5 w-full focus:bg-white"
            />
          </div>

          {/* Material Code & Name */}
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              {t.mat_code} / {t.mat_field_name}
            </label>
            <AutocompleteInput
              field="materialName"
              placeholder={t.search_placeholder}
              value={materialSearch}
              onChange={setMaterialSearch}
              inputClassName="rounded-2xl bg-zinc-50 border-zinc-200 text-xs py-2 px-3.5 w-full focus:bg-white"
            />
          </div>
        </div>

        {/* Quick Status Filter Tabs (Ergonomic Touch Chips) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-zinc-100">
          <button
            type="button"
            onClick={() => { triggerHaptic(); setStatusFilter('ALL'); }}
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold whitespace-nowrap transition-all ${
              statusFilter === 'ALL'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {t.inventory_filter_all || 'Tous'} ({stats.total})
          </button>

          <button
            type="button"
            onClick={() => { triggerHaptic(); setStatusFilter('PENDING'); }}
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold whitespace-nowrap transition-all ${
              statusFilter === 'PENDING'
                ? 'bg-zinc-950 text-lime shadow-xs'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {t.inventory_filter_pending || 'À vérifier'} ({stats.pendingCount})
          </button>

          <button
            type="button"
            onClick={() => { triggerHaptic(); setStatusFilter('DIFF'); }}
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold whitespace-nowrap transition-all ${
              statusFilter === 'DIFF'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            {t.inventory_filter_diff || 'Écarts'} ({stats.diffCount})
          </button>

          <button
            type="button"
            onClick={() => { triggerHaptic(); setStatusFilter('OK'); }}
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold whitespace-nowrap transition-all ${
              statusFilter === 'OK'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            {t.inventory_filter_ok || 'Conformes'} ({stats.okCount})
          </button>
        </div>
      </div>

      {/* Main Counting Area: Tactile Cards (default) or Table */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredItems.map((item) => {
            const isVerified = verifiedItemIds.has(item.id);
            const rawCount = counts[item.id];
            const hasCount = rawCount !== undefined && rawCount !== '';
            const countedQty = hasCount ? Number(rawCount) : item.quantity;
            const diffQty = countedQty - item.quantity;
            const diffValue = Math.round(diffQty * item.unitPrice * 100) / 100;
            const isDiff = hasCount && diffQty !== 0;

            return (
              <div 
                key={item.id}
                className={`bg-white rounded-3xl p-4 border transition-all shadow-[0_4px_20px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between ${
                  isDiff
                    ? 'border-amber-400 bg-amber-50/30 ring-1 ring-amber-400/50'
                    : isVerified
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-zinc-200/90'
                }`}
              >
                <div>
                  {/* Card Header: Bin location + Code + Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs bg-zinc-900 text-white px-2.5 py-1 rounded-xl shadow-xs">
                      📍 {item.binLocation}
                    </span>

                    {/* Status Badge */}
                    {isVerified && !isDiff && (
                      <span className="flex items-center gap-1 font-mono font-bold text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Conforme</span>
                      </span>
                    )}

                    {isDiff && (
                      <span className="flex items-center gap-1 font-mono font-bold text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-amber-700" />
                        <span>Écart ({diffQty > 0 ? `+${diffQty}` : diffQty})</span>
                      </span>
                    )}

                    {!isVerified && !hasCount && (
                      <span className="font-mono font-bold text-[10px] text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                        À vérifier
                      </span>
                    )}
                  </div>

                  {/* Material Identifiers */}
                  <div className="mt-2.5">
                    <span className="font-mono font-bold text-xs text-zinc-900 block">
                      {item.materialCode}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 line-clamp-2 mt-0.5">
                      {item.materialName}
                    </h3>
                    {item.specification && (
                      <p className="text-[10px] text-zinc-500 font-mono line-clamp-1 mt-0.5">
                        {item.specification}
                      </p>
                    )}
                  </div>

                  {/* Theoretical vs Count Inputs */}
                  <div className="mt-3 pt-3 border-t border-zinc-100 grid grid-cols-2 gap-2">
                    {/* System Stock Box */}
                    <div className="bg-zinc-50 p-2.5 rounded-2xl border border-zinc-200/80 flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase text-zinc-400 font-mono">
                        {t.system_count || 'Stock Système'}
                      </span>
                      <span className="font-mono font-black text-sm sm:text-base text-zinc-900 mt-1">
                        {item.quantity.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">{item.uom}</span>
                      </span>
                    </div>

                    {/* Physical Count with Stepper */}
                    <div className="bg-zinc-50 p-2 rounded-2xl border border-zinc-200/80 flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 font-mono">
                        {t.physical_count || 'Comptage Réel'}
                      </span>
                      
                      {/* Tactile Stepper: [-] [Input] [+] */}
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          type="button"
                          onClick={() => handleStepCount(item, -1)}
                          className="w-7 h-7 rounded-lg bg-white border border-zinc-300 text-zinc-800 flex items-center justify-center font-bold active:scale-90 transition-all shrink-0 hover:bg-zinc-100"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <input
                          type="number"
                          step="any"
                          min="0"
                          placeholder={String(item.quantity)}
                          value={rawCount !== undefined ? rawCount : ''}
                          onChange={(e) => handleCountChange(item.id, e.target.value)}
                          className={`w-full min-w-0 bg-white border text-center font-mono text-sm font-bold py-1 px-1 rounded-lg focus:outline-none focus:ring-1 ${
                            isDiff 
                              ? 'border-amber-500 text-amber-950 bg-amber-50/50' 
                              : 'border-zinc-300 text-zinc-900'
                          }`}
                        />

                        <button
                          type="button"
                          onClick={() => handleStepCount(item, 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-zinc-300 text-zinc-800 flex items-center justify-center font-bold active:scale-90 transition-all shrink-0 hover:bg-zinc-100"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 1-Tap Quick Action: Equal Theoretical button */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleMatchTheoretical(item)}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border active:scale-95 ${
                        isVerified && !isDiff
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-800'
                      }`}
                    >
                      <Equal className="w-3 h-3 text-emerald-700" />
                      <span>{t.inventory_match_theory || '= Théorique'} ({item.quantity} {item.uom})</span>
                    </button>
                  </div>

                  {/* Discrepancy Alert & Reason Selection (if diff detected) */}
                  {isDiff && (
                    <div className="mt-3 p-2.5 rounded-2xl bg-amber-100/70 border border-amber-300 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span className="text-amber-950 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                          <span>{t.col_variance || 'Écart'} :</span>
                        </span>
                        <span className={diffQty > 0 ? 'text-emerald-800' : 'text-red-700'}>
                          {diffQty > 0 ? `+${diffQty}` : diffQty} {item.uom} ({diffValue > 0 ? `+${diffValue.toFixed(2)}` : diffValue.toFixed(2)} $)
                        </span>
                      </div>

                      {/* Reason Preset Chips */}
                      <div className="flex flex-wrap gap-1">
                        {REASON_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleReasonChange(item.id, preset)}
                            className={`text-[9px] font-medium px-2 py-0.5 rounded-full transition-all border ${
                              adjustmentReasons[item.id] === preset
                                ? 'bg-zinc-950 text-white border-zinc-950 font-bold'
                                : 'bg-white/80 border-amber-300/80 text-amber-900 hover:bg-white'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>

                      {/* Custom Reason Input */}
                      <input
                        type="text"
                        placeholder={t.issue_reason}
                        value={adjustmentReasons[item.id] || ''}
                        onChange={(e) => handleReasonChange(item.id, e.target.value)}
                        className="w-full bg-white border border-amber-300 text-xs px-2.5 py-1.5 rounded-xl text-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-end gap-2">
                  {isDiff ? (
                    <button
                      type="button"
                      onClick={() => handleSaveAdjustment(item)}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{t.inventory_confirm_line || 'Valider la régularisation'}</span>
                    </button>
                  ) : hasCount && !isVerified ? (
                    <button
                      type="button"
                      onClick={() => handleMatchTheoretical(item)}
                      className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.inv_confirm_compliant}</span>
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="col-span-full py-12 text-center text-zinc-400 font-mono text-xs bg-white rounded-3xl border border-zinc-200">
              <Boxes className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <span>{t.no_matching_stock || 'Aucun article trouvé dans ce filtre'}</span>
            </div>
          )}
        </div>
      )}

      {/* Table Mode Fallback */}
      {viewMode === 'table' && (
        <div className="bg-white border border-zinc-200/90 rounded-3xl shadow-xs overflow-hidden">
          <div className="p-3 pb-0">
            <MobileTableNotice
              onSwitchToCards={() => handleSetViewMode('cards')}
              cardsLabel={t.btn_cards}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 font-mono text-[11px] uppercase font-semibold">
                <tr>
                  <th className="py-3 px-3">{t.col_bin}</th>
                  <th className="py-3 px-3">{t.col_code}</th>
                  <th className="py-3 px-3">{t.col_name}</th>
                  <th className="py-3 px-3 text-right">{t.system_count}</th>
                  <th className="py-3 px-3 text-center">{t.col_uom}</th>
                  <th className="py-3 px-3 text-center w-36">{t.physical_count}</th>
                  <th className="py-3 px-3 text-right">{t.variance}</th>
                  <th className="py-3 px-3">{t.issue_reason}</th>
                  <th className="py-3 px-3 text-center">{t.col_actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredItems.map((item) => {
                  const isVerified = verifiedItemIds.has(item.id);
                  const rawCount = counts[item.id];
                  const hasCount = rawCount !== undefined && rawCount !== '';
                  const countedQty = hasCount ? Number(rawCount) : item.quantity;
                  const diffQty = countedQty - item.quantity;
                  const diffValue = Math.round(diffQty * item.unitPrice * 100) / 100;
                  const isDiff = hasCount && diffQty !== 0;

                  return (
                    <tr key={item.id} className={`hover:bg-zinc-50 transition-colors ${isDiff ? 'bg-amber-50/50' : isVerified ? 'bg-emerald-50/30' : ''}`}>
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">
                        <span className="bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
                          {item.binLocation}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">
                        {item.materialCode}
                      </td>
                      <td className="py-2.5 px-3 max-w-[220px]">
                        <span className="text-zinc-900 font-medium truncate block">{item.materialName}</span>
                        {item.specification && <span className="text-[10px] text-zinc-500 font-mono block truncate">{item.specification}</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900">
                        {item.quantity.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-zinc-600">
                        {item.uom}
                      </td>

                      {/* Physical count input */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            placeholder={String(item.quantity)}
                            value={rawCount !== undefined ? rawCount : ''}
                            onChange={(e) => handleCountChange(item.id, e.target.value)}
                            className={`w-20 bg-white border px-2 py-1 rounded text-center font-mono text-xs font-bold focus:outline-none ${
                              isDiff ? 'border-amber-500 text-amber-900 bg-amber-50' : 'border-zinc-300 text-zinc-900'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => handleMatchTheoretical(item)}
                            title="Égal au théorique"
                            className="p-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                          >
                            <Equal className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Difference */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        {isDiff ? (
                          <div>
                            <span className={diffQty > 0 ? 'text-emerald-700' : 'text-red-600'}>
                              {diffQty > 0 ? `+${diffQty}` : diffQty} {item.uom}
                            </span>
                            <span className="text-[10px] text-zinc-500 block">
                              (${diffValue > 0 ? `+${diffValue.toFixed(2)}` : diffValue.toFixed(2)})
                            </span>
                          </div>
                        ) : isVerified ? (
                          <span className="text-emerald-600 font-bold">✓ Conforme</span>
                        ) : (
                          <span className="text-zinc-400 font-normal">{t.no_discrepancy}</span>
                        )}
                      </td>

                      {/* Reason */}
                      <td className="py-2.5 px-3">
                        {isDiff ? (
                          <input
                            type="text"
                            placeholder="Motif de l'écart..."
                            value={adjustmentReasons[item.id] || ''}
                            onChange={(e) => handleReasonChange(item.id, e.target.value)}
                            className="w-full bg-white border border-zinc-200 text-xs px-2 py-1 rounded"
                          />
                        ) : (
                          <span className="text-zinc-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center">
                        {isDiff ? (
                          <button
                            type="button"
                            onClick={() => handleSaveAdjustment(item)}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 mx-auto"
                          >
                            <Save className="w-3 h-3" />
                            <span>{t.btn_confirm}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMatchTheoretical(item)}
                            className="text-[10px] text-zinc-500 hover:text-zinc-900 underline"
                          >
                            Valider
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Session Recap Card (Cleanly adapted to all screen sizes without covering content) */}
      <div className="mt-8 mb-4 p-4 xs:p-5 rounded-2xl sm:rounded-3xl bg-zinc-950 text-white border border-zinc-800 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 sm:gap-4">
        <div className="flex flex-wrap items-center gap-2.5 xs:gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-lime animate-pulse"></span>
            <span className="text-zinc-400">{t.col_warehouse} :</span>
            <span className="font-bold text-lime text-xs xs:text-sm">{activeWarehouse}</span>
          </div>
          <span className="text-zinc-600">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">{t.inv_status_verified || 'Vérifiés'} :</span>
            <span className="font-bold text-white text-xs xs:text-sm">{stats.okCount + stats.diffCount} / {stats.total}</span>
          </div>
          {stats.diffCount > 0 && (
            <>
              <span className="text-zinc-600">•</span>
              <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/60">
                {stats.diffCount} {t.col_variance || 'écart(s)'}
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleChangeWarehouse}
          className="w-full sm:w-auto px-5 py-3 bg-lime hover:bg-lime/90 text-zinc-950 font-black text-xs xs:text-sm rounded-xl xs:rounded-2xl active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <CheckCheck className="w-4 h-4 text-zinc-950" />
          <span>{t.inventory_finish_session || 'Clôturer la session'}</span>
        </button>
      </div>
    </div>
  );
};

export default InventoryView;
