import React, { useState, useEffect, useMemo } from 'react';
import { dataService } from '../lib/dataService';
import { SharedLink, StockItem, SupportedLanguage } from '@shared/types/models';
import { getTranslation, LANGUAGE_OPTIONS } from '../lib/i18n';
import { 
  Building2, 
  Clock, 
  Search, 
  ArrowUpDown, 
  AlertTriangle, 
  Ban, 
  Image as ImageIcon,
  Package,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { useResponsiveViewMode } from '../hooks/useResponsiveViewMode';
import { ViewModeSwitcher } from './ViewModeSwitcher';
import { MobileTableNotice } from './MobileTableNotice';

interface SharedPublicViewProps {
  token: string;
  onClose?: () => void;
}

export const SharedPublicView: React.FC<SharedPublicViewProps> = ({ token, onClose }) => {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('fr');
  const t = useMemo(() => getTranslation(currentLang), [currentLang]);

  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<SharedLink | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isRevoked, setIsRevoked] = useState(false);
  const [items, setItems] = useState<Partial<StockItem>[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('materialCode');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, handleSetViewMode] = useResponsiveViewMode('wms_sharedpublic_view_mode');
  const pageSize = 20;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      // 1. Try fast async resolution (checks memory & Firestore)
      let result = await dataService.getSharedLinkByTokenAsync(token, true);

      if (!result.link && isMounted) {
        // If not found immediately, retry after 1.2s in case Firestore connection was warming up
        await new Promise(r => setTimeout(r, 1200));
        result = await dataService.getSharedLinkByTokenAsync(token, true);
      }

      if (isMounted) {
        setLink(result.link);
        setIsExpired(result.isExpired);
        setIsRevoked(result.isRevoked);
        setItems(result.items);
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Compute remaining time string
  const remainingTimeStr = useMemo(() => {
    if (!link) return '';
    const now = Date.now();
    const expiry = new Date(link.expiresAt).getTime();
    const diff = expiry - now;
    if (diff <= 0) return t.status_expired;

    const minutes = Math.floor(diff / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}${t.unit_days_short} ${hours % 24}${t.unit_hours_short}`;
    if (hours > 0) return `${hours}${t.unit_hours_short} ${minutes % 60}${t.unit_minutes_short}`;
    return `${minutes} ${t.unit_minutes_short}`;
  }, [link, t]);

  // Filtered and sorted items
  const filteredAndSortedItems = useMemo(() => {
    let list = [...items];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(item => {
        return (
          (item.materialCode && item.materialCode.toLowerCase().includes(q)) ||
          (item.materialName && item.materialName.toLowerCase().includes(q)) ||
          (item.chineseName && item.chineseName.toLowerCase().includes(q)) ||
          (item.specification && item.specification.toLowerCase().includes(q)) ||
          (item.binLocation && item.binLocation.toLowerCase().includes(q)) ||
          (item.remarks && item.remarks.toLowerCase().includes(q))
        );
      });
    }

    list.sort((a: any, b: any) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });

    return list;
  }, [items, searchTerm, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / pageSize) || 1;
  const paginatedItems = filteredAndSortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const isColVisible = (colName: string) => {
    if (!link) return false;
    return link.visibleColumns.includes(colName as any);
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 flex flex-col font-sans">
      {/* Top Public Bar */}
      <header className="h-14 bg-white border-b border-zinc-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center font-bold text-white">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-zinc-900 text-sm leading-tight flex items-center gap-2">
              <span>{t.app_name}</span>
              <span className="text-[10px] bg-zinc-100 text-zinc-700 font-mono px-2 py-0.5 rounded border border-zinc-300">
                {t.shared_public_badge_readonly}
              </span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono">
              {t.shared_public_header_title}
            </p>
          </div>
        </div>

        {/* Right side: Actions & Language Switcher */}
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-white hover:bg-zinc-50 text-zinc-700 rounded text-xs font-semibold border border-zinc-300 transition"
            >
              {t.shared_public_back_to_app || '← Retour'}
            </button>
          )}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded border border-zinc-200 text-xs">
            {LANGUAGE_OPTIONS.map(opt => (
              <button
                key={opt.code}
                onClick={() => setCurrentLang(opt.code)}
                className={`px-2 py-1 rounded text-xs transition flex items-center gap-1 ${
                  currentLang === opt.code
                    ? 'bg-zinc-900 text-white font-bold'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span>{opt.flag}</span>
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-4">
        {loading ? (
          <div className="py-24 text-center text-zinc-500">
            <div className="inline-block animate-spin w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full mb-3"></div>
            <p className="text-xs">{t.shared_public_loading}</p>
          </div>
        ) : !link ? (
          /* NOT FOUND ERROR */
          <div className="max-w-lg mx-auto my-16 p-8 bg-white border border-zinc-200 rounded text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-zinc-900">
              {t.shared_public_not_found_title}
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {t.shared_public_not_found_message}
            </p>
          </div>
        ) : isRevoked ? (
          /* REVOKED STATE */
          <div className="max-w-lg mx-auto my-16 p-8 bg-white border border-amber-200 rounded text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
              <Ban className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-zinc-900">
              {t.shared_public_revoked_title}
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {t.shared_public_revoked_message}
            </p>
          </div>
        ) : isExpired ? (
          /* EXPIRED STATE */
          <div className="max-w-lg mx-auto my-16 p-8 bg-white border border-rose-200 rounded text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-zinc-900">
              {t.shared_public_expired_title}
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {t.shared_public_expired_message}
            </p>
            <div className="text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-200">
              {t.status_expired} : {new Date(link.expiresAt).toLocaleString()}
            </div>
          </div>
        ) : (
          /* VALID ACTIVE SHARED DATA */
          <>
            {/* Header Card with Authorized Filters & Expiration */}
            <div className="bg-white border border-zinc-200 rounded p-4 shadow-sm space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <h2 className="text-base font-bold text-zinc-900">
                      {link.title}
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {t.shared_public_header_subtitle}
                  </p>
                </div>

                {/* Expiration Badge */}
                <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded font-mono text-xs">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-zinc-600">{t.shared_public_expires_in} :</span>
                  <span className="font-bold text-amber-700">{remainingTimeStr}</span>
                </div>
              </div>

              {/* Active Filter Criteria Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-zinc-500 font-semibold">{t.shared_public_active_filters} :</span>
                
                <span className="bg-zinc-100 border border-zinc-300 text-zinc-800 font-mono px-2 py-0.5 rounded">
                  {t.col_warehouse} : {link.filters.warehouseId === 'ALL' ? t.all_warehouses : link.filters.warehouseId}
                </span>

                {link.filters.searchQuery && (
                  <span className="bg-zinc-100 border border-zinc-300 text-zinc-800 px-2 py-0.5 rounded">
                    {t.quick_search} : « {link.filters.searchQuery} »
                  </span>
                )}

                {link.filters.binLocation && (
                  <span className="bg-zinc-100 border border-zinc-300 text-zinc-800 font-mono px-2 py-0.5 rounded">
                    {t.col_bin} : {link.filters.binLocation}
                  </span>
                )}

                {link.filters.status && link.filters.status !== 'ALL' && (
                  <span className="bg-zinc-100 border border-zinc-300 text-zinc-800 px-2 py-0.5 rounded">
                    {t.col_link_status} : {link.filters.status === 'IN_STOCK' ? t.share_filter_status_in_stock : link.filters.status === 'OUT_OF_STOCK' ? t.share_filter_status_out_of_stock : t.share_filter_status_low_stock}
                  </span>
                )}

                <div className="ml-auto text-xs font-mono text-zinc-800 font-bold bg-zinc-100 border border-zinc-300 px-2.5 py-1 rounded">
                  {filteredAndSortedItems.length} {t.shared_public_items_count}
                </div>
              </div>
            </div>

            {/* In-results Search Filter & Mobile Switcher */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={t.shared_public_search_within}
                  className="w-full bg-white border border-zinc-300 text-xs text-zinc-900 pl-10 pr-4 py-2.5 rounded-full outline-none focus:border-zinc-900 transition-all shadow-xs"
                />
              </div>

              {/* View Switcher (Cards / Tableau) */}
              <ViewModeSwitcher
                viewMode={viewMode}
                onChange={handleSetViewMode}
                cardsLabel={t.btn_cards}
                tableLabel={t.btn_table}
                showMobileLabel
              />
            </div>

            {/* Tactile Cards */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {paginatedItems.map(item => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      {isColVisible('photo') && (
                        <div className="w-14 h-14 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.materialName || 'Material'} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-zinc-400" />
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {isColVisible('materialCode') && (
                          <div className="font-mono text-xs font-bold text-zinc-900 truncate">
                            {item.materialCode}
                          </div>
                        )}
                        {isColVisible('materialName') && (
                          <div className="text-xs font-semibold text-zinc-800 line-clamp-2 mt-0.5">
                            {item.materialName}
                          </div>
                        )}
                        {isColVisible('chineseName') && item.chineseName && (
                          <div className="text-[11px] text-zinc-500 mt-0.5 truncate">
                            {item.chineseName}
                          </div>
                        )}
                      </div>
                    </div>

                    {isColVisible('specification') && item.specification && (
                      <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-200 text-[11px] font-mono text-zinc-600">
                        <span className="text-zinc-400 mr-1">{t.mat_specs}:</span>
                        {item.specification}
                      </div>
                    )}

                    {/* Warehouse & BIN & Quantities strip */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-zinc-100">
                      <div className="space-y-1">
                        {isColVisible('warehouseId') && (
                          <div className="text-[11px] font-mono">
                            <span className="text-zinc-400">WH:</span>{' '}
                            <span className="font-bold text-zinc-800">{item.warehouseId}</span>
                          </div>
                        )}
                        {isColVisible('binLocation') && (
                          <div className="text-[11px] font-mono">
                            <span className="text-zinc-400">BIN:</span>{' '}
                            <span className="font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">{item.binLocation}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right space-y-1">
                        {isColVisible('quantity') && (
                          <div className="font-mono">
                            <span className="text-[10px] text-zinc-400 uppercase mr-1">{t.col_qty}:</span>
                            <span className="text-sm font-bold text-zinc-900">
                              {item.quantity?.toLocaleString('en-US')} <span className="text-[10px] font-normal text-zinc-500">{item.uom}</span>
                            </span>
                          </div>
                        )}
                        {isColVisible('availableQuantity') && (
                          <div className="font-mono text-[11px] text-emerald-700 font-semibold">
                            <span className="text-[10px] text-zinc-400 mr-1">{t.col_available}:</span>
                            {item.availableQuantity?.toLocaleString('en-US')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Financials if visible */}
                    {(isColVisible('unitPrice') || isColVisible('totalValue')) && (
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs font-mono">
                        {isColVisible('unitPrice') && (
                          <span className="text-zinc-500">
                            P.U: ${item.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                        {isColVisible('totalValue') && (
                          <span className="font-bold text-zinc-900 ml-auto">
                            Total: ${item.totalValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    )}

                    {isColVisible('remarks') && item.remarks && (
                      <div className="text-[10px] text-zinc-400 italic pt-1 border-t border-zinc-100">
                        {item.remarks}
                      </div>
                    )}
                  </div>
                ))}

                {filteredAndSortedItems.length === 0 && (
                  <div className="bg-white rounded-2xl border border-zinc-200/80 p-8 text-center text-zinc-400 text-xs italic">
                    {t.no_matching_stock}
                  </div>
                )}
              </div>
            )}

            {/* Data Table */}
            {viewMode === 'table' && (
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-3 pb-0">
                  <MobileTableNotice
                    onSwitchToCards={() => handleSetViewMode('cards')}
                    cardsLabel={t.btn_cards}
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 font-mono text-[11px] uppercase select-none">
                      {isColVisible('photo') && (
                        <th className="py-2.5 px-3">{t.col_photo}</th>
                      )}
                      {isColVisible('materialCode') && (
                        <th 
                          onClick={() => handleSort('materialCode')}
                          className="py-2.5 px-3 cursor-pointer hover:text-zinc-900"
                        >
                          <div className="flex items-center gap-1">
                            <span>{t.col_code}</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                      )}
                      {isColVisible('materialName') && (
                        <th 
                          onClick={() => handleSort('materialName')}
                          className="py-2.5 px-3 cursor-pointer hover:text-zinc-900"
                        >
                          <div className="flex items-center gap-1">
                            <span>{t.col_name}</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                      )}
                      {isColVisible('chineseName') && (
                        <th className="py-2.5 px-3">{t.col_chinese_name}</th>
                      )}
                      {isColVisible('specification') && (
                        <th className="py-2.5 px-3">{t.mat_specs}</th>
                      )}
                      {isColVisible('warehouseId') && (
                        <th 
                          onClick={() => handleSort('warehouseId')}
                          className="py-2.5 px-3 cursor-pointer hover:text-zinc-900"
                        >
                          <div className="flex items-center gap-1">
                            <span>{t.col_warehouse}</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                      )}
                      {isColVisible('binLocation') && (
                        <th 
                          onClick={() => handleSort('binLocation')}
                          className="py-2.5 px-3 cursor-pointer hover:text-zinc-900"
                        >
                          <div className="flex items-center gap-1">
                            <span>{t.col_bin}</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                      )}
                      {isColVisible('quantity') && (
                        <th 
                          onClick={() => handleSort('quantity')}
                          className="py-2.5 px-3 text-right cursor-pointer hover:text-zinc-900"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>{t.col_qty}</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                      )}
                      {isColVisible('availableQuantity') && (
                        <th 
                          onClick={() => handleSort('availableQuantity')}
                          className="py-2.5 px-3 text-right cursor-pointer hover:text-zinc-900"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>{t.col_available}</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                      )}
                      {isColVisible('uom') && (
                        <th className="py-2.5 px-3">{t.col_uom}</th>
                      )}
                      {isColVisible('unitPrice') && (
                        <th 
                          onClick={() => handleSort('unitPrice')}
                          className="py-2.5 px-3 text-right cursor-pointer hover:text-zinc-900"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>{t.col_unit_price}</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                      )}
                      {isColVisible('totalValue') && (
                        <th 
                          onClick={() => handleSort('totalValue')}
                          className="py-2.5 px-3 text-right cursor-pointer hover:text-zinc-900"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>{t.col_total_value}</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                      )}
                      {isColVisible('remarks') && (
                        <th className="py-2.5 px-3">{t.remarks}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {paginatedItems.map(item => (
                      <tr key={item.id} className="hover:bg-zinc-50 transition">
                        {/* Photo */}
                        {isColVisible('photo') && (
                          <td className="py-2 px-3">
                            <div className="w-8 h-8 rounded bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center shrink-0">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.materialName || 'Material'} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                              )}
                            </div>
                          </td>
                        )}

                        {/* Material Code */}
                        {isColVisible('materialCode') && (
                          <td className="py-2 px-3 font-mono font-bold text-zinc-900 whitespace-nowrap">
                            {item.materialCode}
                          </td>
                        )}

                        {/* Material Name */}
                        {isColVisible('materialName') && (
                          <td className="py-2 px-3 text-zinc-900 font-medium max-w-xs truncate">
                            {item.materialName}
                          </td>
                        )}

                        {/* Chinese Name */}
                        {isColVisible('chineseName') && (
                          <td className="py-2 px-3 text-zinc-700 font-sans text-xs whitespace-nowrap">
                            {item.chineseName || '—'}
                          </td>
                        )}

                        {/* Specification */}
                        {isColVisible('specification') && (
                          <td className="py-2 px-3 font-mono text-zinc-600 text-[11px] truncate max-w-[180px]">
                            {item.specification || '—'}
                          </td>
                        )}

                        {/* Warehouse */}
                        {isColVisible('warehouseId') && (
                          <td className="py-2 px-3 font-mono whitespace-nowrap">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-300">
                              {item.warehouseId}
                            </span>
                          </td>
                        )}

                        {/* BIN Location */}
                        {isColVisible('binLocation') && (
                          <td className="py-2 px-3 font-mono font-bold text-zinc-800 whitespace-nowrap">
                            {item.binLocation}
                          </td>
                        )}

                        {/* Total Quantity */}
                        {isColVisible('quantity') && (
                          <td className="py-2 px-3 text-right font-mono font-bold text-zinc-900">
                            {item.quantity?.toLocaleString('en-US')}
                          </td>
                        )}

                        {/* Available Quantity */}
                        {isColVisible('availableQuantity') && (
                          <td className="py-2 px-3 text-right font-mono font-bold text-zinc-900">
                            {item.availableQuantity?.toLocaleString('en-US')}
                          </td>
                        )}

                        {/* UOM */}
                        {isColVisible('uom') && (
                          <td className="py-2 px-3 font-mono text-zinc-500 text-xs">
                            {item.uom}
                          </td>
                        )}

                        {/* Unit Price */}
                        {isColVisible('unitPrice') && (
                          <td className="py-2 px-3 text-right font-mono text-zinc-600">
                            ${item.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        )}

                        {/* Total Value */}
                        {isColVisible('totalValue') && (
                          <td className="py-2 px-3 text-right font-mono font-bold text-zinc-900">
                            ${item.totalValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        )}

                        {/* Remarks */}
                        {isColVisible('remarks') && (
                          <td className="py-2 px-3 text-zinc-500 text-[11px] truncate max-w-[160px]">
                            {item.remarks || '—'}
                          </td>
                        )}
                      </tr>
                    ))}

                    {filteredAndSortedItems.length === 0 && (
                      <tr>
                        <td colSpan={13} className="py-16 text-center text-zinc-400 italic">
                          {t.no_matching_stock}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {/* Pagination */}
            {filteredAndSortedItems.length > 0 && (
              <div className="bg-white border border-zinc-200/80 rounded-2xl p-3 sm:px-4 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600 font-mono shadow-xs">
                <span>
                  {t.showing_items} {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredAndSortedItems.length)} {t.of_total} {filteredAndSortedItems.length}
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="min-h-[44px] px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-700 disabled:opacity-40 hover:bg-zinc-100 active:scale-95 transition-all font-semibold"
                  >
                    {t.prev_page}
                  </button>
                  <span className="px-3 py-1 font-bold">{currentPage} / {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="min-h-[44px] px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-700 disabled:opacity-40 hover:bg-zinc-100 active:scale-95 transition-all font-semibold"
                  >
                    {t.next_page}
                  </button>
                </div>
              </div>
            )}

            {/* Footer Notice */}
            <div className="text-center py-4 text-xs text-zinc-400 font-mono">
              <span>{t.shared_public_footer_notice}</span>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
