import React, { useState, useEffect } from 'react';
import { 
  StockIssueVoucher, 
  IssueVoucherItem, 
  StockItem, 
  User 
} from '@shared/types/models';
import { dataService } from '../lib/dataService';
import { TranslationDictionary } from '../lib/i18n';
import { AutocompleteInput } from './AutocompleteInput';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  AlertCircle, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Package, 
  FileText, 
  Search, 
  CheckCircle2, 
  Save 
} from 'lucide-react';

interface IssueVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (voucher: StockIssueVoucher) => void;
  voucherToEdit?: StockIssueVoucher | null;
  currentUser: User;
  t: TranslationDictionary;
}

export const IssueVoucherModal: React.FC<IssueVoucherModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  voucherToEdit,
  currentUser,
  t
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // General Info
  const [voucherNumber, setVoucherNumber] = useState('');
  const [warehouseId, setWarehouseId] = useState<string>('B1');
  const [date, setDate] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [department, setDepartment] = useState('');
  const [reason, setReason] = useState('');
  const [observations, setObservations] = useState('');
  const [paperBookRef, setPaperBookRef] = useState('');
  const [paperSigned, setPaperSigned] = useState(false);

  // Selected Items
  const [items, setItems] = useState<IssueVoucherItem[]>([]);

  // Item Search & Picker state (Step 2)
  const [searchQuery, setSearchQuery] = useState('');
  const [availableStockResults, setAvailableStockResults] = useState<StockItem[]>([]);
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null);
  const [requestedQtyInput, setRequestedQtyInput] = useState<number>(1);
  const [itemPickerError, setItemPickerError] = useState<string | null>(null);

  // Confirmation dialog state (Step 4)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (voucherToEdit) {
        setVoucherNumber(voucherToEdit.voucherNumber);
        setWarehouseId(voucherToEdit.warehouseId || 'B1');
        setDate(voucherToEdit.date ? voucherToEdit.date.substring(0, 16) : new Date().toISOString().substring(0, 16));
        setBuyerName(voucherToEdit.buyerName || '');
        setDepartment(voucherToEdit.department || '');
        setReason(voucherToEdit.reason || '');
        setObservations(voucherToEdit.observations || '');
        setPaperBookRef(voucherToEdit.paperBookReference || '');
        setPaperSigned(!!voucherToEdit.paperSignatureCompleted);
        setItems(voucherToEdit.items || []);
        if (voucherToEdit.status === 'PREPARING') setStep(3);
        else if (voucherToEdit.status === 'READY') setStep(4);
        else setStep(1);
      } else {
        const nextNum = dataService.generateNextVoucherNumber();
        setVoucherNumber(nextNum);
        setWarehouseId('B1');
        const nowLocal = new Date();
        nowLocal.setMinutes(nowLocal.getMinutes() - nowLocal.getTimezoneOffset());
        setDate(nowLocal.toISOString().substring(0, 16));
        setBuyerName('');
        setDepartment('');
        setReason('');
        setObservations('');
        setPaperBookRef('');
        setPaperSigned(false);
        setItems([]);
        setStep(1);
      }
      setSelectedStockItem(null);
      setSearchQuery('');
      setGeneralError(null);
      setShowConfirmDialog(false);
    }
  }, [isOpen, voucherToEdit]);

  // Search available stock for Step 2
  useEffect(() => {
    if (step === 2) {
      const stock = dataService.getStock({ 
        warehouseId: warehouseId === 'ALL' ? undefined : warehouseId, 
        onlyAvailable: true 
      });
      if (!searchQuery.trim()) {
        setAvailableStockResults(stock.slice(0, 30));
      } else {
        const q = searchQuery.toLowerCase().trim();
        const filtered = stock.filter(s => 
          s.materialCode.toLowerCase().includes(q) ||
          s.materialName.toLowerCase().includes(q) ||
          (s.chineseName && s.chineseName.toLowerCase().includes(q)) ||
          (s.specification && s.specification.toLowerCase().includes(q)) ||
          s.binLocation.toLowerCase().includes(q)
        );
        setAvailableStockResults(filtered.slice(0, 30));
      }
    }
  }, [step, warehouseId, searchQuery]);

  if (!isOpen) return null;

  // Add selected stock item to items list
  const handleAddStockItem = () => {
    setItemPickerError(null);
    if (!selectedStockItem) {
      setItemPickerError('Veuillez sélectionner un article dans la liste.');
      return;
    }

    if (requestedQtyInput <= 0) {
      setItemPickerError('La quantité demandée doit être supérieure à 0.');
      return;
    }

    if (requestedQtyInput > selectedStockItem.availableQuantity) {
      setItemPickerError(`Quantité demandée (${requestedQtyInput}) supérieure au stock disponible (${selectedStockItem.availableQuantity}).`);
      return;
    }

    const alreadyExists = items.some(it => it.stockId === selectedStockItem.id);
    if (alreadyExists) {
      setItemPickerError(t.issue_item_already_added);
      return;
    }

    const newItem: IssueVoucherItem = {
      id: `VI-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      stockId: selectedStockItem.id,
      materialId: selectedStockItem.materialId,
      materialCode: selectedStockItem.materialCode,
      materialName: selectedStockItem.materialName,
      chineseName: selectedStockItem.chineseName,
      specification: selectedStockItem.specification,
      warehouseId: selectedStockItem.warehouseId,
      binLocation: selectedStockItem.binLocation,
      availableStock: selectedStockItem.availableQuantity,
      requestedQuantity: requestedQtyInput,
      issuedQuantity: requestedQtyInput,
      uom: selectedStockItem.uom,
      unitPrice: selectedStockItem.unitPrice,
      totalValue: requestedQtyInput * selectedStockItem.unitPrice
    };

    setItems([...items, newItem]);
    setSelectedStockItem(null);
    setRequestedQtyInput(1);
    setSearchQuery('');
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(it => it.id !== itemId));
  };

  const handleUpdateIssuedQty = (itemId: string, newQty: number) => {
    setItems(items.map(it => {
      if (it.id === itemId) {
        const validatedQty = Math.max(0, Math.min(newQty, it.availableStock));
        return {
          ...it,
          issuedQuantity: validatedQty,
          totalValue: validatedQty * it.unitPrice
        };
      }
      return it;
    }));
  };

  const handleNextFromStep1 = () => {
    setGeneralError(null);
    if (!buyerName.trim()) {
      setGeneralError("Le nom de l'acheteur ou du demandeur est obligatoire.");
      return;
    }
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    setGeneralError(null);
    if (items.length === 0) {
      setGeneralError(t.issue_no_items_error);
      return;
    }
    setStep(3);
  };

  const handleNextFromStep3 = () => {
    setGeneralError(null);
    const totalIssued = items.reduce((sum, it) => sum + (it.issuedQuantity || 0), 0);
    if (totalIssued <= 0) {
      setGeneralError("Au moins un article doit avoir une quantité sortie supérieure à 0.");
      return;
    }
    setStep(4);
  };

  const handleSaveAsDraftOrPreparing = (status: 'DRAFT' | 'PREPARING' | 'READY') => {
    setGeneralError(null);
    try {
      if (voucherToEdit && voucherToEdit.status !== 'CONFIRMED' && voucherToEdit.status !== 'CANCELLED') {
        const updated = dataService.updateIssueVoucher(voucherToEdit.id, {
          warehouseId,
          date: new Date(date).toISOString(),
          buyerName,
          department,
          reason,
          observations,
          paperBookReference: paperBookRef,
          paperSignatureCompleted: paperSigned,
          status,
          items
        }, currentUser);
        onSaved(updated);
      } else {
        const created = dataService.createIssueVoucher({
          voucherNumber,
          warehouseId,
          date: new Date(date).toISOString(),
          buyerName,
          department,
          agentId: currentUser.id,
          agentName: currentUser.name,
          reason,
          observations,
          paperBookReference: paperBookRef,
          paperSignatureCompleted: paperSigned,
          status,
          items
        }, currentUser);
        onSaved(created);
      }
      onClose();
    } catch (e: any) {
      setGeneralError(e.message || 'Erreur lors de la sauvegarde.');
    }
  };

  const handleConfirmIssue = () => {
    setGeneralError(null);
    if (!paperSigned) {
      setGeneralError(t.issue_paper_not_signed_warn);
      setShowConfirmDialog(false);
      return;
    }

    setIsSubmitting(true);
    try {
      let targetVoucherId: string;
      if (voucherToEdit && voucherToEdit.status !== 'CONFIRMED' && voucherToEdit.status !== 'CANCELLED') {
        dataService.updateIssueVoucher(voucherToEdit.id, {
          warehouseId,
          date: new Date(date).toISOString(),
          buyerName,
          department,
          reason,
          observations,
          paperBookReference: paperBookRef,
          paperSignatureCompleted: true,
          status: 'READY',
          items
        }, currentUser);
        targetVoucherId = voucherToEdit.id;
      } else {
        const created = dataService.createIssueVoucher({
          voucherNumber,
          warehouseId,
          date: new Date(date).toISOString(),
          buyerName,
          department,
          agentId: currentUser.id,
          agentName: currentUser.name,
          reason,
          observations,
          paperBookReference: paperBookRef,
          paperSignatureCompleted: true,
          status: 'READY',
          items
        }, currentUser);
        targetVoucherId = created.id;
      }

      const res = dataService.confirmIssueVoucher(targetVoucherId, currentUser, paperBookRef);
      if (!res.success || !res.voucher) {
        setGeneralError(res.error || 'Erreur de confirmation du bon de sortie.');
        setIsSubmitting(false);
        setShowConfirmDialog(false);
        return;
      }

      setIsSubmitting(false);
      setShowConfirmDialog(false);
      onSaved(res.voucher);
      onClose();
    } catch (e: any) {
      setGeneralError(e.message || 'Erreur imprévue lors de la confirmation.');
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  const totalRequestedQty = items.reduce((s, it) => s + (it.requestedQuantity || 0), 0);
  const totalIssuedQty = items.reduce((s, it) => s + (it.issuedQuantity || 0), 0);
  const totalValuationUSD = items.reduce((s, it) => s + ((it.issuedQuantity || 0) * it.unitPrice), 0);
  const hasDiscrepancy = items.some(it => it.issuedQuantity !== it.requestedQuantity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col my-auto text-zinc-900 dark:text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono font-bold text-sm">
              OUT
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {t.issues_title} — <span className="font-mono text-zinc-600 dark:text-zinc-400">{voucherNumber}</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t.issues_desc}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-4 border-b border-zinc-200 dark:border-zinc-800 text-xs font-mono">
          <button 
            type="button"
            onClick={() => setStep(1)}
            className={`py-2.5 px-3 flex items-center justify-center space-x-2 border-r border-zinc-200 dark:border-zinc-800 transition-colors ${
              step === 1 ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
            }`}
          >
            <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
            <span className="truncate">{t.issue_step_header}</span>
          </button>
          
          <button 
            type="button"
            onClick={() => { if (buyerName.trim()) setStep(2); }}
            disabled={!buyerName.trim()}
            className={`py-2.5 px-3 flex items-center justify-center space-x-2 border-r border-zinc-200 dark:border-zinc-800 transition-colors ${
              step === 2 ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
            <span className="truncate">{t.issue_step_materials}</span>
          </button>

          <button 
            type="button"
            onClick={() => { if (items.length > 0) setStep(3); }}
            disabled={items.length === 0}
            className={`py-2.5 px-3 flex items-center justify-center space-x-2 border-r border-zinc-200 dark:border-zinc-800 transition-colors ${
              step === 3 ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
            <span className="truncate">{t.issue_step_verification}</span>
          </button>

          <button 
            type="button"
            onClick={() => { if (items.length > 0) setStep(4); }}
            disabled={items.length === 0}
            className={`py-2.5 px-3 flex items-center justify-center space-x-2 transition-colors ${
              step === 4 ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">4</span>
            <span className="truncate">{t.issue_step_summary}</span>
          </button>
        </div>

        {/* Error notice */}
        {generalError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* STEP 1: General Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Voucher Number */}
                <div>
                  <label className="block text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    {t.issue_voucher_number}
                  </label>
                  <input
                    type="text"
                    value={voucherNumber}
                    disabled
                    className="w-full text-xs font-mono bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                  />
                </div>

                {/* Warehouse */}
                <div>
                  <label className="block text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    {t.warehouse_view} *
                  </label>
                  <select
                    value={warehouseId}
                    onChange={e => {
                      const newW = e.target.value;
                      setWarehouseId(newW);
                      if (items.length > 0 && newW !== warehouseId) {
                        if (confirm("Changer de magasin réinitialisera les articles sélectionnés. Continuer ?")) {
                          setItems([]);
                        }
                      }
                    }}
                    className="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
                  >
                    <option value="ALL">Tous les magasins / Emplacements consolidés</option>
                    <option value="B1">{t.b1_warehouse} — Pièces détachées MD01</option>
                    <option value="B2">{t.b2_warehouse} — Consommables Allées A-E</option>
                    <option value="CONT-01">Container 01 — Brides & Outillage</option>
                    <option value="CONT-02">Container 02 — Raccords & Vannes</option>
                    <option value="YARD">Yard Extérieur — Gros gabarits & Tuyaux</option>
                  </select>
                </div>

                {/* Date & Time */}
                <div>
                  <label className="block text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    {t.col_date} *
                  </label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Buyer / Requester */}
                <div>
                  <label className="block text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    {t.issue_buyer_name} *
                  </label>
                  <AutocompleteInput
                    field="requester"
                    value={buyerName}
                    onChange={setBuyerName}
                    placeholder="ex: Jean-Pierre Kalala, Michel Mwamba..."
                    required
                    inputClassName="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Personne physique venant récupérer les matériels au comptoir.
                  </span>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    {t.destination_dept}
                  </label>
                  <AutocompleteInput
                    field="department"
                    value={department}
                    onChange={setDepartment}
                    placeholder={t.dept_placeholder || "ex: Maintenance Mécanique, Tuyauterie..."}
                    inputClassName="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Agent Warehouse (Clerk) */}
                <div>
                  <label className="block text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    {t.issue_agent_name}
                  </label>
                  <input
                    type="text"
                    value={currentUser.name}
                    disabled
                    className="w-full text-xs font-mono bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    {t.issue_reason}
                  </label>
                  <AutocompleteInput
                    field="reason"
                    value={reason}
                    onChange={setReason}
                    placeholder={t.reason_placeholder || "ex: Révision pompe P-102, Arrêt d'usine..."}
                    inputClassName="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
                  />
                </div>
              </div>

              {/* Observations */}
              <div>
                <label className="block text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  {t.remarks} {t.field_optional}
                </label>
                <textarea
                  rows={2}
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  placeholder="Remarques éventuelles sur la demande, conditions de transport ou consignes..."
                  className="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Material Selection */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Item Picker Section */}
              <div className="border border-zinc-300 dark:border-zinc-700 p-4 bg-zinc-50 dark:bg-zinc-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center space-x-2">
                    <Search className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Rechercher un matériel disponible dans le magasin {warehouseId}</span>
                  </h3>
                  <span className="text-[11px] font-mono text-zinc-500">
                    Stock actif uniquement
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Search query input */}
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Code matériel (ex: 4069...), désignation, spécification ou emplacement..."
                      className="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
                    />
                  </div>

                  {/* Quantity requested input */}
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-mono text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                      Qté :
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={selectedStockItem ? selectedStockItem.availableQuantity : 99999}
                      value={requestedQtyInput}
                      onChange={e => setRequestedQtyInput(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-xs font-mono text-center bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddStockItem}
                      disabled={!selectedStockItem}
                      className="flex-1 text-xs font-bold font-mono py-2 px-3 bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.btn_add_material_to_issue}</span>
                    </button>
                  </div>
                </div>

                {itemPickerError && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{itemPickerError}</span>
                  </p>
                )}

                {/* Stock Search Results Dropdown/List */}
                <div className="max-h-48 overflow-y-auto border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-700/40 text-xs">
                  {availableStockResults.length === 0 ? (
                    <div className="p-3 text-center text-zinc-500 font-mono text-xs">
                      Aucun article disponible trouvé pour cette recherche dans {warehouseId}.
                    </div>
                  ) : (
                    availableStockResults.map(item => {
                      const isSelected = selectedStockItem?.id === item.id;
                      const isAlreadyAdded = items.some(it => it.stockId === item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (!isAlreadyAdded) {
                              setSelectedStockItem(item);
                              setItemPickerError(null);
                            }
                          }}
                          className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium' 
                              : isAlreadyAdded 
                                ? 'opacity-40 bg-zinc-50 dark:bg-zinc-800/40 cursor-not-allowed' 
                                : 'hover:bg-zinc-100 dark:hover:bg-zinc-700/60'
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold">{item.materialCode}</span>
                              <span className="truncate">{item.materialName}</span>
                              {item.chineseName && (
                                <span className="text-[11px] opacity-75 truncate">({item.chineseName})</span>
                              )}
                            </div>
                            <div className="text-[11px] opacity-80 flex items-center space-x-3 mt-0.5">
                              <span>Empl: <span className="font-mono">{item.binLocation}</span></span>
                              {item.specification && <span>Spéc: {item.specification}</span>}
                              <span>P.U: ${item.unitPrice.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="text-right whitespace-nowrap">
                            <span className={`px-2 py-0.5 text-[11px] font-mono font-bold ${
                              isSelected ? 'bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                            }`}>
                              Dispo: {item.availableQuantity} {item.uom}
                            </span>
                            {isAlreadyAdded && (
                              <span className="block text-[10px] text-zinc-500 mt-0.5">Déjà ajouté</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Selected Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                    Articles sélectionnés pour cette sortie ({items.length})
                  </h3>
                  <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                    Total demandé : <strong className="text-zinc-900 dark:text-zinc-100">{totalRequestedQty} unités</strong>
                  </span>
                </div>

                {items.length === 0 ? (
                  <div className="border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center text-zinc-500 text-xs">
                    <Package className="w-8 h-8 mx-auto mb-2 text-zinc-400 opacity-50" />
                    Aucun article ajouté pour le moment. Utilisez la recherche ci-dessus pour ajouter des matériels au bon de sortie.
                  </div>
                ) : (
                  <div className="border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 font-mono text-[11px] uppercase border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                          <th className="py-2.5 px-3">Code</th>
                          <th className="py-2.5 px-3">Désignation</th>
                          <th className="py-2.5 px-3">Emplacement</th>
                          <th className="py-2.5 px-3 text-right">Dispo</th>
                          <th className="py-2.5 px-3 text-right">Qté demandée</th>
                          <th className="py-2.5 px-3 text-right">P.U ($)</th>
                          <th className="py-2.5 px-3 text-right">Total ($)</th>
                          <th className="py-2.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {items.map(it => (
                          <tr key={it.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                            <td className="py-2.5 px-3 font-mono font-bold">{it.materialCode}</td>
                            <td className="py-2.5 px-3">
                              <div className="font-medium text-zinc-900 dark:text-zinc-100">{it.materialName}</div>
                              {it.specification && (
                                <div className="text-[11px] text-zinc-500">{it.specification}</div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-mono">{it.binLocation}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-zinc-600 dark:text-zinc-400">{it.availableStock}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">{it.requestedQuantity}</td>
                            <td className="py-2.5 px-3 text-right font-mono">${it.unitPrice.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">${(it.requestedQuantity * it.unitPrice).toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(it.id)}
                                className="p-1 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Physical Verification */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-zinc-600 dark:text-zinc-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{t.issue_physical_verify_step}</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {t.issue_physical_verify_desc}
                  </p>
                </div>
              </div>

              <div className="border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 font-mono text-[11px] uppercase border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="py-2.5 px-3">Article</th>
                      <th className="py-2.5 px-3">Emplacement physique</th>
                      <th className="py-2.5 px-3 text-right">Stock dispo</th>
                      <th className="py-2.5 px-3 text-right">Qté demandée</th>
                      <th className="py-2.5 px-3 text-center w-36">Qté réellement sortie *</th>
                      <th className="py-2.5 px-3 text-right">Écart</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {items.map(it => {
                      const diff = it.issuedQuantity - it.requestedQuantity;
                      const hasItemDiff = diff !== 0;
                      return (
                        <tr key={it.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="py-2.5 px-3">
                            <span className="font-mono font-bold block">{it.materialCode}</span>
                            <span className="text-zinc-800 dark:text-zinc-200">{it.materialName}</span>
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold">
                              {it.binLocation}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-zinc-600 dark:text-zinc-400">
                            {it.availableStock} {it.uom}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-medium">
                            {it.requestedQuantity}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              min={0}
                              max={it.availableStock}
                              value={it.issuedQuantity}
                              onChange={e => handleUpdateIssuedQty(it.id, parseInt(e.target.value) || 0)}
                              className="w-24 text-xs font-mono font-bold text-center bg-white dark:bg-zinc-900 border border-zinc-400 dark:border-zinc-600 py-1.5 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-[11px]">
                            {hasItemDiff ? (
                              <span className="text-zinc-900 dark:text-zinc-100 font-bold">
                                {diff > 0 ? `+${diff}` : diff}
                              </span>
                            ) : (
                              <span className="text-zinc-400">0 (Conforme)</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {hasDiscrepancy && (
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-zinc-600 dark:text-zinc-400 flex-shrink-0" />
                  <span>{t.issue_diff_warning}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Summary & Paper Signature */}
          {step === 4 && (
            <div className="space-y-5">
              {/* Header Recap */}
              <div className="border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-900/60 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <span className="text-zinc-500 block text-[10px]">{t.issue_voucher_number}</span>
                  <span className="font-bold">{voucherNumber}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">{t.issue_buyer_name}</span>
                  <span className="font-bold truncate block">{buyerName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">{t.warehouse_view}</span>
                  <span className="font-bold">{warehouseId}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">{t.issue_agent_name}</span>
                  <span className="font-bold">{currentUser.name}</span>
                </div>
              </div>

              {/* Items Summary Table */}
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-2">
                  {t.issue_summary_title}
                </h4>
                <div className="border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 font-mono text-[11px] uppercase border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="py-2 px-3">Code</th>
                        <th className="py-2 px-3">Désignation</th>
                        <th className="py-2 px-3">Emplacement</th>
                        <th className="py-2 px-3 text-right">Demandé</th>
                        <th className="py-2 px-3 text-right">Sorti réel</th>
                        <th className="py-2 px-3 text-right">Total ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                      {items.map(it => (
                        <tr key={it.id}>
                          <td className="py-2 px-3 font-bold">{it.materialCode}</td>
                          <td className="py-2 px-3 font-sans">{it.materialName}</td>
                          <td className="py-2 px-3">{it.binLocation}</td>
                          <td className="py-2 px-3 text-right">{it.requestedQuantity}</td>
                          <td className="py-2 px-3 text-right font-bold text-zinc-900 dark:text-zinc-100">{it.issuedQuantity}</td>
                          <td className="py-2 px-3 text-right">${(it.issuedQuantity * it.unitPrice).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-zinc-100 dark:bg-zinc-800/80 border-t border-zinc-200 dark:border-zinc-800 font-mono font-bold text-xs">
                      <tr>
                        <td colSpan={3} className="py-2 px-3 text-right">TOTAUX :</td>
                        <td className="py-2 px-3 text-right">{totalRequestedQty}</td>
                        <td className="py-2 px-3 text-right text-zinc-900 dark:text-zinc-100">{totalIssuedQty}</td>
                        <td className="py-2 px-3 text-right">${totalValuationUSD.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Paper Logbook Certification Card */}
              <div className="border border-zinc-300 dark:border-zinc-700 p-4 bg-white dark:bg-zinc-800/80 space-y-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                    Attestation de Signature Papier
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Paper Book Reference Input */}
                  <div>
                    <label className="block text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                      {t.issue_paper_book_ref}
                    </label>
                    <input
                      type="text"
                      value={paperBookRef}
                      onChange={e => setPaperBookRef(e.target.value)}
                      placeholder={t.issue_paper_book_ref_placeholder}
                      className="w-full text-xs font-mono bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100"
                    />
                  </div>

                  {/* Mandatory Checkbox */}
                  <div className="flex items-center pt-5">
                    <label className="flex items-center space-x-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={paperSigned}
                        onChange={e => setPaperSigned(e.target.checked)}
                        className="w-4 h-4 rounded-none border border-zinc-400 text-zinc-900 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {t.issue_paper_book_signature} ☑
                      </span>
                    </label>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
                  Note : L'acheteur signe physiquement dans le carnet papier au magasin. La case ci-dessus certifie la signature physique pour enregistrement dans l'application.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="px-3 py-2 text-xs font-mono border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center space-x-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Précédent</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Save as Draft or Preparing (available on steps 2-4) */}
            {step >= 2 && (
              <button
                type="button"
                onClick={() => handleSaveAsDraftOrPreparing('PREPARING')}
                className="px-3 py-2 text-xs font-mono border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center space-x-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer en cours</span>
              </button>
            )}

            {/* Next or Confirm */}
            {step === 1 && (
              <button
                type="button"
                onClick={handleNextFromStep1}
                className="px-4 py-2 text-xs font-mono font-bold bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 transition-colors flex items-center space-x-1"
              >
                <span>Suivant : Sélection matériels</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={handleNextFromStep2}
                disabled={items.length === 0}
                className="px-4 py-2 text-xs font-mono font-bold bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <span>Suivant : Vérification physique</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleNextFromStep3}
                className="px-4 py-2 text-xs font-mono font-bold bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 transition-colors flex items-center space-x-1"
              >
                <span>Suivant : Récapitulatif & Signature</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                onClick={() => {
                  if (!paperSigned) {
                    setGeneralError(t.issue_paper_not_signed_warn);
                    return;
                  }
                  setShowConfirmDialog(true);
                }}
                className="px-5 py-2 text-xs font-mono font-bold bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 transition-colors flex items-center space-x-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>{t.issue_confirm_btn}</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Safety Confirmation Modal */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 max-w-md w-full p-6 text-zinc-900 dark:text-zinc-100 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-tight">
                {t.issue_confirm_dialog_title}
              </h3>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t.issue_confirm_dialog_msg}
            </p>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-500">Bon :</span>
                <span className="font-bold">{voucherNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Acheteur :</span>
                <span>{buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Articles :</span>
                <span>{items.length} références ({totalIssuedQty} unités)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Carnet :</span>
                <span>{paperBookRef || 'Attesté'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-mono border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmIssue}
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-mono font-bold bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 transition-colors"
              >
                {isSubmitting ? 'Traitement...' : 'Confirmer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
