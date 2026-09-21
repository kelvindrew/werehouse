import React, { useState, useEffect } from 'react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import { 
  DollarSign, 
  Package, 
  Boxes, 
  AlertTriangle, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowLeftRight, 
  Clock,
  MapPin,
  ChevronRight,
  ArrowRight,
  Plus,
  Camera
} from 'lucide-react';
import { StockMovement, StorageLocation } from '@shared/types/models';
import { WarehouseVisualTourModal } from './WarehouseVisualTourModal';

interface DashboardViewProps {
  onNavigateToStock: (filter?: string) => void;
  onNavigateToMovements: () => void;
  onOpenMaterialModal: (materialId: string) => void;
  onNavigateToLocations?: () => void;
  onOpenCreateLocation?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToStock,
  onNavigateToMovements,
  onOpenMaterialModal,
  onNavigateToLocations,
  onOpenCreateLocation,
}) => {
  const { t } = useAuth();
  const [kpis, setKpis] = useState(() => dataService.getKpis());
  const [locations, setLocations] = useState<StorageLocation[]>(() => dataService.getLocations());
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourLocationCode, setTourLocationCode] = useState<string>('B1');

  const handleOpenTour = (code?: string) => {
    setTourLocationCode(code || 'B1');
    setIsTourOpen(true);
  };

  useEffect(() => {
    const update = () => {
      setKpis(dataService.getKpis());
      setLocations(dataService.getLocations());
    };
    const unsubscribe = dataService.subscribe(update);
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-200">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">{t.dashboard_title}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t.dashboard_subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>{t.data_synced} ({kpis.totalItems.toLocaleString()} {t.stock_lines_col.toLowerCase()})</span>
        </div>
      </div>

      {/* Main KPI Grid - Ron Design Style */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Valuation */}
        <div className="bg-white border border-zinc-200/80 p-4 rounded-2xl shadow-xs">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            {t.kpi_total_valuation}
          </div>
          <div className="text-xl font-bold text-zinc-900 font-mono mt-1">
            ${kpis.totalValuationUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 font-mono">
            {t.kpi_usd_global}
          </div>
        </div>

        {/* Total Articles & Codes */}
        <div className="bg-white border border-zinc-200/80 p-4 rounded-2xl shadow-xs">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            {t.kpi_total_items}
          </div>
          <div className="text-xl font-bold text-zinc-900 font-mono mt-1">
            {kpis.totalItems.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {kpis.totalMaterials.toLocaleString()} {t.kpi_unique_references}
          </div>
        </div>

        {/* Total Units */}
        <div className="bg-white border border-zinc-200/80 p-4 rounded-2xl shadow-xs">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            {t.kpi_total_stock}
          </div>
          <div className="text-xl font-bold text-zinc-900 font-mono mt-1">
            {kpis.totalUnits.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {t.kpi_accounted_units}
          </div>
        </div>

        {/* Storage Locations & Containers */}
        <div 
          onClick={onNavigateToLocations}
          className="bg-white border border-zinc-200/80 hover:border-zinc-400 p-4 rounded-2xl shadow-xs cursor-pointer transition-colors"
        >
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            {t.kpi_locations}
          </div>
          <div className="text-xl font-bold text-zinc-900 font-mono mt-1">
            {kpis.locationsCount}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {t.kpi_containers_count_desc.replace('{count}', String(kpis.containersCount))}
          </div>
        </div>

        {/* Low Stock / Out of stock (Functional Alert Colors) */}
        <div 
          onClick={() => onNavigateToStock('lowStock')}
          className="bg-white border border-zinc-200/80 hover:border-amber-400 p-4 rounded-2xl shadow-xs cursor-pointer transition-colors"
        >
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider flex items-center justify-between">
            <span>{t.low_stock_alerts}</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-600 font-mono mt-1">
            {kpis.lowStockCount}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {t.kpi_units_available_limit}
          </div>
        </div>

        {/* Recently Updated */}
        <div className="bg-white border border-zinc-200/80 p-4 rounded-2xl shadow-xs">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            {t.kpi_recently_updated}
          </div>
          <div className="text-xl font-bold text-zinc-900 font-mono mt-1">
            {kpis.recentlyUpdatedCount}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {t.kpi_recent_movements_desc}
          </div>
        </div>
      </div>

      {/* Today Operations Bar (Ron Design Card) */}
      <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
            {t.daily_operations_title}
          </h3>
          <span className="text-[11px] text-zinc-500 font-mono">
            {new Date().toLocaleDateString()}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-500 font-medium">{t.tab_receipts}</div>
              <div className="text-xl font-bold text-zinc-900 font-mono">{kpis.receiptsTodayCount}</div>
            </div>
            <div className="p-2.5 bg-zinc-200/80 text-zinc-800 rounded-xl">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-500 font-medium">{t.tab_issues}</div>
              <div className="text-xl font-bold text-zinc-900 font-mono">{kpis.issuesTodayCount}</div>
            </div>
            <div className="p-2.5 bg-zinc-200/80 text-zinc-800 rounded-xl">
              <ArrowUpFromLine className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-500 font-medium">{t.tab_transfers}</div>
              <div className="text-xl font-bold text-zinc-900 font-mono">{kpis.transfersTodayCount}</div>
            </div>
            <div className="p-2.5 bg-zinc-200/80 text-zinc-800 rounded-xl">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Locations Inventory Breakdown Table (Ron Design Card) */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-zinc-900 text-sm">
              {t.stock_distribution_sites_title}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {t.stock_distribution_sites_desc}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenTour()}
              className="text-xs bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300 font-semibold px-2.5 py-1 rounded inline-flex items-center gap-1.5 transition-colors shadow-xs"
              title="Lancer la visite virtuelle des magasins"
            >
              <Camera className="w-3.5 h-3.5 text-zinc-700" />
              <span>{t.btn_visual_tour || 'Visite des Magasins'}</span>
            </button>
            {onOpenCreateLocation && (
              <button
                type="button"
                onClick={onOpenCreateLocation}
                className="text-xs bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-2.5 py-1 rounded inline-flex items-center gap-1 transition-colors"
                title={t.btn_add_location}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.btn_add_location || 'Nouveau magasin'}</span>
              </button>
            )}
            {onNavigateToLocations && (
              <button
                type="button"
                onClick={onNavigateToLocations}
                className="text-xs text-zinc-700 hover:text-zinc-900 font-semibold inline-flex items-center gap-1"
              >
                <span>{t.nav_locations_title}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 uppercase font-semibold border-b border-zinc-200">
              <tr>
                <th className="py-2.5 px-4">{t.site_location_code_col}</th>
                <th className="py-2.5 px-4">{t.site_location_name_col}</th>
                <th className="py-2.5 px-4">{t.site_location_type_col}</th>
                <th className="py-2.5 px-4 text-right">{t.stock_lines_col}</th>
                <th className="py-2.5 px-4 text-right">{t.physical_units_col}</th>
                <th className="py-2.5 px-4 text-right">{t.estimated_value}</th>
                <th className="py-2.5 px-4 text-right">{t.actions_col}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {locations.map(loc => (
                <tr key={loc.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-bold text-zinc-900">
                    <span className="inline-block px-1.5 py-0.5 bg-zinc-100 border border-zinc-300 rounded">
                      {loc.code}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-medium text-zinc-900">
                    {loc.name}
                    {loc.physicalLocation && (
                      <span className="text-zinc-400 font-normal ml-2">({loc.physicalLocation})</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-zinc-600">
                    {loc.type}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-zinc-900 font-medium">
                    {(loc.totalItemsCount || 0).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-zinc-700">
                    {(loc.totalQuantity || 0).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-zinc-900 font-medium">
                    ${(loc.totalValuationUSD || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenTour(loc.code)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-700 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded transition-colors"
                        title="Visiter ce magasin en photos"
                      >
                        <Camera className="w-3 h-3 text-zinc-700" />
                        <span>Visiter</span>
                      </button>
                      <button
                        onClick={() => onNavigateToStock(loc.code)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 px-2 py-0.5 rounded transition-colors"
                      >
                        <span>{t.view_stock_action}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Movements Table */}
      <div className="bg-white border border-zinc-200 rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-600" />
            <h3 className="font-bold text-zinc-900 text-sm">{t.recent_movements}</h3>
          </div>
          <button
            onClick={onNavigateToMovements}
            className="text-xs text-zinc-700 hover:text-zinc-900 font-semibold flex items-center gap-1"
          >
            <span>{t.view_all_movements}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 uppercase font-semibold border-b border-zinc-200">
              <tr>
                <th className="py-2 px-3">{t.col_action_type}</th>
                <th className="py-2 px-3">{t.col_code} / {t.col_name}</th>
                <th className="py-2 px-3">{t.col_warehouse} & {t.col_bin}</th>
                <th className="py-2 px-3 text-right">{t.col_qty}</th>
                <th className="py-2 px-3">{t.col_ref_reason}</th>
                <th className="py-2 px-3">{t.col_user}</th>
                <th className="py-2 px-3 text-right">{t.col_timestamp}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {kpis.recentMovements.slice(0, 8).map((m) => {
                const isPositive = m.movementType === 'RECEIPT' || m.movementType === 'TRANSFER_IN' || m.movementType === 'INITIAL_IMPORT';
                const isNegative = m.movementType === 'ISSUE' || m.movementType === 'TRANSFER_OUT';
                return (
                  <tr key={m.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 border border-zinc-300 text-zinc-800">
                        {m.movementType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => onOpenMaterialModal(m.materialId)}
                        className="text-left font-mono font-semibold text-zinc-900 hover:underline block"
                      >
                        {m.materialCode}
                      </button>
                      <span className="text-[11px] text-zinc-500 truncate max-w-[200px] block">
                        {m.materialName}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-zinc-900 mr-1.5">
                        {m.warehouseId}
                      </span>
                      <span className="font-mono text-zinc-600 text-xs">{m.binLocation}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                      <span className={isPositive ? 'text-emerald-700' : isNegative ? 'text-red-600' : 'text-zinc-800'}>
                        {isPositive ? '+' : isNegative ? '-' : ''}{m.quantity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-600 max-w-[180px] truncate">
                      {m.referenceNumber || m.reason || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-600">
                      {m.performedByName}
                    </td>
                    <td className="py-2.5 px-3 text-right text-zinc-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Warehouse Visual Tour Modal */}
      <WarehouseVisualTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        initialLocationCode={tourLocationCode}
        onSelectLocationForStock={onNavigateToStock}
        onOpenEditLocation={onNavigateToLocations ? () => onNavigateToLocations() : undefined}
      />
    </div>
  );
};
