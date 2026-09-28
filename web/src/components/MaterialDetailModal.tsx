import React, { useState, useEffect, useRef } from 'react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import { Material, StockItem, StockMovement } from '@shared/types/models';
import { 
  X, 
  Package, 
  MapPin, 
  History, 
  Camera, 
  UploadCloud, 
  Trash2, 
  Image as ImageIcon,
  QrCode,
  Pencil,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  RefreshCw,
  Check,
  AlertCircle,
  Save,
  CheckCircle2
} from 'lucide-react';

interface MaterialDetailModalProps {
  materialId: string | null;
  onClose: () => void;
  onQuickReceipt?: (item: StockItem) => void;
  onQuickIssue?: (item: StockItem) => void;
  onQuickTransfer?: (item: StockItem) => void;
  onOpenLabelModal?: (item: StockItem) => void;
}

const SECURITY_WORDS = [
  'CONFIRMER', 'SECURITE', 'INVENTAIRE', 'MODIFIER', 
  'CONTROLE', 'VALIDATION', 'CONFORMITE', 'APPROBATION', 
  'PROTECTION', 'VERIFICATION', 'EQUIPEMENT', 'MATERIEL',
  'REGULATION', 'MAINTENANCE', 'PIECES', 'STOCK-OK'
];

function generateSecurityWord(): string {
  const word = SECURITY_WORDS[Math.floor(Math.random() * SECURITY_WORDS.length)];
  const num = Math.floor(100 + Math.random() * 900); // 3-digit random code
  return `${word}-${num}`;
}

