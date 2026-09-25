import React from 'react';
import { NavigationTab } from './Sidebar';
import { 
  Home, 
  Boxes, 
  ArrowUpFromLine, 
  ArrowLeftRight, 
  MapPin, 
  Building2,
  Share2
} from 'lucide-react';
import { TranslationDictionary } from '../lib/i18n';

interface MobileFloatingDockProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  t: TranslationDictionary;
}

export const MobileFloatingDock: React.FC<MobileFloatingDockProps> = ({
  currentTab,
  onSelectTab,
  t
}) => {
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch (e) {}
    }
  };

  const handleTabClick = (tab: NavigationTab) => {
    triggerHaptic();
    onSelectTab(tab);
  };

  return (
    <div className="md:hidden fixed bottom-4 left-3 right-3 max-w-md mx-auto z-40 pointer-events-none">
      <nav 
        aria-label="Navigation Mobile"
        className="pointer-events-auto relative px-3 py-1.5 rounded-full backdrop-blur-2xl bg-white/90 dark:bg-zinc-950/90 border border-white/80 dark:border-zinc-800 shadow-[0_12px_36px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.9)] flex items-center justify-between"
      >
        {/* Tab 1: Stocks */}
        <button
          type="button"
          onClick={() => handleTabClick('stock')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-200 active:scale-90 ${
            currentTab === 'stock'
              ? 'text-zinc-950 dark:text-white font-black'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 font-medium'
          }`}
        >
          <div className={`p-1.5 rounded-full transition-colors ${
            currentTab === 'stock' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-2xs' : ''
          }`}>
            <Boxes className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[9px] tracking-tight mt-0.5 font-mono">
            {t.tab_stock || 'Stocks'}
          </span>
        </button>

        {/* Tab 2: Sorties / Issues */}
        <button
          type="button"
          onClick={() => handleTabClick('issues')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-200 active:scale-90 ${
            currentTab === 'issues'
              ? 'text-zinc-950 dark:text-white font-black'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 font-medium'
          }`}
        >
          <div className={`p-1.5 rounded-full transition-colors ${
            currentTab === 'issues' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-2xs' : ''
          }`}>
            <ArrowUpFromLine className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[9px] tracking-tight mt-0.5 font-mono">
            {t.tab_issues || 'Sorties'}
          </span>
        </button>

        {/* Tab 3: CENTER FLOATING RAISED HOME BUTTON (Exactly as Reference Image) */}
        <div className="relative -top-5 px-1 shrink-0">
          {/* Concentric outer halo / recess bezel */}
          <div className="p-1 rounded-full bg-[#f4f5f8] border border-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(0,0,0,0.06)]">
            <button
              type="button"
              onClick={() => handleTabClick('dashboard')}
              aria-label="Tableau de bord / Accueil"
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 shadow-[0_8px_20px_rgba(0,0,0,0.18),inset_0_2px_3px_rgba(255,255,255,0.8)] ${
                currentTab === 'dashboard'
                  ? 'bg-carbon text-lime ring-2 ring-lime/70 shadow-[0_8px_25px_rgba(200,255,0,0.38)]'
                  : 'bg-white hover:bg-zinc-50 text-zinc-800'
              }`}
            >
              <Home className={`w-6 h-6 stroke-[2.4] transition-transform ${
                currentTab === 'dashboard' ? 'scale-110 text-lime' : 'text-zinc-800'
              }`} />
            </button>
          </div>
        </div>

        {/* Tab 4: Mouvements / Flux */}
        <button
          type="button"
          onClick={() => handleTabClick('receipts')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-200 active:scale-90 ${
            currentTab === 'receipts'
              ? 'text-zinc-950 dark:text-white font-black'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 font-medium'
          }`}
        >
          <div className={`p-1.5 rounded-full transition-colors ${
            currentTab === 'receipts' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-2xs' : ''
          }`}>
            <ArrowLeftRight className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[9px] tracking-tight mt-0.5 font-mono">
            {t.tab_receipts || 'Flux'}
          </span>
        </button>

        {/* Tab 5: Emplacements / Magasins */}
        <button
          type="button"
          onClick={() => handleTabClick('locations')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-200 active:scale-90 ${
            currentTab === 'locations'
              ? 'text-zinc-950 dark:text-white font-black'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 font-medium'
          }`}
        >
          <div className={`p-1.5 rounded-full transition-colors ${
            currentTab === 'locations' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-2xs' : ''
          }`}>
            <Building2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[9px] tracking-tight mt-0.5 font-mono">
            {t.tab_locations || 'Magasins'}
          </span>
        </button>
      </nav>
    </div>
  );
};
export default MobileFloatingDock;
