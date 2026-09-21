import React from 'react';
import { 
  LayoutDashboard, 
  Boxes, 
  MapPin, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowLeftRight, 
  ClipboardCheck, 
  FileSpreadsheet, 
  Download, 
  History, 
  ShieldCheck, 
  Share2,
  Warehouse,
  Layers,
  Sparkles,
  Building2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavigationTab = 
  | 'dashboard' 
  | 'stock' 
  | 'locations' 
  | 'receipts' 
  | 'issues' 
  | 'transfers' 
  | 'inventory' 
  | 'import' 
  | 'export' 
  | 'audit'
  | 'shared_links';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenCreateLocation?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { canAdmin, canSupervise, canOperateStock, selectedWarehouse, t, currentUser } = useAuth();

  const sections = [
    {
      group: 'DISCOVER',
      items: [
        {
          id: 'dashboard' as NavigationTab,
          label: t.tab_dashboard,
          icon: LayoutDashboard,
          visible: true
        },
        {
          id: 'locations' as NavigationTab,
          label: t.nav_locations_title || 'Magasins & Sites',
          icon: Building2,
          visible: true
        }
      ]
    },
    {
      group: 'INVENTORY',
      items: [
        {
          id: 'stock' as NavigationTab,
          label: t.tab_stock,
          icon: Boxes,
          visible: true
        },
        {
          id: 'receipts' as NavigationTab,
          label: t.tab_receipts,
          icon: ArrowDownToLine,
          visible: canOperateStock
        },
        {
          id: 'issues' as NavigationTab,
          label: t.tab_issues,
          icon: ArrowUpFromLine,
          visible: canOperateStock
        },
        {
          id: 'transfers' as NavigationTab,
          label: t.tab_transfers,
          icon: ArrowLeftRight,
          visible: canOperateStock
        },
        {
          id: 'inventory' as NavigationTab,
          label: t.tab_inventory,
          icon: ClipboardCheck,
          visible: canSupervise
        }
      ]
    },
    {
      group: 'REPORTS & DATA',
      items: [
        {
          id: 'import' as NavigationTab,
          label: t.tab_import,
          icon: FileSpreadsheet,
          visible: canAdmin
        },
        {
          id: 'export' as NavigationTab,
          label: t.tab_export,
          icon: Download,
          visible: true
        },
        {
          id: 'shared_links' as NavigationTab,
          label: t.tab_shared_links || 'Liens partagés',
          icon: Share2,
          visible: canSupervise || canAdmin
        },
        {
          id: 'audit' as NavigationTab,
          label: t.tab_audit,
          icon: History,
          visible: canSupervise
        }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-carbon border-r border-carbon-border flex flex-col justify-between shrink-0 hidden md:flex h-screen sticky top-0 z-40 select-none">
      <div className="flex flex-col h-full overflow-y-auto scrollbar-none px-3.5 py-4">
        
        {/* Brand Header with Fluo Lime Icon matching reference image */}
        <div className="flex items-center gap-3 px-2 pb-5 pt-1 mb-2 border-b border-carbon-border/60">
          <div className="w-9 h-9 rounded-xl bg-lime/10 border border-lime/30 flex items-center justify-center text-lime shadow-glow-lime">
            <Layers className="w-5 h-5 fill-lime/20" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
              <span>{t.app_name || 'WMS B1 & B2'}</span>
            </h1>
            <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">
              {t.app_subtitle || 'Warehouse Management'}
            </p>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-5 flex-1">
          {sections.map((sec) => {
            const visibleItems = sec.items.filter(item => item.visible);
            if (visibleItems.length === 0) return null;

            return (
              <div key={sec.group} className="space-y-1">
                <div className="text-[10px] font-mono font-semibold tracking-wider text-zinc-500 uppercase px-3 py-1">
                  {sec.group}
                </div>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-carbon-card text-white font-semibold border border-zinc-700/60 shadow-xs'
                          : 'text-zinc-400 hover:text-white hover:bg-carbon-card/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-lime' : 'text-zinc-400 group-hover:text-zinc-200'
                        }`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-lime shadow-glow-lime shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Bottom User / Site Status Card */}
        <div className="pt-4 mt-auto border-t border-carbon-border/60">
          <div className="p-2.5 bg-carbon-card/80 border border-carbon-border rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-lime/20 to-emerald-500/20 border border-lime/40 flex items-center justify-center text-lime font-bold text-xs shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-zinc-400 font-mono truncate">{currentUser.role}</div>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-carbon-muted text-lime border border-zinc-700 shrink-0">
              {selectedWarehouse === 'ALL' ? 'TOUS' : selectedWarehouse}
            </span>
          </div>
        </div>

      </div>
    </aside>
  );
};
