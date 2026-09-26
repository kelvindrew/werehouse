import React, { useState, useMemo } from 'react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import { StockItem, StorageLocation } from '@shared/types/models';
import { 
  ClipboardCheck, 
  Search, 
  Save,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { AutocompleteInput } from './AutocompleteInput';
import { useResponsiveViewMode } from '../hooks/useResponsiveViewMode';
import { ViewModeSwitcher } from './ViewModeSwitcher';
import { MobileTableNotice } from './MobileTableNotice';

export const InventoryView: React.FC = () => {
  const { currentUser, selectedWarehouse, setSelectedWarehouse, t } = useAuth();
  const [activeWarehouse, setActiveWarehouse] = useState<string>(
    selectedWarehouse !== 'ALL' ? selectedWarehouse : 'B1'
  );
  const [binSearch, setBinSearch] = useState('');
  const [materialSearch, setMaterialSearch] = useState('');
  const [counts, setCounts] = useState<Record<string, number | ''>>({});
  const [adjustmentReasons, setAdjustmentReasons] = useState<Record<string, string>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [viewMode, handleSetViewMode] = useResponsiveViewMode('wms_inventory_view_mode');

  const locations = useMemo(() => dataService.getLocations(), []);

  // Load stock for this warehouse/location
  const stockItems = useMemo(() => {
    return dataService.getStock({ warehouseId: activeWarehouse });
  }, [activeWarehouse]);

  const filteredItems = useMemo(() => {
    return stockItems.filter(s => {
      const matchBin = !binSearch || s.binLocation.toLowerCase().includes(binSearch.toLowerCase());
      const matchMat = !materialSearch || 
        s.materialCode.toLowerCase().includes(materialSearch.toLowerCase()) ||
        s.materialName.toLowerCase().includes(materialSearch.toLowerCase());
      return matchBin && matchMat;
    });
  }, [stockItems, binSearch, materialSearch]);

  const handleCountChange = (stockId: string, val: string) => {
    setCounts(prev => ({
      ...prev,
      [stockId]: val === '' ? '' : Number(val)
    }));
  };

  const handleReasonChange = (stockId: string, reason: string) => {
    setAdjustmentReasons(prev => ({
      ...prev,
      [stockId]: reason
    }));
  };

  const handleSaveAdjustment = (item: StockItem) => {
    setFeedbackMsg(null);
    const countedVal = counts[item.id];
    if (countedVal === undefined || countedVal === '' || isNaN(Number(countedVal))) {
      setFeedbackMsg({ text: t.physical_count, type: 'error' });
      return;
    }

    const countedQty = Number(countedVal);
    if (countedQty < 0) {
      setFeedbackMsg({ text: t.qty_cannot_be_negative, type: 'error' });
      return;
    }

    const reason = adjustmentReasons[item.id] || t.mov_adjustment;

    try {
      dataService.performInventoryAdjustment({
        stockId: item.id,
        physicalQuantity: countedQty,
        reason,
        user: currentUser
      });

      setFeedbackMsg({
        text: `${t.inventory_updated} : ${item.materialCode} (${item.binLocation}) -> ${countedQty} ${item.uom}.`,
        type: 'success'
      });

      // Clear the inputs for this item
      setCounts(prev => {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      });
      setAdjustmentReasons(prev => {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      });
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Error', type: 'error' });
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 tracking-tight">
            <span className="p-2 bg-zinc-900 text-white rounded-xl shadow-xs">
              <ClipboardCheck className="w-4 h-4" />
            </span>
            <span>{t.inventory_title}</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            {t.inventory_desc}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Prominent View Mode Switcher: Cartes | Tableau */}
          <ViewModeSwitcher
            viewMode={viewMode}
            onChange={handleSetViewMode}
            cardsLabel={t.btn_cards}
            tableLabel={t.btn_table}
          />

          {/* Location Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-zinc-500 font-medium">{t.inventory_target_site}:</span>
            <select
            value={activeWarehouse}
            onChange={(e) => setActiveWarehouse(e.target.value)}
            className="px-3.5 py-1.5 bg-zinc-50/80 border border-zinc-200 text-xs font-semibold rounded-full text-zinc-800 focus:bg-white focus:outline-none focus:border-zinc-900 transition-all"
          >
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
      </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between border shadow-xs ${
          feedbackMsg.type === 'success'
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
            : 'bg-red-50/80 border-red-200 text-red-800'
        }`}>
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div>
          <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
            {t.col_bin} / {t.field_physical_address}
          </label>
          <AutocompleteInput
            field="binLocation"
            placeholder={`${t.col_bin}...`}
            value={binSearch}
            onChange={setBinSearch}
            fontMono
            uppercase
            inputClassName="rounded-full bg-zinc-50/80 border-zinc-200 text-xs py-1.5 px-3.5"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
            {t.col_code} / {t.col_name}
          </label>
          <AutocompleteInput
            field="materialName"
            placeholder={t.search_placeholder}
            value={materialSearch}
            onChange={setMaterialSearch}
            inputClassName="rounded-full bg-zinc-50/80 border-zinc-200 text-xs py-1.5 px-3.5"
          />
        </div>

        <div className="sm:col-span-2 flex items-center justify-between pt-2 border-t border-zinc-100">
          <span className="text-[11px] font-semibold text-zinc-500">
            {filteredItems.length} article(s) à inventorier
          </span>
          <ViewModeSwitcher
            viewMode={viewMode}
            onChange={handleSetViewMode}
            cardsLabel={t.btn_cards}
            tableLabel={t.btn_table}
            showMobileLabel
          />
        </div>
      </div>

      {/* Inventory Table / Tactile Cards */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Tactile Inventory Cards (Active by default) */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 p-3.5 bg-zinc-50/60">
            {filteredItems.slice(0, 50).map((item) => {
              const countedRaw = counts[item.id];
              const hasCount = countedRaw !== undefined && countedRaw !== '';
              const countedQty = hasCount ? Number(countedRaw) : item.quantity;
              const diffQty = countedQty - item.quantity;
              const diffValue = Math.round(diffQty * item.unitPrice * 100) / 100;
              const isDifferent = hasCount && diffQty !== 0;

              return (
                <div 
                  key={item.id}
                  className={`bg-white rounded-2xl p-3.5 border transition-all shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] ${
                    isDifferent ? 'border-amber-400 bg-amber-50/40 ring-1 ring-amber-400/50' : 'border-zinc-200/90'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs bg-zinc-100 text-zinc-900 px-2 py-0.5 rounded border border-zinc-300">
                      📍 {item.binLocation}
                    </span>
                    <span className="font-mono font-bold text-xs text-zinc-900">
                      {item.materialCode}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-zinc-900 mt-1 line-clamp-1">
                    {item.materialName}
                  </h4>
                  {item.specification && (
                    <p className="text-[10px] text-zinc-500 font-mono truncate">
                      {item.specification}
                    </p>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-zinc-100 grid grid-cols-2 gap-2 items-center text-xs">
                    <div className="bg-zinc-50 p-2 rounded-xl border border-zinc-200/80">
                      <span className="text-[10px] text-zinc-400 block uppercase font-mono">Stock Système</span>
                      <span className="font-mono font-bold text-sm text-zinc-900">
                        {item.quantity.toLocaleString()} {item.uom}
                      </span>
                    </div>

                    <div className="bg-zinc-50 p-1.5 rounded-xl border border-zinc-200/80">
                      <label className="text-[10px] text-zinc-500 block uppercase font-mono mb-1 font-semibold">Comptage Réel</label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder={String(item.quantity)}
                        value={countedRaw !== undefined ? countedRaw : ''}
                        onChange={(e) => handleCountChange(item.id, e.target.value)}
                        className={`w-full bg-white border px-2 py-1 rounded-lg text-center font-mono text-sm font-bold focus:outline-none ${
                          isDifferent ? 'border-amber-500 text-amber-900 bg-amber-50' : 'border-zinc-300 text-zinc-900'
                        }`}
                      />
                    </div>
                  </div>

                  {hasCount && isDifferent && (
                    <div className="mt-2 p-2 rounded-xl bg-amber-100/70 border border-amber-200 flex items-center justify-between text-xs font-mono">
                      <span className="text-[11px] font-bold text-amber-900">Écart détecté :</span>
                      <span className={`font-bold ${diffQty > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {diffQty > 0 ? '+' : ''}{diffQty} {item.uom} (${diffValue > 0 ? '+' : ''}{diffValue.toFixed(2)})
                      </span>
                    </div>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Motif de l'écart..."
                      value={adjustmentReasons[item.id] || ''}
                      onChange={(e) => handleReasonChange(item.id, e.target.value)}
                      className="flex-1 bg-zinc-50 border border-zinc-200 text-xs px-2.5 py-1.5 rounded-xl focus:bg-white focus:outline-none focus:border-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveAdjustment(item)}
                      disabled={!hasCount || !isDifferent}
                      className="px-3.5 py-1.5 bg-zinc-950 text-lime rounded-xl text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                    >
                      <Save className="w-3.5 h-3.5 text-lime" />
                      <span>Valider</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="py-8 text-center text-zinc-400 font-mono text-xs">
                {t.no_matching_stock}
              </div>
            )}
          </div>
        )}

        {viewMode === 'table' && (
          <div>
            <div className="p-3 pb-0">
              <MobileTableNotice
                onSwitchToCards={() => handleSetViewMode('cards')}
                cardsLabel={t.btn_cards}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 font-mono text-[11px] uppercase font-semibold">
              <tr>
                <th className="py-3 px-3">{t.col_bin}</th>
                <th className="py-3 px-3">{t.col_code}</th>
                <th className="py-3 px-3">{t.col_name}</th>
                <th className="py-3 px-3 text-right">{t.system_count}</th>
                <th className="py-3 px-3 text-center">{t.col_uom}</th>
                <th className="py-3 px-3 text-center w-36">{t.physical_count}</th>
                <th className="py-3 px-3 text-right">{t.variance}</th>
                <th className="py-3 px-3">{t.issue_reason}</th>
                <th className="py-3 px-3 text-center">{t.col_actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredItems.slice(0, 50).map((item) => {
                const countedRaw = counts[item.id];
                const hasCount = countedRaw !== undefined && countedRaw !== '';
                const countedQty = hasCount ? Number(countedRaw) : item.quantity;
                const diffQty = countedQty - item.quantity;
                const diffValue = Math.round(diffQty * item.unitPrice * 100) / 100;
                const isDifferent = hasCount && diffQty !== 0;

                return (
                  <tr key={item.id} className={`hover:bg-zinc-50 transition-colors ${isDifferent ? 'bg-amber-50/50' : ''}`}>
                    <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">
                      <span className="bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
                        {item.binLocation}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-zinc-900">
                      {item.materialCode}
                    </td>
                    <td className="py-2.5 px-3 max-w-[220px]">
                      <span className="text-zinc-900 font-medium truncate block">{item.materialName}</span>
                      {item.specification && <span className="text-[10px] text-zinc-500 font-mono block truncate">{item.specification}</span>}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900">
                      {item.quantity.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-zinc-600">
                      {item.uom}
                    </td>

                    {/* Physical Count Input */}
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder={String(item.quantity)}
                        value={countedRaw !== undefined ? countedRaw : ''}
                        onChange={(e) => handleCountChange(item.id, e.target.value)}
                        className={`w-28 bg-white border px-2.5 py-1.5 rounded text-center font-mono text-xs font-bold focus:outline-none ${
                          isDifferent ? 'border-amber-500 text-amber-900 bg-amber-50' : 'border-zinc-300 text-zinc-900'
                        }`}
                      />
                    </td>

                    {/* Difference */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      {hasCount && isDifferent ? (
                        <div>
                          <span className={diffQty > 0 ? 'text-emerald-700' : 'text-red-600'}>
                            {diffQty > 0 ? '+' : ''}{diffQty} {item.uom}
                          </span>
                          <span className="text-[10px] text-zinc-500 block">
                            (${diffValue > 0 ? '+' : ''}{diffValue.toFixed(2)})
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 font-normal">{t.no_discrepancy}</span>
                      )}
                    </td>

                    {/* Reason */}
                    <td className="py-2.5 px-3">
                      {hasCount && isDifferent ? (
                        <AutocompleteInput
                          field="reason"
                          placeholder={t.adjustment_reason_placeholder}
                          value={adjustmentReasons[item.id] || ''}
                          onChange={(val) => handleReasonChange(item.id, val)}
                          inputClassName="py-1 px-2"
                        />
                      ) : (
                        <span className="text-zinc-400 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Action button */}
                    <td className="py-2.5 px-3 text-center">
                      {hasCount && isDifferent ? (
                        <button
                          onClick={() => handleSaveAdjustment(item)}
                          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-[11px] font-bold shadow-sm transition-colors flex items-center gap-1 mx-auto"
                        >
                          <Save className="w-3 h-3" />
                          <span>{t.btn_confirm}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCountChange(item.id, String(item.quantity))}
                          className="text-[10px] text-zinc-500 hover:text-zinc-900 underline"
                        >
                          {t.btn_save}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}
      </div>
    </div>
  );
};
