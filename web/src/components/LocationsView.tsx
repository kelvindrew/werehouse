import React, { useState, useMemo } from 'react';
import { StorageLocation, LocationType, User } from '@shared/types/models';
import { dataService } from '../lib/dataService';
import { TranslationDictionary } from '../lib/i18n';
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Package,
  Layers,
  Edit2,
  Trash2,
  ArrowRight,
  Warehouse as WarehouseIcon,
  Box,
  Truck,
  Wrench,
  AlertTriangle,
  Camera,
  Eye
} from 'lucide-react';
import { WarehouseVisualTourModal } from './WarehouseVisualTourModal';

interface LocationsViewProps {
  currentUser: User;
  t: TranslationDictionary;
  onSelectLocationForStock: (locationCode: string) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (location: StorageLocation) => void;
}

export const LocationsView: React.FC<LocationsViewProps> = ({
  currentUser,
  t,
  onSelectLocationForStock,
  onOpenCreateModal,
  onOpenEditModal
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [locations, setLocations] = useState<StorageLocation[]>(() => dataService.getLocations());
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourLocationCode, setTourLocationCode] = useState<string>('B1');

  const handleOpenTour = (code?: string) => {
    setTourLocationCode(code || 'B1');
    setIsTourOpen(true);
  };

  // Reload when data changes
  React.useEffect(() => {
    return dataService.subscribe(() => {
      setLocations(dataService.getLocations());
    });
  }, []);

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      if (typeFilter !== 'ALL' && loc.type !== typeFilter) return false;
      if (statusFilter !== 'ALL' && loc.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchCode = loc.code.toLowerCase().includes(q);
        const matchName = loc.name.toLowerCase().includes(q);
        const matchDesc = loc.description ? loc.description.toLowerCase().includes(q) : false;
        const matchPhysical = loc.physicalLocation ? loc.physicalLocation.toLowerCase().includes(q) : false;
        return matchCode || matchName || matchDesc || matchPhysical;
      }
      return true;
    });
  }, [locations, typeFilter, statusFilter, search]);

  // Aggregate stats
  const totalItemsCount = locations.reduce((sum, l) => sum + (l.totalItemsCount || 0), 0);
  const totalQuantity = locations.reduce((sum, l) => sum + (l.totalQuantity || 0), 0);
  const totalValuationUSD = Math.round(locations.reduce((sum, l) => sum + (l.totalValuationUSD || 0), 0) * 100) / 100;
  const containerCount = locations.filter(l => l.type === 'CONTAINER').length;

  const handleDelete = (location: StorageLocation) => {
    if (location.code === 'B1' || location.code === 'B2') {
      alert(t.cannot_delete_core_warehouses);
      return;
    }

    if (window.confirm(`${t.confirm_delete_location}\n\nSite : ${location.code} - ${location.name}`)) {
      try {
        dataService.deleteLocation(location.id, currentUser);
      } catch (err: any) {
        alert(err.message || 'Error');
      }
    }
  };

  const getLocationTypeIcon = (type: LocationType) => {
    switch (type) {
      case 'WAREHOUSE':
        return <WarehouseIcon className="w-3.5 h-3.5 text-zinc-700" />;
      case 'CONTAINER':
        return <Box className="w-3.5 h-3.5 text-zinc-700" />;
      case 'YARD':
        return <Truck className="w-3.5 h-3.5 text-zinc-700" />;
      case 'WORKSHOP':
        return <Wrench className="w-3.5 h-3.5 text-zinc-700" />;
      case 'QUARANTINE':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-zinc-700" />;
    }
  };

  const getLocationTypeLabel = (loc: StorageLocation) => {
    if (loc.type === 'OTHER' && loc.customTypeName) {
      return loc.customTypeName;
    }
    switch (loc.type) {
      case 'WAREHOUSE': return t.type_warehouse;
      case 'CONTAINER': return t.type_container;
      case 'YARD': return t.type_yard;
      case 'WORKSHOP': return t.type_workshop;
      case 'RACK': return t.type_rack;
      case 'SHELF': return t.type_shelf;
      case 'TEMPORARY': return t.type_temporary;
      case 'QUARANTINE': return t.type_quarantine;
      case 'OFFICE': return t.type_office;
      default: return t.type_other;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 bg-zinc-900 text-white rounded-xl shadow-xs">
              <MapPin className="w-4 h-4" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
                {t.nav_locations_title}
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                {t.nav_locations_subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenTour()}
            className="inline-flex items-center justify-center space-x-2 px-3.5 py-2 bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300 text-xs font-semibold rounded-full shadow-xs transition-colors"
            title="Lancer la visite virtuelle photo des magasins"
          >
            <Camera className="w-3.5 h-3.5 text-zinc-700" />
            <span>{t.btn_visual_tour || 'Visite des Magasins'}</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-full shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.btn_add_location}</span>
          </button>
        </div>
      </div>

      {/* Modern KPI Metric Strip with Ron Design dots */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white border border-zinc-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <span>{t.kpi_locations}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 mt-1 font-mono">
            {locations.length}
          </div>
          <div className="text-xs text-zinc-400 mt-0.5">
            {t.kpi_active_warehouses}
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <span>{t.kpi_containers}</span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 mt-1 font-mono">
            {containerCount}
          </div>
          <div className="text-xs text-zinc-400 mt-0.5">
            {t.type_container}
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <span>{t.kpi_total_items}</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 mt-1 font-mono">
            {totalItemsCount.toLocaleString()}
          </div>
          <div className="text-xs text-zinc-400 mt-0.5">
            {totalQuantity.toLocaleString()} {t.kpi_units}
          </div>
        </div>

        <div className="bg-white border border-zinc-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <span>{t.total_value_col}</span>
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 mt-1 font-mono">
            ${totalValuationUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-zinc-400 mt-0.5">
            {t.kpi_usd_global}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-zinc-200/80 p-3 rounded-2xl shadow-xs flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search_hint}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-zinc-50/80 border border-zinc-200 rounded-full focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-zinc-500 font-medium pl-1">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">{t.site_location_type_col}:</span>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-zinc-50/80 border border-zinc-200 rounded-full focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none text-zinc-700"
          >
            <option value="ALL">{t.all_types}</option>
            <option value="WAREHOUSE">{t.type_warehouse}</option>
            <option value="CONTAINER">{t.type_container}</option>
            <option value="YARD">{t.type_yard}</option>
            <option value="WORKSHOP">{t.type_workshop}</option>
            <option value="TEMPORARY">{t.type_temporary}</option>
            <option value="QUARANTINE">{t.type_quarantine}</option>
            <option value="OFFICE">{t.type_office}</option>
            <option value="OTHER">{t.type_other}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-zinc-50/80 border border-zinc-200 rounded-full focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none text-zinc-700"
          >
            <option value="ALL">{t.all_statuses}</option>
            <option value="ACTIVE">{t.active_status}</option>
            <option value="INACTIVE">{t.inactive_status}</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-zinc-600 text-xs font-semibold uppercase tracking-wider border-b border-zinc-200">
              <tr>
                <th className="py-3 px-3 w-14 text-center">Photo</th>
                <th className="py-3 px-4">{t.site_location_code_col}</th>
                <th className="py-3 px-4">{t.location_desc_col}</th>
                <th className="py-3 px-4">{t.site_location_type_col}</th>
                <th className="py-3 px-4">{t.physical_landmark_col}</th>
                <th className="py-3 px-4 text-right">{t.stock_lines_col}</th>
                <th className="py-3 px-4 text-right">{t.physical_units_col}</th>
                <th className="py-3 px-4 text-right">{t.total_value_col}</th>
                <th className="py-3 px-4 text-center">{t.col_link_status}</th>
                <th className="py-3 px-4 text-right">{t.actions_col}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-zinc-400">
                    {t.no_locations_matching}
                  </td>
                </tr>
              ) : (
                filteredLocations.map(loc => {
                  const isCore = loc.code === 'B1' || loc.code === 'B2';
                  return (
                    <tr key={loc.id} className="hover:bg-zinc-50 transition-colors">
                      {/* Photo Thumbnail with direct click to tour */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenTour(loc.code)}
                          className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden inline-flex items-center justify-center relative group hover:border-zinc-400 transition-colors shrink-0"
                          title="Cliquer pour visiter ce magasin en photos"
                        >
                          {loc.imageUrl ? (
                            <img src={loc.imageUrl} alt={loc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200" />
                          ) : (
                            <WarehouseIcon className="w-4 h-4 text-zinc-400" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-3.5 h-3.5 text-white" />
                          </div>
                        </button>
                      </td>

                      {/* Code */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 bg-zinc-100 border border-zinc-300 text-zinc-900 font-mono font-bold text-xs rounded">
                          {loc.code}
                        </span>
                      </td>

                      {/* Name & Description */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-zinc-900">
                          {loc.name}
                        </div>
                        {loc.description && (
                          <div className="text-xs text-zinc-500 mt-0.5 max-w-md line-clamp-1">
                            {loc.description}
                          </div>
                        )}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs rounded">
                          {getLocationTypeIcon(loc.type)}
                          <span>{getLocationTypeLabel(loc)}</span>
                        </span>
                      </td>

                      {/* Physical Location */}
                      <td className="py-3 px-4 text-xs text-zinc-600">
                        {loc.physicalLocation || <span className="text-zinc-300">—</span>}
                      </td>

                      {/* Stock Lines Count */}
                      <td className="py-3 px-4 text-right font-mono text-zinc-900 font-medium">
                        {(loc.totalItemsCount || 0).toLocaleString()}
                      </td>

                      {/* Total Units */}
                      <td className="py-3 px-4 text-right font-mono text-zinc-700">
                        {(loc.totalQuantity || 0).toLocaleString()}
                      </td>

                      {/* Valuation */}
                      <td className="py-3 px-4 text-right font-mono text-zinc-900 font-medium">
                        ${(loc.totalValuationUSD || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded ${
                            loc.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                          }`}
                        >
                          {loc.status === 'ACTIVE' ? t.active_status.toUpperCase() : t.inactive_status.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleOpenTour(loc.code)}
                            title="Visite virtuelle photo de ce magasin"
                            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-zinc-800 bg-white hover:bg-zinc-100 border border-zinc-300 rounded transition-colors"
                          >
                            <Camera className="w-3 h-3 text-zinc-700" />
                            <span className="hidden sm:inline">{t.btn_visual_tour || 'Visiter'}</span>
                          </button>

                          <button
                            onClick={() => onSelectLocationForStock(loc.code)}
                            title={t.view_stock_action}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded transition-colors"
                          >
                            <span>{t.view_stock_action}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => onOpenEditModal(loc)}
                            title={t.btn_edit_location}
                            className="p-1 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {!isCore && (
                            <button
                              onClick={() => handleDelete(loc)}
                              title={t.btn_delete_location}
                              className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Warehouse Visual Tour Modal */}
      <WarehouseVisualTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        initialLocationCode={tourLocationCode}
        onSelectLocationForStock={onSelectLocationForStock}
        onOpenEditLocation={onOpenEditModal}
      />
    </div>
  );
};
