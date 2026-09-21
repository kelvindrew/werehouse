import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../lib/dataService';
import { 
  SharedLinkFilters, 
  SharedLinkColumn, 
  SharedLink,
  StorageLocation
} from '@shared/types/models';
import { 
  X, 
  Share2, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink, 
  Shield, 
  Filter, 
  Eye, 
  CheckSquare, 
  Square
} from 'lucide-react';
import { AutocompleteInput } from './AutocompleteInput';

interface GenerateShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilters?: SharedLinkFilters;
  onLinkCreated?: (link: SharedLink) => void;
}

const AVAILABLE_COLUMNS: { id: SharedLinkColumn; labelFr: string; labelEn: string; labelZh: string; sensitive?: boolean }[] = [
  { id: 'materialCode', labelFr: 'Code Article (SAP)', labelEn: 'Material Code', labelZh: '物料编码 (SAP)' },
  { id: 'materialName', labelFr: 'Désignation (Anglais)', labelEn: 'Description (English)', labelZh: '物料英文描述' },
  { id: 'chineseName', labelFr: 'Nom Chinois', labelEn: 'Chinese Name', labelZh: '中文名称' },
  { id: 'specification', labelFr: 'Spécification / Modèle', labelEn: 'Specification', labelZh: '规格型号' },
  { id: 'photo', labelFr: 'Photo Réelle', labelEn: 'Real Photo', labelZh: '实物照片' },
  { id: 'warehouseId', labelFr: 'Site / Magasin', labelEn: 'Site / Warehouse', labelZh: '所属站点/仓库' },
  { id: 'binLocation', labelFr: 'Emplacement (BIN / Rangée)', labelEn: 'BIN Location', labelZh: '存储库位 (BIN)' },
  { id: 'quantity', labelFr: 'Quantité Totale', labelEn: 'Total Quantity', labelZh: '总库存量' },
  { id: 'availableQuantity', labelFr: 'Quantité Disponible', labelEn: 'Available Quantity', labelZh: '当前可用库存' },
  { id: 'uom', labelFr: 'Unité (UOM)', labelEn: 'Unit of Measure', labelZh: '计量单位' },
  { id: 'unitPrice', labelFr: 'Prix Unitaire / Coût (USD)', labelEn: 'Unit Price / Cost', labelZh: '单价 / 成本 (USD)', sensitive: true },
  { id: 'totalValue', labelFr: 'Valorisation Totale (USD)', labelEn: 'Total Valuation', labelZh: '总货值金额 (USD)', sensitive: true },
  { id: 'remarks', labelFr: 'Notes & Remarques', labelEn: 'Remarks & Notes', labelZh: '备注说明' }
];

const DEFAULT_SELECTED_COLUMNS: SharedLinkColumn[] = [
  'materialCode',
  'materialName',
  'chineseName',
  'specification',
  'warehouseId',
  'binLocation',
  'quantity',
  'availableQuantity',
  'uom',
  'photo'
];

