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
  Building,
  Share2
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
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { canAdmin, canSupervise, canOperateStock, selectedWarehouse, t, currentUser } = useAuth();

  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: t.tab_dashboard,
      icon: LayoutDashboard,
      visible: true
    },
    {
      id: 'stock' as NavigationTab,
      label: t.tab_stock,
      icon: Boxes,
      visible: true
    },
    {
      id: 'locations' as NavigationTab,
      label: t.nav_locations_title || 'Emplacements & Sites',
      icon: MapPin,
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
    },
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
      id: 'audit' as NavigationTab,
      label: t.tab_audit,
      icon: History,
      visible: canSupervise
    },
    {
      id: 'shared_links' as NavigationTab,
      label: t.tab_shared_links || 'Liens partagés',
      icon: Share2,
      visible: canSupervise || canAdmin
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col justify-between shrink-0 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="p-3 space-y-1">
        {/* Active Warehouse Indicator */}
        <div className="px-3 py-2 mb-2 bg-zinc-50 rounded border border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-xs text-zinc-600 font-medium">{t.warehouse_view}</span>
          </div>
          <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800">
            {selectedWarehouse === 'ALL' ? t.all : selectedWarehouse}
          </span>
        </div>

        {/* Navigation Items */}
        {navItems.filter(item => item.visible).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-zinc-900 text-white font-semibold'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* User Status / Role Badge in Sidebar Footer */}
      <div className="p-3 border-t border-zinc-200 bg-zinc-50/50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-zinc-500" />
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-zinc-800 truncate">{currentUser.name}</div>
            <div className="text-[10px] text-zinc-500 font-mono tracking-tight">{currentUser.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