export const MaterialDetailModal: React.FC<MaterialDetailModalProps> = ({
  materialId,
  onClose,
  onQuickReceipt,
  onQuickIssue,
  onQuickTransfer,
  onOpenLabelModal,
}) => {
  const { t, currentUser, canOperateStock } = useAuth();
  const [material, setMaterial] = useState<Material | null>(null);
  const [stockRecords, setStockRecords] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    materialCode: '',
    name: '',
    chineseName: '',
    specification: '',
    uom: 'EA',
    category: '',
    standardPrice: '',
    currency: 'USD',
    plant: '3458',
    valuationType: '',
    manufacturer: '',
    supplier: '',
    description: '',
    requiresMaterialCodeReview: false
  });

  // Random Security Word verification state
  const [randomSecurityWord, setRandomSecurityWord] = useState('');
  const [inputSecurityWord, setInputSecurityWord] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!materialId) return;

    const load = () => {
      const mat = dataService.getMaterial(materialId);
      setMaterial(mat ? { ...mat } : null);

      const stocks = dataService.getStockByMaterial(materialId);
      setStockRecords(stocks);

      const movs = dataService.getStockMovements({ materialId, limit: 50 });
      setMovements(movs);
    };

    load();
    const unsubscribe = dataService.subscribe(load);
    return () => unsubscribe();
  }, [materialId]);

  if (!materialId || !material) return null;

  const totalQuantity = stockRecords.reduce((acc, s) => acc + s.quantity, 0);
  const totalValuation = stockRecords.reduce((acc, s) => acc + s.totalValue, 0);

  // Group stock records by site/warehouseId
  const locationsGrouped = stockRecords.reduce((acc, item) => {
    const locKey = item.warehouseId || 'N/A';
    if (!acc[locKey]) acc[locKey] = [];
    acc[locKey].push(item);
    return acc;
  }, {} as Record<string, StockItem[]>);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      dataService.updateMaterialImage(material.id, dataUrl);
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    dataService.updateMaterialImage(material.id, '');
  };

  // Start Edit Mode
  const handleStartEdit = () => {
    setEditForm({
      materialCode: material.materialCode || '',
      name: material.name || '',
      chineseName: material.chineseName || '',
      specification: material.specification || '',
      uom: material.uom || 'EA',
      category: material.category || '',
      standardPrice: material.standardPrice !== undefined ? String(material.standardPrice) : '',
      currency: material.currency || 'USD',
      plant: material.plant || '3458',
      valuationType: material.valuationType || '',
      manufacturer: material.manufacturer || '',
      supplier: material.supplier || '',
      description: material.description || '',
      requiresMaterialCodeReview: !!material.requiresMaterialCodeReview
    });
    setRandomSecurityWord(generateSecurityWord());
    setInputSecurityWord('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrorMsg(null);
  };

  const handleRegenerateWord = () => {
    setRandomSecurityWord(generateSecurityWord());
    setInputSecurityWord('');
  };

  const isSecurityWordValid = inputSecurityWord.trim().toUpperCase() === randomSecurityWord.trim().toUpperCase();

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isSecurityWordValid) {
      setErrorMsg(`Saisie incorrecte : veuillez recopier exactement le mot de sécurité : ${randomSecurityWord}`);
      return;
    }

    if (!editForm.materialCode.trim()) {
      setErrorMsg('Le code matériel est obligatoire.');
      return;
    }

    if (!editForm.name.trim()) {
      setErrorMsg('La désignation principale (nom) est obligatoire.');
      return;
    }

    const priceNum = editForm.standardPrice === '' ? 0 : Number(editForm.standardPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setErrorMsg('Le prix unitaire doit être un nombre positif valide.');
      return;
    }

    try {
      const updated = dataService.updateMaterial({
        materialId: material.id,
        updates: {
          materialCode: editForm.materialCode.trim(),
          name: editForm.name.trim(),
          chineseName: editForm.chineseName.trim() || undefined,
          specification: editForm.specification.trim() || undefined,
          uom: editForm.uom.trim().toUpperCase() || 'EA',
          category: editForm.category.trim() || undefined,
          standardPrice: priceNum,
          currency: editForm.currency.trim() || 'USD',
          plant: editForm.plant.trim() || '3458',
          valuationType: editForm.valuationType.trim() || undefined,
          manufacturer: editForm.manufacturer.trim() || undefined,
          supplier: editForm.supplier.trim() || undefined,
          description: editForm.description.trim() || undefined,
          requiresMaterialCodeReview: editForm.requiresMaterialCodeReview
        },
        user: currentUser
      });

      setMaterial(updated);
      setIsEditing(false);
      setSuccessMsg('Fiche matériel mise à jour avec succès et répercutée sur le stock !');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de l\'enregistrement des modifications.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border border-zinc-300 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-zinc-200 flex items-start justify-between bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-zinc-100 text-zinc-900 border border-zinc-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
              {material.imageUrl ? (
                <img src={material.imageUrl} alt={material.materialCode} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-5 h-5 text-zinc-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-lg text-zinc-900">{material.materialCode}</span>
                {material.chineseName && (
                  <span className="text-xs font-medium text-zinc-700 bg-zinc-200 px-2 py-0.5 rounded-md">
                    {material.chineseName}
                  </span>
                )}
                {material.requiresMaterialCodeReview && (
                  <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-300 px-2 py-0.5 rounded font-medium">
                    {t.requires_code_review}
                  </span>
                )}
                {isEditing && (
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-300 flex items-center gap-1">
                    <Pencil className="w-3 h-3" />
                    <span>Mode Édition</span>
                  </span>
                )}
              </div>
              <h3 className="text-xs text-zinc-500 mt-0.5 font-medium line-clamp-1">{material.name}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && canOperateStock && (
              <button
                type="button"
                onClick={handleStartEdit}
                className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                title="Modifier toutes les informations du matériel"
              >
                <Pencil className="w-3.5 h-3.5 text-lime" />
                <span>Modifier la fiche</span>
              </button>
            )}

            {!isEditing && onOpenLabelModal && stockRecords.length > 0 && (
              <button
                type="button"
                onClick={() => onOpenLabelModal(stockRecords[0])}
                className="px-2.5 py-1.5 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs hidden sm:inline-flex"
                title={t.btn_print_label}
              >
                <QrCode className="w-3.5 h-3.5 text-zinc-700" />
                <span>{t.btn_print_label}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full transition-colors cursor-pointer"
              title={t.btn_close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-300 text-red-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Modal Body: Switch between View Mode and Edit Mode */}
        {isEditing ? (
          /* ========================================================================= */
          /* EDIT MODE FORM (WITH MANDATORY RANDOM SECURITY WORD VERIFICATION)        */
          /* ========================================================================= */
          <form onSubmit={handleSaveEdit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3">
              <Pencil className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block">Modification des données maîtres de l'article</span>
                <p className="text-blue-700 mt-0.5 leading-relaxed">
                  Vous modifiez directement la fiche signalétique de cet article. Les modifications apportées (code, nom, spécification, unité et prix standard) seront automatiquement synchronisées sur l'ensemble des casiers de stock associés et enregistrées dans le journal d'audit immuable.
                </p>
              </div>
            </div>

            {/* Editable Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-zinc-50/60 p-4 rounded-3xl border border-zinc-200/90">
              {/* Code Matériel */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Code Matériel (SAP / Référence) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.materialCode}
                  onChange={(e) => setEditForm(prev => ({ ...prev, materialCode: e.target.value.toUpperCase() }))}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 uppercase"
                />
              </div>

              {/* Désignation principale (Nom) */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Désignation Principale (Nom Anglais / Standard) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />
              </div>

              {/* Nom en Chinois */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Nom en Chinois (Chinese Name)
                </label>
                <input
                  type="text"
                  value={editForm.chineseName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, chineseName: e.target.value }))}
                  placeholder="Ex: 安全阀, 球阀..."
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />
              </div>

              {/* Spécification technique */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Spécification / Modèle technique
                </label>
                <input
                  type="text"
                  value={editForm.specification}
                  onChange={(e) => setEditForm(prev => ({ ...prev, specification: e.target.value }))}
                  placeholder="Ex: DN50 PN16, 220V 50Hz..."
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />
              </div>

              {/* Unité de mesure (UOM) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Unité de Mesure (UOM) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.uom}
                  onChange={(e) => setEditForm(prev => ({ ...prev, uom: e.target.value.toUpperCase() }))}
                  placeholder="EA, SET, M, KG, BOX, ROL..."
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 uppercase"
                />
              </div>

              {/* Prix Unitaire Standard */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Prix Unitaire Standard ($ USD)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={editForm.standardPrice}
                  onChange={(e) => setEditForm(prev => ({ ...prev, standardPrice: e.target.value }))}
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Catégorie Industrielle
                </label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value.toUpperCase() }))}
                  placeholder="VALVE, PUMP, BEARING, ELECTRICAL..."
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 uppercase"
                />
              </div>

              {/* Division / Usine (Plant) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Division / Usine (Plant)
                </label>
                <input
                  type="text"
                  value={editForm.plant}
                  onChange={(e) => setEditForm(prev => ({ ...prev, plant: e.target.value }))}
                  placeholder="3458"
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />
              </div>

              {/* Fabricant */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Fabricant (Manufacturer)
                </label>
                <input
                  type="text"
                  value={editForm.manufacturer}
                  onChange={(e) => setEditForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                  placeholder="SKF, Siemens, Schneider..."
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />
              </div>

              {/* Fournisseur */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Fournisseur (Supplier)
                </label>
                <input
                  type="text"
                  value={editForm.supplier}
                  onChange={(e) => setEditForm(prev => ({ ...prev, supplier: e.target.value }))}
                  placeholder="Nom du fournisseur habituel..."
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />
              </div>

              {/* Type de valorisation */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Type de Valorisation
                </label>
                <input
                  type="text"
                  value={editForm.valuationType}
                  onChange={(e) => setEditForm(prev => ({ ...prev, valuationType: e.target.value }))}
                  placeholder="STANDARD, FIFO, AVERAGE..."
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                />
              </div>

              {/* Description détaillée */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Description technique complémentaire
                </label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Notes techniques, références croisées ou instructions particulières..."
                  className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 resize-none"
                />
              </div>

              {/* Flag Révision requise */}
              <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="requiresReview"
                  checked={editForm.requiresMaterialCodeReview}
                  onChange={(e) => setEditForm(prev => ({ ...prev, requiresMaterialCodeReview: e.target.checked }))}
                  className="w-4 h-4 rounded text-zinc-950 focus:ring-zinc-950 border-zinc-300 cursor-pointer"
                />
                <label htmlFor="requiresReview" className="text-xs font-semibold text-zinc-800 cursor-pointer select-none">
                  Marquer comme « Code temporaire nécessitant une révision »
                </label>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* MANDATORY RANDOM SECURITY WORD CHALLENGE SECTION                          */}
            {/* ========================================================================= */}
            <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
              isSecurityWordValid
                ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/50 shadow-sm'
                : 'bg-amber-50/70 border-amber-300 shadow-sm'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {isSecurityWordValid ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900">
                      Contrôle de sécurité obligatoire
                    </h4>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      Pour enregistrer les modifications de cette fiche matériel, recopiez exactement le mot de sécurité aléatoire généré :
                    </p>
                  </div>
                </div>

                {/* Regenerate Word button */}
                <button
                  type="button"
                  onClick={handleRegenerateWord}
                  className="px-2.5 py-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs active:scale-95 cursor-pointer"
                  title="Générer un autre mot aléatoire"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Changer de mot</span>
                </button>
              </div>

              {/* The Random Security Word Box */}
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center justify-center px-4 py-2.5 bg-zinc-950 text-lime rounded-2xl border border-zinc-800 shadow-inner shrink-0 select-all">
                  <span className="font-mono font-black text-sm sm:text-base tracking-widest">
                    {randomSecurityWord}
                  </span>
                </div>

                {/* User Input field */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    required
                    value={inputSecurityWord}
                    onChange={(e) => setInputSecurityWord(e.target.value.trim().toUpperCase())}
                    placeholder="Recopiez le mot ici (ex: SECURITE-123)..."
                    className={`w-full bg-white border px-3.5 py-2.5 rounded-2xl font-mono text-xs sm:text-sm font-bold focus:outline-none uppercase transition-all ${
                      isSecurityWordValid
                        ? 'border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/40 bg-emerald-50/30'
                        : inputSecurityWord.length > 0
                        ? 'border-amber-400 text-zinc-900 bg-white'
                        : 'border-zinc-300 text-zinc-900 focus:border-zinc-900'
                    }`}
                  />
                  {isSecurityWordValid && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-xs flex items-center gap-1">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span className="hidden sm:inline">Vérifié !</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Feedback text */}
              <div className="mt-2 text-[11px] font-mono">
                {isSecurityWordValid ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    ✓ Déverrouillage réussi : vous pouvez maintenant enregistrer la fiche.
                  </span>
                ) : inputSecurityWord.length > 0 ? (
                  <span className="text-amber-800 font-medium">
                    ⚠️ Saisie actuelle : « {inputSecurityWord} » (attendu : « {randomSecurityWord} »)
                  </span>
                ) : (
                  <span className="text-zinc-500">
                    🔒 Bouton d'enregistrement verrouillé tant que le mot n'est pas saisi.
                  </span>
                )}
              </div>
            </div>

            {/* Edit Mode Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={!isSecurityWordValid}
                className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-lime font-black text-xs sm:text-sm rounded-2xl flex items-center gap-2 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
              >
                {isSecurityWordValid ? (
                  <Save className="w-4 h-4 text-lime" />
                ) : (
                  <Lock className="w-4 h-4 text-zinc-400" />
                )}
                <span>Enregistrer les modifications</span>
              </button>
            </div>
          </form>
        ) : (
          /* ========================================================================= */
          /* VIEW MODE (STANDARD CARD & LOCATIONS)                                    */
          /* ========================================================================= */
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
            {/* Material Photo & Quick Details */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-4 flex flex-col sm:flex-row gap-5 items-center">
              {/* Photo Preview */}
              <div className="w-32 h-32 rounded-2xl bg-white border border-zinc-300 flex items-center justify-center overflow-hidden relative group shrink-0 shadow-xs">
                {material.imageUrl ? (
                  <>
                    <img src={material.imageUrl} alt={material.materialCode} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 cursor-pointer"
                        title={t.btn_change_photo}
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleRemoveImage}
                        className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                        title={t.btn_remove_photo}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center text-zinc-400 hover:text-zinc-600 cursor-pointer p-3 text-center"
                  >
                    <Camera className="w-7 h-7 mb-1" />
                    <span className="text-[10px] font-medium">{t.btn_upload_photo}</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </div>

              {/* Photo description & specs */}
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-zinc-600" />
                    <span>{t.photo_manager_title}</span>
                  </span>
                  {material.imageUrl ? (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-mono font-bold">
                      ✓ {t.photo_attached_badge}
                    </span>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] text-zinc-900 font-bold underline flex items-center gap-1 cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{t.btn_upload_photo} (JPG, PNG, WebP)</span>
                    </button>
                  )}
                </div>
                <p className="text-zinc-500 text-[11px] leading-relaxed">
                  {t.photo_manager_desc}
                </p>
                {material.imageUrl && (
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 bg-white hover:bg-zinc-50 text-zinc-700 rounded-xl text-[11px] font-bold border border-zinc-300 shadow-2xs cursor-pointer"
                    >
                      {t.btn_change_photo}
                    </button>
                    <button
                      onClick={handleRemoveImage}
                      className="px-2.5 py-1 bg-white hover:bg-red-50 text-red-600 rounded-xl text-[11px] font-bold border border-red-200 shadow-2xs cursor-pointer"
                    >
                      {t.btn_remove_photo}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* General Specs and Pricing Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs">
              <div>
                <span className="text-[10px] text-zinc-400 block font-bold uppercase font-mono">{t.mat_specs}</span>
                <span className="text-xs font-bold text-zinc-900 font-mono mt-0.5 block truncate">
                  {material.specification || '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block font-bold uppercase font-mono">{t.mat_uom}</span>
                <span className="text-xs font-black text-zinc-900 font-mono mt-0.5 block">
                  {material.uom}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block font-bold uppercase font-mono">{t.mat_price}</span>
                <span className="text-xs font-black text-zinc-900 font-mono mt-0.5 block text-emerald-700">
                  ${(material.standardPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {material.currency}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block font-bold uppercase font-mono">{t.mat_plant}</span>
                <span className="text-xs font-bold text-zinc-700 font-mono mt-0.5 block">
                  {material.plant || '3458'} {material.valuationType ? `(${material.valuationType})` : ''}
                </span>
              </div>
            </div>

            {/* Material Details (Manufacturer, Supplier, Category) */}
            {(material.manufacturer || material.supplier || material.category || material.description) && (
              <div className="bg-zinc-50/70 p-4 rounded-3xl border border-zinc-200/80 text-xs space-y-1.5">
                <div className="flex flex-wrap items-center gap-4 text-zinc-600">
                  {material.category && (
                    <span><strong className="text-zinc-900">Catégorie :</strong> {material.category}</span>
                  )}
                  {material.manufacturer && (
                    <span><strong className="text-zinc-900">Fabricant :</strong> {material.manufacturer}</span>
                  )}
                  {material.supplier && (
                    <span><strong className="text-zinc-900">Fournisseur :</strong> {material.supplier}</span>
                  )}
                </div>
                {material.description && (
                  <p className="text-zinc-500 pt-1 border-t border-zinc-200/60 leading-relaxed text-[11px]">
                    {material.description}
                  </p>
                )}
              </div>
            )}

            {/* Aggregate Stock Overview */}
            <div className="flex items-center justify-between bg-zinc-950 text-white p-4 rounded-3xl shadow-sm">
              <div>
                <span className="text-xs text-zinc-400 font-medium">{t.mat_total_stock} :</span>
                <div className="text-xl sm:text-2xl font-black font-mono text-lime mt-0.5">
                  {totalQuantity.toLocaleString()} {material.uom}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400 font-medium">{t.mat_total_value} :</span>
                <div className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
                  ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Storage Locations (Dynamic across B1, B2, Containers, Yard, etc.) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-zinc-600" />
                <span>{t.referenced_stock_locations_title} ({stockRecords.length})</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.keys(locationsGrouped).map((locCode) => {
                  const records = locationsGrouped[locCode];
                  const locTotalQty = records.reduce((acc, s) => acc + s.quantity, 0);

                  return (
                    <div key={locCode} className="bg-white border border-zinc-200/90 rounded-2xl p-3.5 shadow-2xs">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-zinc-100 border border-zinc-300 rounded-md text-zinc-900">
                            {locCode}
                          </span>
                          <span className="text-xs text-zinc-600 font-medium">
                            {records.length} {t.count_locations_suffix}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-black text-zinc-900">
                          {locTotalQty.toLocaleString()} {material.uom}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {records.map((s) => {
                          const parts = dataService.getLocationParts(s);
                          return (
                            <div key={s.id} className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 text-xs">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-1">
                                  {parts.length > 0 ? (
                                     parts.map((p, idx) => (
                                      <span key={idx} className="inline-flex items-center px-1.5 py-0.5 bg-white border border-zinc-300 rounded text-[10px] font-mono">
                                        <span className="text-zinc-400 mr-1">{p.label}:</span>
                                        <span className="font-bold text-zinc-900">{p.value}</span>
                                      </span>
                                    ))
                                  ) : (
                                    <span className="font-mono font-bold text-zinc-900">{s.binLocation}</span>
                                  )}
                                  {s.locationNotes && (
                                    <span className="text-[10px] text-zinc-500 italic block w-full mt-0.5">
                                      {s.locationNotes}
                                    </span>
                                  )}
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-mono font-bold text-zinc-900 text-sm block">
                                    {s.quantity} {s.uom}
                                  </span>
                                  <span className="text-[10px] text-zinc-500 font-mono">
                                    ${s.totalValue.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {stockRecords.length === 0 && (
                  <div className="col-span-2 text-center py-6 text-zinc-400 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-xs">
                    {t.no_stock_recorded_item}
                  </div>
                )}
              </div>
            </div>

            {/* Movement History for this Material */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-2">
                <History className="w-4 h-4 text-zinc-600" />
                <span>{t.tab_history} ({movements.length})</span>
              </h4>

              <div className="bg-white border border-zinc-200/90 rounded-2xl overflow-hidden max-h-56 overflow-y-auto shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 font-mono text-[11px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">{t.col_timestamp}</th>
                      <th className="py-2.5 px-3">{t.col_action_type}</th>
                      <th className="py-2.5 px-3">{t.col_warehouse} & {t.col_bin}</th>
                      <th className="py-2.5 px-3 text-right">{t.col_qty}</th>
                      <th className="py-2.5 px-3">{t.col_ref_reason}</th>
                      <th className="py-2.5 px-3">{t.col_user}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {movements.map((m) => {
                      const isPlus = m.movementType === 'RECEIPT' || m.movementType === 'TRANSFER_IN' || m.movementType === 'INITIAL_IMPORT';
                      return (
                        <tr key={m.id} className="hover:bg-zinc-50">
                          <td className="py-2 px-3 text-zinc-500 font-mono text-[11px]">
                            {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2 px-3">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 border border-zinc-300 text-zinc-800">
                              {m.movementType}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono">
                            <span className="font-bold text-zinc-900">{m.warehouseId}</span> ({m.binLocation})
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold">
                            <span className={isPlus ? 'text-emerald-700' : 'text-zinc-800'}>
                              {isPlus ? '+' : '-'}{m.quantity}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-zinc-600 max-w-[180px] truncate">
                            {m.referenceNumber || m.reason || '—'}
                          </td>
                          <td className="py-2 px-3 text-zinc-600">
                            {m.performedByName}
                          </td>
                        </tr>
                      );
                    })}
                    {movements.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-zinc-400 italic">
                          {t.no_recent_movements}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        {!isEditing && (
          <div className="px-6 py-3.5 border-t border-zinc-200 flex items-center justify-between bg-zinc-50">
            <span className="text-[11px] text-zinc-400 font-mono">
              ID Système : {material.id}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              {t.btn_close}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialDetailModal;
