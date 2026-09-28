import React from 'react';
import { NavigationTab } from './Sidebar';
import { 
  ClipboardCheck, 
  Boxes, 
  ArrowUpFromLine, 
  ArrowLeftRight, 
  Building2
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

  const tabs: {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isCenterAction?: boolean;
  }[] = [
    {
      id: 'stock',
      label: t.tab_stock || 'Stocks',
      icon: Boxes
    },
    {
      id: 'issues',
      label: t.tab_issues || 'Sorties',
      icon: ArrowUpFromLine
    },
    {
      id: 'inventory',
      label: t.tab_inventory || 'Inventaire',
      icon: ClipboardCheck,
      isCenterAction: true
    },
    {
      id: 'receipts',
      label: t.tab_receipts || 'Flux',
      icon: ArrowLeftRight
    },
    {
      id: 'locations',
      label: t.tab_locations || 'Magasins',
      icon: Building2
    }
  ];

  return (
    <div className="md:hidden fixed bottom-2.5 xs:bottom-3 sm:bottom-4 inset-x-2.5 xs:inset-x-3.5 sm:inset-x-4 max-w-md mx-auto z-40 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
      <nav 
        aria-label="Navigation Principale Mobile"
        className="pointer-events-auto relative w-full p-1 xs:p-1.5 rounded-2xl xs:rounded-3xl backdrop-blur-2xl bg-zinc-950/92 dark:bg-zinc-950/95 text-white border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.38),0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.12)] flex items-center justify-between gap-0.5 xs:gap-1"
      >
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          if (tab.isCenterAction) {
            // Featured Center Action: Fluid, beautifully integrated, no ugly protruding bezel
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
                className={`flex-1 min-w-0 py-1.5 xs:py-2 px-1 xs:px-2 rounded-xl xs:rounded-2xl flex flex-col items-center justify-center transition-all duration-200 active:scale-92 ${
                  isActive
                    ? 'bg-lime text-zinc-950 shadow-[0_0_20px_rgba(200,255,0,0.45)] ring-1 ring-lime/60 font-black'
                    : 'bg-zinc-800/80 hover:bg-zinc-800 text-lime/90 hover:text-lime font-bold border border-lime/20'
                }`}
              >
                <Icon className={`w-4 h-4 xs:w-5 xs:h-5 stroke-[2.4] transition-transform ${
                  isActive ? 'scale-110' : ''
                }`} />
                <span className="text-[9px] xs:text-[10px] tracking-tight font-mono font-black mt-0.5 truncate max-w-full">
                  {tab.label}
                </span>
              </button>
            );
          }

          // Standard Navigation Tabs
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 min-w-0 py-1.5 xs:py-2 px-1 rounded-xl xs:rounded-2xl flex flex-col items-center justify-center transition-all duration-200 active:scale-92 ${
                isActive
                  ? 'bg-white/12 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 xs:w-4.5 xs:h-4.5 stroke-[2] transition-colors ${
                  isActive ? 'text-lime' : 'text-zinc-400'
                }`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-lime" />
                )}
              </div>
              <span className={`text-[9px] xs:text-[10px] tracking-tight font-mono mt-0.5 truncate max-w-full ${
                isActive ? 'text-white font-bold' : 'text-zinc-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileFloatingDock;
