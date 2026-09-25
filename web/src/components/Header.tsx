import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '@shared/types/models';
import { LANGUAGE_OPTIONS } from '../lib/i18n';
import { dataService } from '../lib/dataService';
import { 
  Building2, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowLeftRight,
  ChevronDown,
  Tablet,
  Search,
  Bell,
  Cloud,
  CloudOff,
  User,
  Check,
  X,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { firebaseSync, SyncStatus } from '../lib/firebaseSync';

interface HeaderProps {
  onOpenReceipt: () => void;
  onOpenIssue: () => void;
  onOpenTransfer: () => void;
  onSearchFocus?: () => void;
  onOpenCreateLocation?: () => void;
  isTabletMode?: boolean;
  onToggleTabletMode?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

const ROLE_DEFINITIONS: { role: UserRole; label: string; icon: string; desc: string }[] = [
  { role: 'ADMIN', label: 'Super Admin', icon: '👑', desc: 'Contrôle total, configuration & gestion' },
  { role: 'SUPERVISOR', label: 'Superviseur', icon: '🛡️', desc: 'Validation des sorties & audits' },
  { role: 'STOREKEEPER', label: 'Magasinier', icon: '📦', desc: 'Mouvements physiques & déstockage' },
  { role: 'VIEWER', label: 'Observateur', icon: '👁️', desc: 'Consultation seule en lecture' },
];

export const Header: React.FC<HeaderProps> = ({
  onOpenReceipt,
  onOpenIssue,
  onOpenTransfer,
  onSearchFocus,
  onOpenCreateLocation,
  isTabletMode,
  onToggleTabletMode,
  searchQuery = '',
  onSearchChange
}) => {
  const { 
    currentUser, 
    switchRole, 
    selectedWarehouse, 
    setSelectedWarehouse, 
    canOperateStock,
    currentLanguage,
    setLanguage,
    t
  } = useAuth();

  const [locations, setLocations] = useState(() => dataService.getLocations());
  const [hasNotifications, setHasNotifications] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => firebaseSync.getStatus());
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const unsubData = dataService.subscribe(() => {
      setLocations(dataService.getLocations());
    });
    const unsubSync = firebaseSync.onStatusChange((s) => {
      setSyncStatus(s);
    });
    return () => {
      unsubData();
      unsubSync();
    };
  }, []);

  return (
    <>
      <header className="h-16 liquid-glass border-b border-white/80 px-2.5 sm:px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-all">
        
        {/* ========================================================================= */}
        {/* LEFT: Warehouse / Site Selector                                           */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Warehouse Pill (< md): Compact, single pill with native select */}
          <div className="flex md:hidden relative items-center">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-carbon text-white rounded-full text-xs font-bold shadow-xs active:scale-95 transition-transform">
              <Building2 className="w-3.5 h-3.5 text-lime shrink-0" />
              <span className="font-mono text-[11px] truncate max-w-[85px]">
                {selectedWarehouse === 'ALL' ? 'Tous sites' : selectedWarehouse}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
            </div>
            <select
              aria-label={t.warehouse_view}
              value={selectedWarehouse}
              onChange={(e) => {
                if (e.target.value === '__ADD_LOCATION__') {
                  onOpenCreateLocation?.();
                } else {
                  setSelectedWarehouse(e.target.value);
                }
              }}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            >
              <option value="ALL">Tous les magasins</option>
              <option value="B1">B1 (MD01)</option>
              <option value="B2">B2 (Zones A-E)</option>
              {locations.filter(l => l.code !== 'B1' && l.code !== 'B2').map(loc => (
                <option key={loc.id} value={loc.code}>{loc.code} — {loc.name}</option>
              ))}
              {onOpenCreateLocation && (
                <option value="__ADD_LOCATION__">+ {t.btn_add_location || 'Nouveau site...'}</option>
              )}
            </select>
          </div>

          {/* Desktop Warehouse Pills (>= md): Full multi-button bar */}
          <div className="hidden md:flex items-center bg-zinc-200/50 p-1 rounded-full border border-zinc-300/60 shadow-inner">
            <button
              onClick={() => setSelectedWarehouse('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                selectedWarehouse === 'ALL'
                  ? 'bg-carbon text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedWarehouse('B1')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                selectedWarehouse === 'B1'
                  ? 'bg-carbon text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              B1 (MD01)
            </button>
            <button
              onClick={() => setSelectedWarehouse('B2')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                selectedWarehouse === 'B2'
                  ? 'bg-carbon text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              B2 (Zones A-E)
            </button>

            {/* Dropdown for other sites */}
            <div className="relative pl-1 border-l border-zinc-300/80 flex items-center">
              <select
                aria-label={t.warehouse_view}
                value={selectedWarehouse}
                onChange={(e) => {
                  if (e.target.value === '__ADD_LOCATION__') {
                    onOpenCreateLocation?.();
                  } else {
                    setSelectedWarehouse(e.target.value);
                  }
                }}
                className={`text-xs font-semibold py-1 pl-2 pr-5 rounded-full outline-none cursor-pointer appearance-none transition-all ${
                  selectedWarehouse !== 'ALL' && selectedWarehouse !== 'B1' && selectedWarehouse !== 'B2'
                    ? 'bg-carbon text-white shadow-sm'
                    : 'bg-transparent text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <option value="ALL" className="text-zinc-900 bg-white">Autres sites...</option>
                {onOpenCreateLocation && (
                  <option value="__ADD_LOCATION__" className="text-zinc-900 font-bold bg-zinc-100">
                    + {t.btn_add_location || 'Nouveau site...'}
                  </option>
                )}
                {locations.filter(l => l.code !== 'B1' && l.code !== 'B2').map(loc => (
                  <option key={loc.id} value={loc.code} className="text-zinc-900 bg-white">
                    {loc.code} — {loc.name}
                  </option>
                ))}
              </select>
              <ChevronDown className={`w-3.5 h-3.5 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                selectedWarehouse !== 'ALL' && selectedWarehouse !== 'B1' && selectedWarehouse !== 'B2'
                  ? 'text-white'
                  : 'text-zinc-500'
              }`} />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CENTER: Floating Pill Search Bar (Desktop only)                           */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex items-center flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onFocus={onSearchFocus}
              placeholder={t.quick_search || "Rechercher matériel, code, commande..."}
              className="w-full bg-white/90 border border-zinc-300/80 rounded-full pl-9 pr-4 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 shadow-xs focus:outline-none focus:border-zinc-900 focus:bg-white transition-all font-sans"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: Quick Ops, Language Switcher, Cloud Sync, Bell & Profile Avatar   */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Quick Operations Pills (Desktop Large only) */}
          {canOperateStock && (
            <div className="hidden xl:flex items-center gap-1.5">
              <button
                onClick={onOpenReceipt}
                className="flex items-center gap-1 bg-carbon hover:bg-zinc-800 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs"
                title={t.receipt_title}
              >
                <ArrowDownToLine className="w-3.5 h-3.5 text-lime" />
                <span>{t.action_receipt}</span>
              </button>

              <button
                onClick={onOpenIssue}
                className="flex items-center gap-1 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs"
                title={t.issue_title}
              >
                <ArrowUpFromLine className="w-3.5 h-3.5 text-zinc-600" />
                <span>{t.action_issue}</span>
              </button>

              <button
                onClick={onOpenTransfer}
                className="flex items-center gap-1 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs"
                title={t.transfer_title}
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-600" />
                <span>{t.action_transfer}</span>
              </button>
            </div>
          )}

          {/* Tablet Mode Pill (Desktop / Tablet only) */}
          {onToggleTabletMode && (
            <button
              type="button"
              onClick={onToggleTabletMode}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isTabletMode
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-300 shadow-2xs'
              }`}
              title={isTabletMode ? (t.btn_standard_mode || 'Mode Standard') : (t.btn_tablet_mode || 'Mode Atelier (Tactile)')}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>{isTabletMode ? 'Standard' : 'Atelier'}</span>
            </button>
          )}

          {/* --- LANGUAGE SWITCHER --- */}
          {/* On Mobile (< sm): Compact tactile dropdown pill with Flag & Code */}
          <div className="flex sm:hidden relative items-center">
            <div className="flex items-center gap-1 bg-white hover:bg-zinc-50 border border-zinc-300/90 px-2 py-1 rounded-full shadow-2xs text-xs font-bold text-zinc-800 active:scale-95 transition-transform">
              <span className="text-[12px] leading-none">
                {LANGUAGE_OPTIONS.find(l => l.code === currentLanguage)?.flag || '🌐'}
              </span>
              <span className="font-mono text-[10px] uppercase font-bold text-zinc-900">
                {currentLanguage}
              </span>
              <ChevronDown className="w-2.5 h-2.5 text-zinc-400" />
            </div>
            <select
              aria-label="Changer de langue"
              value={currentLanguage}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* On Desktop (>= sm): Segmented Pill with all languages */}
          <div className="hidden sm:flex items-center bg-zinc-200/50 border border-zinc-300/60 rounded-full p-0.5">
            {LANGUAGE_OPTIONS.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-white text-zinc-900 shadow-xs font-bold'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                  title={lang.label}
                >
                  <span className="text-[11px]">{lang.flag}</span>
                  <span className="uppercase font-mono text-[9px] font-bold">{lang.code}</span>
                </button>
              );
            })}
          </div>

          {/* --- CLOUD SYNC PILL --- */}
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-zinc-200/90 shadow-2xs text-[10px] font-medium text-zinc-600 cursor-default"
            title={syncStatus.isOnline ? `Firebase Firestore: werehouse-wms (${syncStatus.isSyncing ? 'Synchronisation...' : 'En direct'})` : 'Mode Hors-Ligne (Données locales)'}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${syncStatus.isSyncing ? 'bg-amber-400 animate-spin' : syncStatus.isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <Cloud className="w-3.5 h-3.5 text-emerald-600 hidden md:inline" />
            <span className="hidden xl:inline text-[10px] text-zinc-500 font-mono font-semibold">werehouse-wms</span>
          </div>

          {/* --- NOTIFICATIONS BELL --- */}
          <button
            type="button"
            onClick={() => setHasNotifications(false)}
            className="relative w-8 h-8 rounded-full bg-white hover:bg-zinc-50 border border-zinc-300/80 shadow-2xs flex items-center justify-center text-zinc-600 hover:text-zinc-900 active:scale-95 transition-all shrink-0"
            title="Notifications & Alertes WMS"
          >
            <Bell className="w-3.5 h-3.5 text-zinc-700" />
            {hasNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* --- USER PROFILE BUTTON (ALWAYS VISIBLE & PROMINENT ON PHONE & DESKTOP) --- */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-1.5 bg-white hover:bg-zinc-50 border border-zinc-300/90 p-1 sm:px-2.5 sm:py-1 rounded-full shadow-2xs active:scale-95 transition-all"
              title="Profil & Rôle Utilisateur"
              aria-label="Profil Utilisateur"
            >
              {/* Avatar circle with gold/lime gradient */}
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-amber-400 to-lime text-zinc-950 font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>

              {/* Text label on tablet / desktop */}
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-zinc-900 leading-tight truncate max-w-[80px]">
                  {currentUser.name}
                </div>
                <div className="text-[9px] text-zinc-500 font-mono leading-none truncate max-w-[80px]">
                  {currentUser.role === 'ADMIN' ? 'Super Admin' : currentUser.role}
                </div>
              </div>

              {/* Chevron */}
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* USER PROFILE & SETTINGS MODAL / BOTTOM SHEET (Responsive Mobile & Desktop) */}
      {/* ========================================================================= */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn">
          {/* Backdrop click to close */}
          <div 
            className="fixed inset-0" 
            onClick={() => setIsProfileModalOpen(false)} 
          />

          {/* Modal / Bottom Sheet Card */}
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-10 transition-transform">
            
            {/* Mobile Drag Indicator */}
            <div className="sm:hidden flex justify-center pt-2.5 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-zinc-300" />
            </div>

            {/* Modal Header: Avatar & User Identity */}
            <div className="p-4 sm:p-5 bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-lime text-zinc-950 font-black text-xl flex items-center justify-center shadow-md">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-zinc-950 text-base">
                      {currentUser.name}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-carbon text-lime shadow-2xs">
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    {currentUser.email || 'agent.wms@mine-site.cd'} • ID: {currentUser.employeeId || 'EMP-3458'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* SECTION 1: LANGUE DE L'INTERFACE (Grandes cibles tactiles pour smartphone) */}
              <div>
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-zinc-700" />
                  <span>Langue de l'application</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => {
                    const isSelected = currentLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setLanguage(lang.code)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                            : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200'
                        }`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span className="text-xs font-bold leading-tight">{lang.label}</span>
                        {isSelected && (
                          <span className="text-[9px] font-mono font-bold text-lime">Actif</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: CHANGER DE RÔLE WMS (Test rapide des profils) */}
              <div>
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
                  <span>Rôle & Permissions WMS</span>
                </label>
                <div className="space-y-1.5">
                  {ROLE_DEFINITIONS.map((def) => {
                    const isActive = currentUser.role === def.role;
                    return (
                      <button
                        key={def.role}
                        type="button"
                        onClick={() => switchRole(def.role)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all active:scale-[0.99] ${
                          isActive
                            ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                            : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{def.icon}</span>
                          <div>
                            <div className="text-xs font-bold flex items-center gap-1.5">
                              <span>{def.label}</span>
                              <span className="text-[10px] font-mono opacity-60">({def.role})</span>
                            </div>
                            <div className={`text-[11px] mt-0.5 ${isActive ? 'text-zinc-400' : 'text-zinc-500'}`}>
                              {def.desc}
                            </div>
                          </div>
                        </div>

                        {isActive ? (
                          <div className="w-5 h-5 rounded-full bg-lime text-zinc-950 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 font-semibold">Choisir</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: MODE ATELIER / TACTILE & SYNC CLOUD */}
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                {onToggleTabletMode && (
                  <button
                    type="button"
                    onClick={onToggleTabletMode}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                      isTabletMode
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'
                    }`}
                  >
                    <Tablet className="w-4 h-4" />
                    <span>Mode Atelier: {isTabletMode ? 'Activé' : 'Désactivé'}</span>
                  </button>
                )}

                <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
                  <span className={`w-2 h-2 rounded-full ${syncStatus.isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span>{syncStatus.isOnline ? 'Firestore Connecté' : 'Hors Ligne'}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-zinc-50 border-t border-zinc-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Terminer
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
export default Header;
