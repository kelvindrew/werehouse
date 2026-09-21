import React, { useState, useEffect } from 'react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import { StockItem } from '@shared/types/models';
import { X, ArrowUpFromLine, Check, AlertCircle } from 'lucide-react';
import { AutocompleteInput } from './AutocompleteInput';

interface IssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedItem?: StockItem | null;
  onSuccess: (msg: string) => void;
}

export const IssueModal: React.FC<IssueModalProps> = ({
  isOpen,
  onClose,
  preselectedItem,
  onSuccess
}) => {
  const { currentUser, selectedWarehouse, t } = useAuth();
  const [selectedStockId, setSelectedStockId] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [requester, setRequester] = useState('');
  const [department, setDepartment] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Available stock items
  const stockList = dataService.getStock({ 
    warehouseId: selectedWarehouse !== 'ALL' ? selectedWarehouse : undefined,
    onlyAvailable: true 
  });

  useEffect(() => {
    if (preselectedItem) {
      setSelectedStockId(preselectedItem.id);
    } else if (stockList.length > 0 && !selectedStockId) {
      setSelectedStockId(stockList[0].id);
    }
    setQuantity('');
    setRequester('');
    setDepartment('');
    setReferenceNumber('');
    setReason('');
    setComments('');
    setError(null);
  }, [preselectedItem, isOpen]);

  if (!isOpen) return null;

  const currentStockItem = stockList.find(s => s.id === selectedStockId) || preselectedItem;
  const availableQty = currentStockItem ? currentStockItem.availableQuantity : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentStockItem) {
      setError(t.select_material);
      return;
    }

    const qtyNum = Number(quantity);
    if (!quantity || isNaN(qtyNum) || qtyNum <= 0) {
      setError(t.issue_qty);
      return;
    }

    if (qtyNum > availableQty) {
      setError(`${t.insufficient_stock_error} (${qtyNum} > ${availableQty} ${currentStockItem.uom})`);
      return;
    }

    if (!requester.trim()) {
      setError(t.recipient_name);
      return;
    }

    try {
      dataService.performIssue({
        materialId: currentStockItem.materialId,
        warehouseId: currentStockItem.warehouseId,
        binLocation: currentStockItem.binLocation,
        quantity: qtyNum,
        requester: requester.trim(),
        department: department.trim() || undefined,
        referenceNumber: referenceNumber.trim() || undefined,
        reason: reason.trim() || undefined,
        comments: comments.trim() || undefined,
        user: currentUser
      });

      onSuccess(`${t.issue_success} (-${qtyNum} ${currentStockItem.uom} ${currentStockItem.materialCode} -> ${requester})`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border border-zinc-300 rounded-lg w-full max-w-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-zinc-900 text-white flex items-center justify-center">
              <ArrowUpFromLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">{t.issue_title}</h3>
              <p className="text-[11px] text-zinc-500">{t.issue_desc}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded transition-colors" title={t.btn_close}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Stock Item Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              {t.stock_item_select_label} <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedStockId}
              onChange={(e) => setSelectedStockId(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-xs text-zinc-900 p-2.5 rounded focus:outline-none focus:border-zinc-900 font-mono"
            >
              {stockList.map(s => (
                <option key={s.id} value={s.id}>
                  [{s.warehouseId} - {s.binLocation}] {s.materialCode} — {s.materialName.slice(0, 35)} ({t.col_available}: {s.availableQuantity} {s.uom})
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Banner */}
          {currentStockItem && (
            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded flex items-center justify-between">
              <div>
                <span className="text-[11px] text-zinc-500 block font-medium">{t.col_bin}</span>
                <span className="text-xs font-bold text-zinc-900 font-mono">
                  {currentStockItem.warehouseId} — {currentStockItem.binLocation}
                </span>
                <span className="text-[11px] text-zinc-500 block truncate max-w-[280px]">
                  {currentStockItem.materialName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-zinc-500 block font-medium">{t.available_qty}</span>
                <span className="text-lg font-bold font-mono text-zinc-900">
                  {currentStockItem.availableQuantity} <span className="text-xs font-normal text-zinc-500">{currentStockItem.uom}</span>
                </span>
              </div>
            </div>
          )}

          {/* Quantity to Issue */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              {t.issue_qty} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.001"
                max={availableQty}
                placeholder={`Max: ${availableQty}`}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-zinc-300 text-sm text-zinc-900 font-mono font-bold px-3 py-2.5 rounded focus:outline-none focus:border-zinc-900"
              />
              <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-mono">
                {currentStockItem?.uom || t.col_uom}
              </span>
            </div>
            {Number(quantity) > availableQty && (
              <p className="text-[11px] text-red-600 mt-1 font-medium">
                {t.insufficient_stock_error} ({availableQty})
              </p>
            )}
          </div>

          {/* Requester & Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                {t.recipient_name} <span className="text-red-500">*</span>
              </label>
              <AutocompleteInput
                field="requester"
                placeholder={t.requester_name_placeholder}
                value={requester}
                onChange={setRequester}
                onSelectSuggestion={(s) => {
                  setRequester(s.value);
                  if (s.subLabel && !department) {
                    setDepartment(s.subLabel);
                  }
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                {t.destination_dept}
              </label>
              <AutocompleteInput
                field="department"
                placeholder={t.dept_placeholder}
                value={department}
                onChange={setDepartment}
              />
            </div>
          </div>

          {/* Reason & Reference */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                {t.issue_reason}
              </label>
              <AutocompleteInput
                field="reason"
                placeholder={t.reason_placeholder}
                value={reason}
                onChange={setReason}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                {t.po_number}
              </label>
              <input
                type="text"
                placeholder="BS-2026-XXXX"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full bg-white border border-zinc-300 text-xs text-zinc-900 px-3 py-2 rounded focus:outline-none focus:border-zinc-900 font-mono"
              />
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              {t.remarks}
            </label>
            <textarea
              rows={2}
              placeholder="..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-xs text-zinc-900 p-2.5 rounded focus:outline-none focus:border-zinc-900 resize-none"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-300 rounded text-xs font-semibold transition-colors"
            >
              {t.btn_cancel}
            </button>
            <button
              type="submit"
              disabled={Number(quantity) > availableQty || !quantity || Number(quantity) <= 0}
              className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{t.btn_confirm}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
