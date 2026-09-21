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
  Tablet
} from 'lucide-react';

interface HeaderProps {
  onOpenReceipt: () => void;
  onOpenIssue: () => void;
  onOpenTransfer: () => void;
  onSearchFocus?: () => void;
  onOpenCreateLocation?: () => void;
  isTabletMode?: boolean;
  onToggleTabletMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenReceipt,
  onOpenIssue,
  onOpenTransfer,
  onOpenCreateLocation,
  isTabletMode,
  onToggleTabletMode,
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

  useEffect(() => {
    return dataService.subscribe(() => {
      setLocations(dataService.getLocations());
    });
  }, []);

  return (
    <header className="h-16 bg-white border-b border-zinc-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Branding & Harmonious Location Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center font-bold text-white shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-zinc-900 text-sm md:text-base leading-tight tracking-tight">
              {t.app_name}
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wider">{t.app_subtitle}</p>
          </div>
        </div>

        {/* Dynamic Location Filter Selector (Harmonious Segmented Control) */}
        <div className="hidden sm:flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 ml-2">
          <button
            onClick={() => setSelectedWarehouse('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              selectedWarehouse === 'ALL'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setSelectedWarehouse('B1')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              selectedWarehouse === 'B1'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            B1
          </button>
          <button
            onClick={() => setSelectedWarehouse('B2')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              selectedWarehouse === 'B2'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            }`}
          >
            B2
          </button>

          {/* Clean dropdown for other dynamic locations */}
          <div className="relative pl-1 border-l border-zinc-200 flex items-center">
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
              className={`text-xs font-semibold py-1.5 pl-2.5 pr-6 rounded-md outline-none cursor-pointer appearance-none transition-all ${
                selectedWarehouse !== 'ALL' && selectedWarehouse !== 'B1' && selectedWarehouse !== 'B2'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
              }`}
            >
              <option value="ALL" className="text-zinc-900 bg-white">Autres sites...</option>
              {onOpenCreateLocation && (
                <option value="__ADD_LOCATION__" className="text-zinc-900 font-bold bg-zinc-100">
                  + {t.btn_add_location || 'Nouveau magasin / site...'}
                </option>
              )}
              {locations.filter(l => l.code !== 'B1' && l.code !== 'B2').map(loc => (
                <option key={loc.id} value={loc.code} className="text-zinc-900 bg-white">
                  {loc.code} — {loc.name}
                </option>
              ))}
            </select>
            <ChevronDown className={`w-3.5 h-3.5 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
              selectedWarehouse !== 'ALL' && selectedWarehouse !== 'B1' && selectedWarehouse !== 'B2'
                ? 'text-white'
                : 'text-zinc-400'
            }`} />
          </div>
          {onOpenCreateLocation && (
            <button
              type="button"
              onClick={onOpenCreateLocation}
              className="p-1 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60 rounded transition-colors ml-0.5"
              title={t.btn_add_location || "Ajouter un magasin ou site"}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Quick Actions, Compact Language Switcher & Role Switcher */}
      <div className="flex items-center gap-2 md:gap-3">
        {canOperateStock && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenReceipt}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors"
              title={t.receipt_title}
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.action_receipt}</span>
            </button>

            <button
              onClick={onOpenIssue}
              className="flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
              title={t.issue_title}
            >
              <ArrowUpFromLine className="w-3.5 h-3.5 text-zinc-600" />
              <span className="hidden sm:inline">{t.action_issue}</span>
            </button>

            <button
              onClick={onOpenTransfer}
              className="flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
              title={t.transfer_title}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="hidden sm:inline">{t.action_transfer}</span>
            </button>
          </div>
        )}

        {/* Tablet Mode Toggle */}
        {onToggleTabletMode && (
          <button
            type="button"
            onClick={onToggleTabletMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold border transition-all ${
              isTabletMode
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-300'
            }`}
            title={isTabletMode ? (t.btn_standard_mode || 'Mode Standard') : (t.btn_tablet_mode || 'Mode Atelier (Tactile)')}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isTabletMode ? (t.btn_standard_mode || 'Standard') : (t.btn_tablet_mode || 'Atelier')}
            </span>
          </button>
        )}

        {/* Compact Trilingual Language Switcher (Reduced size) */}
        <div className="flex items-center bg-zinc-100 border border-zinc-200 rounded-lg p-0.5">
          {LANGUAGE_OPTIONS.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-white text-zinc-900 shadow-xs font-bold'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60'
                }`}
                title={`${lang.label} (${lang.nativeName}) - ${t.language}`}
              >
                <span className="text-xs">{lang.flag}</span>
                <span className="uppercase font-mono text-[10px] font-bold">{lang.code}</span>
              </button>
            );
          })}
        </div>

        {/* Role Switcher Pill & User Info */}
        <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-xs font-semibold text-zinc-900 leading-tight">{currentUser.name}</span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {currentUser.email} • <span className="uppercase text-zinc-700 font-bold">{currentLanguage}</span>
            </span>
          </div>

          <div>
            <select
              aria-label={t.role}
              value={currentUser.role}
              onChange={(e) => switchRole(e.target.value as UserRole)}
              className="bg-white border border-zinc-300 text-xs text-zinc-800 font-semibold py-1.5 px-2 rounded focus:outline-none focus:border-zinc-900 cursor-pointer"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="SUPERVISOR">SUPERVISOR</option>
              <option value="STOREKEEPER">STOREKEEPER</option>
              <option value="VIEWER">VIEWER</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