export const GenerateShareModal: React.FC<GenerateShareModalProps> = ({
  isOpen,
  onClose,
  initialFilters,
  onLinkCreated
}) => {
  const { currentUser, t, currentLanguage } = useAuth();

  const [title, setTitle] = useState('');
  const [warehouseId, setWarehouseId] = useState<string>(
    initialFilters?.warehouseId || 'ALL'
  );
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || '');
  const [binLocation, setBinLocation] = useState(initialFilters?.binLocation || '');
  const [status, setStatus] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK'>(
    initialFilters?.status || 'ALL'
  );

  const [durationPreset, setDurationPreset] = useState<'15m' | '1h' | '6h' | '24h' | '3d' | '7d' | 'custom'>('24h');
  const [customHours, setCustomHours] = useState<number>(48);

  const [visibleColumns, setVisibleColumns] = useState<SharedLinkColumn[]>(DEFAULT_SELECTED_COLUMNS);

  const [createdLink, setCreatedLink] = useState<SharedLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [locations, setLocations] = useState<StorageLocation[]>(() => dataService.getLocations());

  useEffect(() => {
    if (isOpen) {
      setLocations(dataService.getLocations());
      setWarehouseId(initialFilters?.warehouseId || 'ALL');
      setSearchQuery(initialFilters?.searchQuery || '');
      setBinLocation(initialFilters?.binLocation || '');
      setStatus(initialFilters?.status || 'ALL');
      setCreatedLink(null);
      setCopied(false);
    }
  }, [isOpen, initialFilters]);

  // Compute duration in minutes
  const durationMinutes = useMemo(() => {
    switch (durationPreset) {
      case '15m': return 15;
      case '1h': return 60;
      case '6h': return 6 * 60;
      case '24h': return 24 * 60;
      case '3d': return 3 * 24 * 60;
      case '7d': return 7 * 24 * 60;
      case 'custom': return Math.max(1, customHours) * 60;
      default: return 24 * 60;
    }
  }, [durationPreset, customHours]);

  // Live count of matching items
  const matchingCount = useMemo(() => {
    let items = dataService.getStock({ warehouseId: warehouseId === 'ALL' ? undefined : warehouseId });
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(s => 
        s.materialCode.toLowerCase().includes(q) ||
        s.materialName.toLowerCase().includes(q) ||
        (s.chineseName && s.chineseName.toLowerCase().includes(q)) ||
        (s.specification && s.specification.toLowerCase().includes(q)) ||
        s.binLocation.toLowerCase().includes(q)
      );
    }
    if (binLocation.trim()) {
      const bq = binLocation.toLowerCase().trim();
      items = items.filter(s => s.binLocation.toLowerCase().includes(bq));
    }
    if (status === 'IN_STOCK') {
      items = items.filter(s => s.availableQuantity > 0);
    } else if (status === 'OUT_OF_STOCK') {
      items = items.filter(s => s.availableQuantity <= 0);
    } else if (status === 'LOW_STOCK') {
      items = items.filter(s => s.availableQuantity > 0 && s.availableQuantity <= 5);
    }
    return items.length;
  }, [warehouseId, searchQuery, binLocation, status]);

  const toggleColumn = (col: SharedLinkColumn) => {
    setVisibleColumns(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const handleSelectAllColumns = () => {
    setVisibleColumns(AVAILABLE_COLUMNS.map(c => c.id));
  };

  const handleSelectSafeColumns = () => {
    setVisibleColumns(AVAILABLE_COLUMNS.filter(c => !c.sensitive).map(c => c.id));
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    const link = dataService.createSharedLink({
      title: title.trim() || undefined,
      filters: {
        warehouseId: warehouseId as any,
        searchQuery: searchQuery.trim() || undefined,
        binLocation: binLocation.trim() || undefined,
        status
      },
      visibleColumns,
      durationMinutes,
      createdBy: currentUser
    });

    setCreatedLink(link);
    if (onLinkCreated) {
      onLinkCreated(link);
    }
  };

  const getFullShareUrl = (token: string) => {
    const origin = window.location.origin;
    return `${origin}/share/${token}`;
  };

  const handleCopy = () => {
    if (!createdLink) return;
    const url = getFullShareUrl(createdLink.token);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleResetAndClose = () => {
    setCreatedLink(null);
    setCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-zinc-300 rounded-lg shadow-xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-zinc-900 text-white rounded">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">
                {t.share_modal_title}
              </h2>
              <p className="text-xs text-zinc-500">
                {t.share_modal_subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {createdLink ? (
          /* SUCCESS STATE */
          <div className="p-6 space-y-5">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded flex items-start gap-3">
              <div className="p-1.5 bg-emerald-600 text-white rounded shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-emerald-900">
                  {t.share_link_created_success}
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {t.share_link_success_desc}
                </p>
              </div>
            </div>

            {/* Generated URL Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 block">
                {t.share_link_url_label}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-zinc-50 border border-zinc-300 rounded px-3 py-2 text-xs font-mono text-zinc-900 break-all select-all">
                  {getFullShareUrl(createdLink.token)}
                </div>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? t.link_copied_to_clipboard : t.btn_copy_link}</span>
                </button>
              </div>
            </div>

            {/* Link Summary Details */}
            <div className="bg-zinc-50 border border-zinc-200 rounded p-4 text-xs space-y-2 font-mono">
              <div className="flex justify-between items-center text-zinc-600 border-b border-zinc-200 pb-2">
                <span>{t.security_token_label} :</span>
                <span className="text-zinc-900 font-bold">{createdLink.token}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-600 border-b border-zinc-200 pb-2">
                <span>{t.expiration_label} :</span>
                <span className="text-zinc-900 font-semibold">
                  {new Date(createdLink.expiresAt).toLocaleString()} ({Math.round((new Date(createdLink.expiresAt).getTime() - Date.now()) / (3600 * 1000))}h)
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-600 border-b border-zinc-200 pb-2">
                <span>{t.shared_items_count_label} :</span>
                <span className="text-zinc-900 font-bold">{matchingCount} {t.items_suffix}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-600">
                <span>{t.visible_columns_label} ({createdLink.visibleColumns.length}) :</span>
                <span className="text-zinc-700 truncate max-w-[280px]">
                  {createdLink.visibleColumns.join(', ')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <a
                href={`/share/${createdLink.token}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{t.btn_view_public}</span>
              </a>
              <button
                onClick={handleResetAndClose}
                className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-xs font-semibold transition-colors"
              >
                {t.btn_close}
              </button>
            </div>
          </div>
        ) : (
          /* CONFIGURATION FORM */
          <form onSubmit={handleGenerate} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Title / Description */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                <span>{t.share_link_title_label}</span>
                <span className="text-[10px] text-zinc-400 font-normal">{t.field_optional}</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t.share_link_title_placeholder}
                className="w-full bg-white border border-zinc-300 text-xs text-zinc-900 px-3 py-2 rounded focus:border-zinc-900 outline-none"
              />
            </div>

            {/* Filter Section */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <Filter className="w-3.5 h-3.5 text-zinc-600" />
                  <span>{t.applied_filters_title}</span>
                </span>
                <span className="text-xs font-mono font-bold text-zinc-900 bg-white border border-zinc-300 px-2 py-0.5 rounded">
                  {matchingCount} {t.share_matching_items_preview}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Warehouse Filter */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                    {t.share_filter_warehouse}
                  </label>
                  <select
                    value={warehouseId}
                    onChange={e => setWarehouseId(e.target.value)}
                    className="w-full bg-white border border-zinc-300 text-xs text-zinc-800 px-2.5 py-2 rounded font-semibold focus:outline-none focus:border-zinc-900"
                  >
                    <option value="ALL">{t.all_warehouses}</option>
                    <optgroup label={t.main_warehouses_group}>
                      <option value="B1">B1 (MD01)</option>
                      <option value="B2">B2 (Zones A-E)</option>
                    </optgroup>
                    <optgroup label={t.containers_and_sites_group}>
                      {locations.filter(l => l.code !== 'B1' && l.code !== 'B2').map(loc => (
                        <option key={loc.id} value={loc.code}>
                          {loc.code} — {loc.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Stock Status */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                    {t.share_filter_status}
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-white border border-zinc-300 text-xs text-zinc-800 px-2.5 py-2 rounded focus:outline-none focus:border-zinc-900"
                  >
                    <option value="ALL">{t.share_filter_status_all}</option>
                    <option value="IN_STOCK">{t.share_filter_status_in_stock}</option>
                    <option value="OUT_OF_STOCK">{t.share_filter_status_out_of_stock}</option>
                    <option value="LOW_STOCK">{t.share_filter_status_low_stock}</option>
                  </select>
                </div>

                {/* Text Search */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                    {t.share_filter_search}
                  </label>
                  <AutocompleteInput
                    field="materialName"
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder={t.share_filter_search_placeholder}
                  />
                </div>

                {/* Bin Location */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                    {t.share_filter_bin}
                  </label>
                  <AutocompleteInput
                    field="binLocation"
                    value={binLocation}
                    onChange={setBinLocation}
                    placeholder={t.share_filter_bin_placeholder}
                    fontMono
                    uppercase
                  />
                </div>
              </div>
            </div>

            {/* Expiration Duration Section */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-600" />
                <span>{t.share_expiration_label}</span>
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {[
                  { id: '15m', label: t.share_exp_15m },
                  { id: '1h', label: t.share_exp_1h },
                  { id: '6h', label: t.share_exp_6h },
                  { id: '24h', label: t.share_exp_24h },
                  { id: '3d', label: t.share_exp_3d },
                  { id: '7d', label: t.share_exp_7d },
                  { id: 'custom', label: t.share_exp_custom }
                ].map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setDurationPreset(preset.id as any)}
                    className={`py-1.5 px-2 rounded text-xs font-semibold transition-colors text-center ${
                      durationPreset === preset.id
                        ? 'bg-zinc-900 text-white font-bold'
                        : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {durationPreset === 'custom' && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-200">
                  <span className="text-xs text-zinc-600">{t.share_exp_custom_hours} :</span>
                  <input
                    type="number"
                    min="1"
                    max="720"
                    value={customHours}
                    onChange={e => setCustomHours(parseInt(e.target.value, 10) || 1)}
                    className="w-24 bg-white border border-zinc-300 text-xs text-zinc-900 px-2 py-1 rounded"
                  />
                  <span className="text-xs text-zinc-500">{customHours} {t.hours_unit} ({Math.round(customHours / 24)} {t.days_unit})</span>
                </div>
              )}
            </div>

            {/* Column Visibility Selection */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-zinc-600" />
                    <span>{t.share_visible_columns_title}</span>
                  </label>
                  <p className="text-[11px] text-zinc-500">
                    {t.share_visible_columns_desc}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={handleSelectAllColumns}
                    className="text-zinc-900 underline font-medium"
                  >
                    {t.select_all_columns}
                  </button>
                  <span className="text-zinc-300">•</span>
                  <button
                    type="button"
                    onClick={handleSelectSafeColumns}
                    className="text-zinc-900 underline font-medium"
                  >
                    {t.hide_prices_costs}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-zinc-50 p-3 rounded border border-zinc-200 max-h-48 overflow-y-auto">
                {AVAILABLE_COLUMNS.map(col => {
                  const isChecked = visibleColumns.includes(col.id);
                  const label = currentLanguage === 'en' ? col.labelEn : currentLanguage === 'zh' ? col.labelZh : col.labelFr;
                  return (
                    <label
                      key={col.id}
                      onClick={() => toggleColumn(col.id)}
                      className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition select-none text-xs ${
                        isChecked ? 'bg-white border border-zinc-300 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-100'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-zinc-900 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-400 shrink-0" />
                      )}
                      <span className="truncate">{label}</span>
                      {col.sensitive && (
                        <span className="ml-auto text-[9px] bg-amber-50 border border-amber-200 text-amber-800 px-1.5 py-0.2 rounded shrink-0">
                          {t.sensitive_cost_badge}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
              <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-zinc-700" />
                <span>{t.direct_readonly_access_desc}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-300 rounded text-xs font-semibold transition-colors"
                >
                  {t.btn_cancel}
                </button>
                <button
                  type="submit"
                  disabled={matchingCount === 0}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{t.btn_create_link}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
