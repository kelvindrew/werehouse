import React, { useState, useEffect, useMemo } from 'react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import { StockItem, StockIssueVoucher } from '@shared/types/models';
import { 
  X, 
  ArrowUpFromLine, 
  Check, 
  AlertCircle, 
  Search, 
  Printer, 
  CheckCircle2, 
  Layers, 
  Package, 
  MapPin, 
  DollarSign, 
  FileText,
  RotateCcw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { AutocompleteInput } from './AutocompleteInput';
import { IssueVoucherDetailModal } from './IssueVoucherDetailModal';

interface IssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedItem?: StockItem | null;
  onSuccess: (msg: string) => void;
  onOpenMultiVoucher?: () => void;
}

export const IssueModal: React.FC<IssueModalProps> = ({
  isOpen,
  onClose,
  preselectedItem,
  onSuccess,
  onOpenMultiVoucher
}) => {
  const { currentUser, selectedWarehouse, t } = useAuth();

  // Active filter inside modal
  const [filterWarehouse, setFilterWarehouse] = useState<string>(
    selectedWarehouse !== 'ALL' ? selectedWarehouse : 'ALL'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStockId, setSelectedStockId] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [requester, setRequester] = useState('');
  const [department, setDepartment] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Success view state
  const [completedVoucher, setCompletedVoucher] = useState<StockIssueVoucher | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Available stock list
  const allStock = useMemo(() => {
    return dataService.getStock({ 
      warehouseId: filterWarehouse !== 'ALL' ? filterWarehouse : undefined,
      onlyAvailable: true 
    });
  }, [filterWarehouse, isOpen]);

  // Filtered search list
  const filteredStockList = useMemo(() => {
    if (!searchQuery.trim()) return allStock.slice(0, 50);
    const q = searchQuery.toLowerCase().trim();
    return allStock.filter(s => 
      s.materialCode.toLowerCase().includes(q) ||
      s.materialName.toLowerCase().includes(q) ||
      (s.chineseName && s.chineseName.toLowerCase().includes(q)) ||
      (s.specification && s.specification.toLowerCase().includes(q)) ||
      s.binLocation.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [allStock, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      setCompletedVoucher(null);
      setIsDetailModalOpen(false);
      setFilterWarehouse(selectedWarehouse !== 'ALL' ? selectedWarehouse : 'ALL');
      setError(null);
      setQuantity('');
      setRequester('');
      setDepartment('');
      setReason('');
      setComments('');
      setReferenceNumber(dataService.generateNextVoucherNumber());

      if (preselectedItem) {
        setSelectedStockId(preselectedItem.id);
        setFilterWarehouse(preselectedItem.warehouseId);
        setSearchQuery(preselectedItem.materialCode);
      } else {
        setSelectedStockId('');
        setSearchQuery('');
      }
    }
  }, [isOpen, preselectedItem, selectedWarehouse]);

  if (!isOpen) return null;

  const currentStockItem = allStock.find(s => s.id === selectedStockId) || 
    (preselectedItem && preselectedItem.id === selectedStockId ? preselectedItem : null);
  const availableQty = currentStockItem ? currentStockItem.availableQuantity : 0;
  const numQty = typeof quantity === 'number' ? quantity : 0;
  const lineTotalValuation = currentStockItem ? Math.round(numQty * currentStockItem.unitPrice * 100) / 100 : 0;

  const handleSetMaxQty = () => {
    if (availableQty > 0) {
      setQuantity(availableQty);
    }
  };

  const handleAddPresetQty = (amount: number) => {
    const currentVal = typeof quantity === 'number' ? quantity : 0;
    const next = Math.min(availableQty, currentVal + amount);
    setQuantity(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentStockItem) {
      setError(t.select_material || 'Veuillez sélectionner un article à sortir.');
      return;
    }

    const qtyNum = Number(quantity);
    if (!quantity || isNaN(qtyNum) || qtyNum <= 0) {
      setError(t.issue_qty || 'Veuillez spécifier une quantité valide strictement positive.');
      return;
    }

    if (qtyNum > availableQty) {
      setError(`${t.insufficient_stock_error || 'Stock disponible insuffisant'} (${qtyNum} > ${availableQty} ${currentStockItem.uom})`);
      return;
    }

    if (!requester.trim()) {
      setError(t.recipient_name || 'Le nom du demandeur / bénéficiaire est obligatoire.');
      return;
    }

    try {
      const res = dataService.performIssue({
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

      // Capture generated voucher for instant print or review
      setCompletedVoucher(res.voucher);
      onSuccess(`${t.issue_success || 'Sortie confirmée avec succès'} (${res.voucher.voucherNumber} : -${qtyNum} ${currentStockItem.uom})`);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la sortie.');
    }
  };

  const handleResetForAnotherIssue = () => {
    setCompletedVoucher(null);
    setSelectedStockId('');
    setSearchQuery('');
    setQuantity('');
    setError(null);
    setReferenceNumber(dataService.generateNextVoucherNumber());
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white border border-zinc-300 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-950 text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-lime text-zinc-950 flex items-center justify-center font-black shadow-sm">
                <ArrowUpFromLine className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm tracking-tight text-white uppercase">
                    {t.issue_title || 'Sortie de Matériel / Dispatch'}
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-lime/20 text-lime px-2 py-0.5 rounded border border-lime/30">
                    EXPRESS
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-medium">
                  {completedVoucher 
                    ? `Bon de sortie officiel généré : ${completedVoucher.voucherNumber}` 
                    : (t.issue_desc || 'Déstockage physique direct avec bon de sortie officiel automatique')}
                </p>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title={t.btn_close || 'Fermer'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SUCCESS SCREEN */}
          {completedVoucher ? (
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-emerald-950 tracking-tight">
                    Sortie de matériel validée avec succès !
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1 font-medium">
                    Le stock physique a été décrémenté et synchronisé sur Cloud Firestore.
                  </p>
                </div>

                <div className="inline-block bg-white border border-emerald-300 rounded-lg px-4 py-2 font-mono text-sm font-bold text-zinc-950 shadow-2xs">
                  N° DE BON : <span className="text-emerald-700">{completedVoucher.voucherNumber}</span>
                </div>
              </div>

              {/* Summary Details */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
                  <span className="text-zinc-500 font-medium">Demandeur / Bénéficiaire :</span>
                  <span className="font-bold text-zinc-900 font-mono text-sm">{completedVoucher.buyerName}</span>
                </div>
                {completedVoucher.department && (
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
                    <span className="text-zinc-500 font-medium">Département / Affectation :</span>
                    <span className="font-semibold text-zinc-800">{completedVoucher.department}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
                  <span className="text-zinc-500 font-medium">Articles délivrés :</span>
                  <span className="font-bold text-zinc-900 font-mono">
                    {completedVoucher.totalIssuedQty} unités ({completedVoucher.items.length} réf.)
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
                  <span className="text-zinc-500 font-medium">Valorisation sortie :</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ${completedVoucher.totalValuationUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Magasin d'origine :</span>
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 text-[11px]">
                    {completedVoucher.warehouseId}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(true)}
                  className="w-full sm:flex-1 py-3 px-4 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Printer className="w-4 h-4 text-lime" />
                  <span>Imprimer le Bon de Sortie Officiel (A4)</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetForAnotherIssue}
                  className="w-full sm:w-auto py-3 px-4 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-zinc-600" />
                  <span>Nouvelle sortie</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            /* DISPATCH FORM */
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Warehouse Filter Chips */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                    {t.warehouse_view || 'Magasin / Site de Déstockage'}
                  </label>
                  {onOpenMultiVoucher && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenMultiVoucher();
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Passer en Bon Multi-Articles ➔</span>
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'ALL', label: 'Tous les magasins' },
                    { id: 'B1', label: 'B1 — Lourd & Vannes' },
                    { id: 'B2', label: 'B2 — Maintenance' },
                    { id: 'CONT-01', label: 'Container 01' },
                    { id: 'CONT-02', label: 'Container 02' },
                    { id: 'YARD', label: 'Yard Extérieur' },
                  ].map(w => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        setFilterWarehouse(w.id);
                        setSelectedStockId('');
                      }}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        filterWarehouse === w.id
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-2xs font-bold'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Material Search & Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700">
                  {t.stock_item_select_label || 'Rechercher et sélectionner le matériel'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Tapez le code SAP (ex: 100000000000045) ou désignation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-mono text-zinc-900 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                  />
                </div>

                {/* Dropdown Options */}
                <div className="max-h-36 overflow-y-auto border border-zinc-200 rounded-lg divide-y divide-zinc-100 bg-white shadow-2xs mt-1">
                  {filteredStockList.length === 0 ? (
                    <div className="p-3 text-center text-xs text-zinc-400">
                      Aucun article disponible trouvé.
                    </div>
                  ) : (
                    filteredStockList.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedStockId(s.id);
                          setSearchQuery(s.materialCode);
                        }}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors text-xs ${
                          selectedStockId === s.id
                            ? 'bg-lime/20 border-l-4 border-l-lime text-zinc-950 font-bold'
                            : 'hover:bg-zinc-50 text-zinc-800'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-zinc-900">{s.materialCode}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                              {s.warehouseId} ({s.binLocation})
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                            {s.materialName} {s.chineseName ? `• ${s.chineseName}` : ''}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-zinc-950">
                            {s.availableQuantity} {s.uom}
                          </span>
                          <span className="block text-[10px] text-zinc-400 font-mono">
                            ${s.unitPrice.toFixed(2)} / u
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Selected Material Card (Visual Feedback) */}
              {currentStockItem && (
                <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-3.5 shadow-2xs">
                  {currentStockItem.imageUrl ? (
                    <img 
                      src={currentStockItem.imageUrl} 
                      alt="" 
                      className="w-12 h-12 object-cover rounded-lg border border-zinc-200 bg-white shrink-0" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-zinc-200 text-zinc-600 flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black font-mono text-zinc-950">{currentStockItem.materialCode}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {currentStockItem.availableQuantity} {currentStockItem.uom} dispo
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-zinc-800 truncate mt-0.5">
                      {currentStockItem.materialName}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        {currentStockItem.warehouseId} — {currentStockItem.binLocation}
                      </span>
                      <span>•</span>
                      <span>Prix : ${currentStockItem.unitPrice.toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity to Issue with Quick Preset Chips */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700">
                    {t.issue_qty || 'Quantité à sortir'} <span className="text-red-500">*</span>
                  </label>
                  {currentStockItem && (
                    <span className="text-[11px] font-mono text-zinc-500">
                      Disponible : <strong className="text-zinc-900">{availableQty}</strong> {currentStockItem.uom}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="any"
                      min="0.001"
                      max={availableQty}
                      placeholder={`Max: ${availableQty}`}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white border border-zinc-300 text-base text-zinc-950 font-mono font-black px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                    />
                    <span className="absolute right-3.5 top-3 text-xs font-bold text-zinc-400 font-mono">
                      {currentStockItem?.uom || 'UOM'}
                    </span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAddPresetQty(1)}
                      className="px-2.5 py-2.5 text-xs font-mono font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg border border-zinc-200 transition-colors"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPresetQty(5)}
                      className="px-2.5 py-2.5 text-xs font-mono font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg border border-zinc-200 transition-colors"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPresetQty(10)}
                      className="px-2.5 py-2.5 text-xs font-mono font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg border border-zinc-200 transition-colors"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={handleSetMaxQty}
                      className="px-3 py-2.5 text-xs font-bold bg-lime hover:bg-lime/90 text-zinc-950 rounded-lg border border-lime shadow-2xs transition-colors"
                    >
                      Max
                    </button>
                  </div>
                </div>

                {/* Valuation line */}
                {lineTotalValuation > 0 && (
                  <div className="flex justify-between items-center text-[11px] font-mono px-2 text-zinc-500">
                    <span>Impact valeur déstockée :</span>
                    <span className="font-bold text-emerald-700">
                      ${lineTotalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                    </span>
                  </div>
                )}
              </div>

              {/* Requester & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    {t.recipient_name || 'Bénéficiaire / Demandeur'} <span className="text-red-500">*</span>
                  </label>
                  <AutocompleteInput
                    field="requester"
                    placeholder="ex: Jean-Pierre Kalala, Équipe A..."
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
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    {t.destination_dept || 'Département / Chantier'}
                  </label>
                  <AutocompleteInput
                    field="department"
                    placeholder="ex: Maintenance, Usine, Concassage..."
                    value={department}
                    onChange={setDepartment}
                  />
                </div>
              </div>

              {/* Reason & Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    {t.issue_reason || 'Motif / Affectation'}
                  </label>
                  <AutocompleteInput
                    field="reason"
                    placeholder="ex: Remplacement pompe, Révision..."
                    value={reason}
                    onChange={setReason}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    N° Bon / Ordre de travail
                  </label>
                  <input
                    type="text"
                    placeholder="ex: BS-2026-0045"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full bg-white border border-zinc-300 text-xs font-mono font-bold text-zinc-900 px-3 py-2 rounded-lg focus:outline-none focus:border-zinc-950"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  {t.remarks || 'Remarques & Observations'}
                </label>
                <textarea
                  rows={2}
                  placeholder="Remarques complémentaires pour le registre..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full bg-white border border-zinc-300 text-xs text-zinc-900 p-2.5 rounded-lg focus:outline-none focus:border-zinc-950 resize-none"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-zinc-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 rounded-xl text-xs font-bold transition-colors"
                >
                  {t.btn_cancel || 'Annuler'}
                </button>

                <button
                  type="submit"
                  disabled={Number(quantity) > availableQty || !quantity || Number(quantity) <= 0 || !requester.trim()}
                  className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm"
                >
                  <Check className="w-4 h-4 text-lime" />
                  <span>Confirmer la sortie physique</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Official Voucher Printable Modal */}
      {completedVoucher && (
        <IssueVoucherDetailModal
          voucher={completedVoucher}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          currentUser={currentUser}
          t={t}
        />
      )}
    </>
  );
};
export default IssueModal;
