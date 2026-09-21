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
  Plus,
  Tablet,
  Search,
  Bell,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

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

  useEffect(() => {
    return dataService.subscribe(() => {
      setLocations(dataService.getLocations());
    });
  }, []);

  return (
    <header className="h-16 liquid-glass border-b border-white/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-all">
      
      {/* Left: Dynamic Location Switcher Pills (Matching reference stores pill) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-zinc-200/50 p-1 rounded-full border border-zinc-300/60 shadow-inner">
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

      {/* Center: Floating Pill Search Bar (Matching Reference Image "Search item, order, etc") */}
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

      {/* Right: Quick Action Buttons, Language, Bell, & Abram Workman Profile Card */}
      <div className="flex items-center gap-2 md:gap-3">
        
        {/* Quick Operations Pills */}
        {canOperateStock && (
          <div className="hidden sm:flex items-center gap-1.5">
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

        {/* Tablet Mode Pill */}
        {onToggleTabletMode && (
          <button
            type="button"
            onClick={onToggleTabletMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isTabletMode
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-300 shadow-2xs'
            }`}
            title={isTabletMode ? (t.btn_standard_mode || 'Mode Standard') : (t.btn_tablet_mode || 'Mode Atelier (Tactile)')}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">
              {isTabletMode ? 'Standard' : 'Atelier'}
            </span>
          </button>
        )}

        {/* Language Switcher Pill */}
        <div className="flex items-center bg-zinc-200/50 border border-zinc-300/60 rounded-full p-0.5">
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

        {/* Notification Bell with Ping Dot (Matching Reference Image) */}
        <button
          onClick={() => setHasNotifications(false)}
          className="relative w-9 h-9 rounded-full bg-white hover:bg-zinc-50 border border-zinc-300/80 shadow-2xs flex items-center justify-center text-zinc-600 hover:text-zinc-900 transition-colors"
          title="Notifications & Alertes WMS"
        >
          <Bell className="w-4 h-4" />
          {hasNotifications && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
          )}
        </button>

        {/* Abram Workman Style Profile Widget (Matching Reference Image) */}
        <div className="flex items-center gap-2 pl-2 border-l border-zinc-300/80">
          <div className="flex items-center gap-2 bg-white/90 border border-zinc-300/80 px-2.5 py-1 rounded-full shadow-2xs">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-lime text-zinc-950 font-black text-xs flex items-center justify-center shadow-xs">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-zinc-900 leading-tight truncate max-w-[90px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-zinc-500 font-mono leading-none truncate max-w-[90px]">
                {currentUser.role === 'ADMIN' ? 'Super Admin' : currentUser.role}
              </div>
            </div>
            
            {/* Quick role switcher dropdown */}
            <div className="relative">
              <select
                aria-label={t.role}
                value={currentUser.role}
                onChange={(e) => switchRole(e.target.value as UserRole)}
                className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="SUPERVISOR">SUPERVISOR</option>
                <option value="STOREKEEPER">STOREKEEPER</option>
                <option value="VIEWER">VIEWER</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
