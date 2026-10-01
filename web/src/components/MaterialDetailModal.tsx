import React, { useState, useEffect, useRef, useMemo } from 'react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import { Material, StockItem, StockMovement, StorageLocation } from '@shared/types/models';
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
  CheckCircle2,
  ArrowLeftRight,
  ArrowRight,
  AlertTriangle,
  ZoomIn,
  Building2,
  ChevronDown,
  ChevronUp,
  Boxes,
  Sparkles
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
  const [isImageLightboxOpen, setIsImageLightboxOpen] = useState(false);
  const [editImageUrl, setEditImageUrl] = useState<string>('');
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

  const [locations, setLocations] = useState<StorageLocation[]>(() => dataService.getLocations());

  // Location & Transfer Edit state
  const [selectedStockId, setSelectedStockId] = useState<string>('');
  const [targetWarehouseId, setTargetWarehouseId] = useState<string>('B1');
  const [targetBinLocation, setTargetBinLocation] = useState<string>('');
  const [targetQuantity, setTargetQuantity] = useState<number | ''>('');
  const [showAdvancedLocation, setShowAdvancedLocation] = useState(false);
  const [targetZone, setTargetZone] = useState('');
  const [targetRack, setTargetRack] = useState('');
  const [targetShelf, setTargetShelf] = useState('');
  const [targetRow, setTargetRow] = useState('');
  const [targetPosition, setTargetPosition] = useState('');
  const [targetContainerNumber, setTargetContainerNumber] = useState('');
  const [targetLocationNotes, setTargetLocationNotes] = useState('');

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

      setLocations(dataService.getLocations());
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImageLightboxOpen) {
        setIsImageLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImageLightboxOpen]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      setEditImageUrl(dataUrl);
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
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

    setEditImageUrl(material.imageUrl || '');

    const defaultStock = stockRecords.length > 0 ? stockRecords[0] : null;
    setSelectedStockId(defaultStock ? defaultStock.id : '');
    setTargetWarehouseId(defaultStock ? defaultStock.warehouseId : (material.plant === '3458' ? 'B1' : 'B1'));
    setTargetBinLocation(defaultStock ? defaultStock.binLocation : '');
    setTargetQuantity(defaultStock ? defaultStock.quantity : '');
    setShowAdvancedLocation(false);
    setTargetZone(defaultStock?.zone || '');
    setTargetRack(defaultStock?.rack || '');
    setTargetShelf(defaultStock?.shelf || '');
    setTargetRow(defaultStock?.row || '');
    setTargetPosition(defaultStock?.position || '');
    setTargetContainerNumber(defaultStock?.containerNumber || '');
    setTargetLocationNotes(defaultStock?.locationNotes || '');

    setRandomSecurityWord(generateSecurityWord());
    setInputSecurityWord('');
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditImageUrl('');
    setIsEditing(false);
    setErrorMsg(null);
  };

  const handleSelectStockRecord = (stockId: string) => {
    setSelectedStockId(stockId);
    const rec = stockRecords.find(s => s.id === stockId);
    if (rec) {
      setTargetWarehouseId(rec.warehouseId);
      setTargetBinLocation(rec.binLocation);
      setTargetQuantity(rec.quantity);
      setTargetZone(rec.zone || '');
      setTargetRack(rec.rack || '');
      setTargetShelf(rec.shelf || '');
      setTargetRow(rec.row || '');
      setTargetPosition(rec.position || '');
      setTargetContainerNumber(rec.containerNumber || '');
      setTargetLocationNotes(rec.locationNotes || '');
    }
  };

  const currentEditingStock = stockRecords.find(s => s.id === selectedStockId) || (stockRecords.length > 0 ? stockRecords[0] : null);
  const originalWarehouseId = currentEditingStock ? currentEditingStock.warehouseId : '';
  const originalBinLocation = currentEditingStock ? currentEditingStock.binLocation : '';

  const isWarehouseChanged = !!originalWarehouseId && targetWarehouseId !== originalWarehouseId;
  const isBinChanged = !!originalBinLocation && targetBinLocation.trim().toUpperCase() !== originalBinLocation.trim().toUpperCase();
  const isLocationChanged = isWarehouseChanged || isBinChanged;

  const targetStockBins = useMemo(() => {
    return Array.from(
      new Set(
        dataService.getStock({ warehouseId: targetWarehouseId })
          .map(s => s.binLocation)
          .filter(b => b && !b.endsWith('-STD'))
      )
    ).slice(0, 6);
  }, [targetWarehouseId]);

  const fallbackBinSuggestions = useMemo(() => {
    if (targetWarehouseId === 'B1') return ['MD01-A-01', 'R01-S01', 'R02-S01', 'MD01'];
    if (targetWarehouseId === 'B2') return ['A1-S01', 'B2-S01', 'C1-S01', 'D1-S01'];
    const matchedLoc = locations.find(l => l.code === targetWarehouseId);
    if (matchedLoc?.type === 'CONTAINER') return ['CONT-GAUCHE', 'CONT-DROITE', 'CONT-FOND', 'ETAG-01'];
    if (matchedLoc?.type === 'YARD') return ['ZONE-A', 'ZONE-B', 'PARC-01'];
    return ['ZONE-01', 'RAYON-A', 'ETAGERE-1'];
  }, [targetWarehouseId, locations]);

  const combinedBinSuggestions = Array.from(new Set([...targetStockBins, ...fallbackBinSuggestions])).slice(0, 6);

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

    // 3. Validation de l'emplacement et du magasin
    let finalBin = targetBinLocation.trim().toUpperCase();
    if (!finalBin) {
      const parts = [
        targetZone.trim(),
        targetRack.trim(),
        targetShelf.trim(),
        targetRow.trim(),
        targetPosition.trim(),
        targetContainerNumber.trim()
      ].filter(Boolean);
      if (parts.length > 0) {
        finalBin = parts.join('-');
      }
    }

    if (!targetWarehouseId) {
      setErrorMsg('Le magasin de stockage est obligatoire.');
      return;
    }

    if (!finalBin) {
      setErrorMsg("L'emplacement physique (casier / rayon / bin) est obligatoire.");
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

      // Relocaliser le stock si l'emplacement a changé ou si aucun stock n'existait
      let locationMessage = '';
      if (isLocationChanged || !currentEditingStock) {
        const qtyNum = targetQuantity === '' ? undefined : Number(targetQuantity);
        const relocResult = dataService.relocateMaterialStock({
          materialId: material.id,
          sourceStockId: currentEditingStock?.id,
          sourceWarehouseId: currentEditingStock?.warehouseId || targetWarehouseId,
          sourceBinLocation: currentEditingStock?.binLocation || finalBin,
          destinationWarehouseId: targetWarehouseId,
          destinationBinLocation: finalBin,
          quantity: qtyNum !== undefined && !isNaN(qtyNum) ? qtyNum : undefined,
          destinationLocationId: locations.find(l => l.code === targetWarehouseId)?.id,
          destinationZone: targetZone.trim() || undefined,
          destinationRack: targetRack.trim() || undefined,
          destinationShelf: targetShelf.trim() || undefined,
          destinationRow: targetRow.trim() || undefined,
          destinationPosition: targetPosition.trim() || undefined,
          destinationContainerNumber: targetContainerNumber.trim() || undefined,
          destinationLocationNotes: targetLocationNotes.trim() || undefined,
          user: currentUser
        });
        locationMessage = relocResult.message;
      }

      if (editImageUrl !== (material.imageUrl || '')) {
        dataService.updateMaterialImage(material.id, editImageUrl);
        updated.imageUrl = editImageUrl;
      }

      setMaterial(updated);
      setIsEditing(false);
      setSuccessMsg(
        locationMessage 
          ? `Fiche mise à jour. ${locationMessage}`
          : 'Fiche matériel mise à jour avec succès et répercutée sur le stock !'
      );
      setTimeout(() => setSuccessMsg(null), 6000);
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
            <div 
              onClick={() => {
                if (material.imageUrl) setIsImageLightboxOpen(true);
              }}
              className={`w-11 h-11 rounded-2xl bg-zinc-100 text-zinc-900 border border-zinc-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs ${
                material.imageUrl ? 'cursor-pointer hover:ring-2 hover:ring-zinc-950 transition-all' : ''
              }`}
              title={material.imageUrl ? "Cliquer pour agrandir l'image" : undefined}
            >
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
            <button 
              type="button"
              onClick={() => setSuccessMsg(null)} 
              className="p-1 rounded-full text-emerald-700 hover:text-emerald-950 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-300 text-red-800 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button 
              type="button"
              onClick={() => setErrorMsg(null)} 
              className="p-1 rounded-full text-red-700 hover:text-red-950 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
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

            {/* Photo de l'article (Édition) */}
            <div className="bg-zinc-50/80 border border-zinc-200 rounded-3xl p-4 flex flex-col sm:flex-row items-center gap-4">
              <div 
                className={`w-28 h-28 rounded-2xl bg-white border border-zinc-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative group ${
                  !editImageUrl ? 'cursor-pointer hover:border-zinc-500' : ''
                }`}
                onClick={() => {
                  if (!editImageUrl) fileInputRef.current?.click();
                }}
              >
                {editImageUrl ? (
                  <>
                    <img src={editImageUrl} alt="Aperçu photo" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="p-1.5 bg-white text-zinc-900 rounded-lg hover:bg-zinc-100 cursor-pointer shadow"
                        title="Changer la photo"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditImageUrl('');
                        }}
                        className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer shadow"
                        title="Supprimer la photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-400 p-2 text-center">
                    <Camera className="w-7 h-7 mb-1 text-zinc-400" />
                    <span className="text-[10px] font-bold">Ajouter une photo</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5 text-xs text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-between flex-wrap gap-2">
                  <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-zinc-700" />
                    <span>Photo du matériel (Édition)</span>
                  </span>
                  {editImageUrl ? (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Photo prête à être enregistrée</span>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-zinc-100 text-zinc-500 border border-zinc-200 px-2 py-0.5 rounded-full font-mono">
                      Aucune photo sélectionnée
                    </span>
                  )}
                </div>
                <p className="text-zinc-500 text-[11px] leading-relaxed">
                  Importez ou modifiez la photo de référence pour cet équipement. Elle sera enregistrée lors de la validation du formulaire avec le mot de sécurité.
                </p>
                <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-lime" />
                    <span>{editImageUrl ? 'Remplacer la photo' : 'Importer une photo'}</span>
                  </button>
                  {editImageUrl && (
                    <button
                      type="button"
                      onClick={() => setEditImageUrl('')}
                      className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </div>
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
            {/* EMPLACEMENT & LOCALISATION PHYSIQUE DU MATÉRIEL (AVEC GESTION DU TRANSFERT) */}
            {/* ========================================================================= */}
            <div className="bg-zinc-50/80 p-4 sm:p-5 rounded-3xl border border-zinc-200/90 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-950 text-lime flex items-center justify-center shrink-0 shadow-xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900">
                      {t.mat_edit_location_title || 'Emplacement & Localisation Physique'}
                    </h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {t.mat_edit_location_desc || "Modifiez le magasin ou l'emplacement de rangement. Si vous changez de magasin, l'opération sera automatiquement enregistrée comme un transfert officiel avec traçabilité."}
                    </p>
                  </div>
                </div>

                {/* Status indicator badge */}
                <div className="shrink-0 hidden sm:block">
                  {isWarehouseChanged ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                      <ArrowLeftRight className="w-3 h-3 text-amber-700 animate-pulse" />
                      <span className="inline-flex items-center gap-1">Transfert ({originalWarehouseId} <ArrowRight className="w-2.5 h-2.5 inline" /> {targetWarehouseId})</span>
                    </span>
                  ) : isBinChanged ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs">
                      <ArrowLeftRight className="w-3 h-3 text-blue-700" />
                      <span>Déplacement casier</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{originalWarehouseId || 'Non assigné'}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Multiple stock lines selector (if article is stored in multiple places) */}
              {stockRecords.length > 1 && (
                <div className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-2xs">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5 flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-zinc-600" />
                    <span>{t.mat_edit_stock_line_select || 'Ligne de stock concernée'} ({stockRecords.length})</span>
                  </label>
                  <select
                    value={selectedStockId}
                    onChange={(e) => handleSelectStockRecord(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 cursor-pointer"
                  >
                    {stockRecords.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.warehouseId} — {s.binLocation} (Quantité: {s.quantity} {s.uom})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Single stock line or no stock chip */}
              {stockRecords.length === 1 && (
                <div className="flex flex-wrap items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-zinc-200 text-xs">
                  <span className="text-zinc-500 font-medium">Emplacement actuel :</span>
                  <span className="font-mono font-bold text-zinc-900 px-2 py-0.5 bg-zinc-100 rounded-md border border-zinc-300">
                    {stockRecords[0].warehouseId} • {stockRecords[0].binLocation}
                  </span>
                  <span className="text-zinc-400">|</span>
                  <span className="text-zinc-600 font-mono text-[11px]">
                    Stock disponible : <strong className="text-zinc-900">{stockRecords[0].availableQuantity} {material.uom}</strong>
                  </span>
                </div>
              )}

              {stockRecords.length === 0 && (
                <div className="bg-white px-3.5 py-2 rounded-xl border border-dashed border-zinc-300 text-xs text-zinc-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Aucun stock physique enregistré pour ce matériel. Définissez son emplacement de stockage :</span>
                </div>
              )}

              {/* Location Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Magasin / Site de Stockage */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-zinc-600" />
                      <span>{t.mat_edit_warehouse || 'Magasin / Site de Stockage'} <span className="text-red-500">*</span></span>
                    </span>
                    {originalWarehouseId && targetWarehouseId !== originalWarehouseId && (
                      <span className="text-[10px] text-amber-700 font-mono font-bold">
                        (Origine : {originalWarehouseId})
                      </span>
                    )}
                  </label>
                  <select
                    value={targetWarehouseId}
                    onChange={(e) => setTargetWarehouseId(e.target.value)}
                    className={`w-full bg-white border rounded-xl px-3 py-2 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-zinc-950 cursor-pointer ${
                      targetWarehouseId !== originalWarehouseId && originalWarehouseId
                        ? 'border-amber-400 text-amber-950 ring-2 ring-amber-400/30 bg-amber-50/20'
                        : 'border-zinc-300 text-zinc-900'
                    }`}
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.code}>
                        {loc.code} — {loc.name} {loc.description ? `(${loc.description.substring(0, 30)}...)` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Emplacement / Casier / Rayon */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-600" />
                      <span>{t.mat_edit_bin || 'Emplacement / Casier / Rayon'} <span className="text-red-500">*</span></span>
                    </span>
                    {originalBinLocation && targetBinLocation.trim().toUpperCase() !== originalBinLocation.trim().toUpperCase() && (
                      <span className="text-[10px] text-blue-700 font-mono font-bold">
                        (Origine : {originalBinLocation})
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    value={targetBinLocation}
                    onChange={(e) => setTargetBinLocation(e.target.value.toUpperCase())}
                    placeholder="Ex: MD01-A-01, R02-S03, A1-S01..."
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 uppercase"
                  />

                  {/* Quick Bin Suggestions Pills */}
                  {combinedBinSuggestions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-zinc-400 font-mono">Suggestions :</span>
                      {combinedBinSuggestions.map((sugg) => (
                        <button
                          key={sugg}
                          type="button"
                          onClick={() => setTargetBinLocation(sugg)}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                            targetBinLocation === sugg
                              ? 'bg-zinc-950 text-white border-zinc-950 font-bold'
                              : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                          }`}
                        >
                          {sugg}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity to relocate / transfer (if article has stock and is moved) */}
              {isLocationChanged && currentEditingStock && currentEditingStock.quantity > 0 && (
                <div className="bg-white p-3 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-zinc-900 block">
                      {t.mat_edit_transfer_qty || 'Quantité à transférer / déplacer'}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Disponible sur ce casier : <strong className="text-zinc-800">{currentEditingStock.availableQuantity} {material.uom}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      min="1"
                      max={currentEditingStock.availableQuantity}
                      value={targetQuantity}
                      onChange={(e) => setTargetQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-24 bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-right text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                    />
                    <span className="text-xs font-bold text-zinc-700 font-mono">{material.uom}</span>
                    <button
                      type="button"
                      onClick={() => setTargetQuantity(currentEditingStock.availableQuantity)}
                      className="text-[11px] font-bold text-zinc-600 hover:text-zinc-950 underline px-1 cursor-pointer"
                    >
                      Tout
                    </button>
                  </div>
                </div>
              )}

              {/* DYNAMIC TRANSFER / RELOCATION ALERT BANNER */}
              {isWarehouseChanged ? (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-2xl p-4 text-xs text-amber-950 flex items-start gap-3 shadow-xs animate-in fade-in">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
                    <ArrowLeftRight className="w-4 h-4 text-zinc-950" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-xs sm:text-sm uppercase tracking-wide text-amber-950">
                        {t.mat_edit_transfer_warn || 'Transfert inter-magasins détecté'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-amber-200 text-amber-900 border border-amber-300 shadow-2xs inline-flex items-center gap-1">
                        <span>{originalWarehouseId}</span>
                        <ArrowRight className="w-3 h-3 text-amber-800" />
                        <span>{targetWarehouseId}</span>
                      </span>
                    </div>
                    <p className="text-amber-900 text-[11px] leading-relaxed">
                      L'emplacement sélectionné n'est pas celui du magasin d'origine (actuellement <strong>{originalWarehouseId}</strong>).
                      Cette modification sera enregistrée comme un <strong>transfert de stock officiel</strong> de <strong>{originalWarehouseId}</strong> ({originalBinLocation}) vers <strong>{targetWarehouseId}</strong> ({targetBinLocation || 'Nouveau casier'}).
                      Deux mouvements inséparables (<code>TRANSFER_OUT</code> et <code>TRANSFER_IN</code>) seront créés et consignés dans l'historique et l'audit.
                    </p>
                  </div>
                </div>
              ) : isBinChanged ? (
                <div className="bg-blue-50 border border-blue-300 rounded-2xl p-3.5 text-xs text-blue-950 flex items-start gap-3 shadow-xs animate-in fade-in">
                  <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-blue-950 flex items-center gap-1">
                      <span>{t.mat_edit_interbin_notice || 'Déplacement de casier interne'}</span>
                      <span className="font-mono text-[11px] inline-flex items-center gap-1">({originalBinLocation} <ArrowRight className="w-2.5 h-2.5 inline" /> {targetBinLocation})</span>
                    </span>
                    <p className="text-blue-800 text-[11px] mt-0.5">
                      Le matériel sera réaffecté au nouveau casier au sein du magasin <strong>{targetWarehouseId}</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-zinc-200/90 rounded-2xl px-3.5 py-2.5 text-xs text-zinc-600 flex items-center gap-2 font-mono">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>{t.mat_edit_location_unchanged || 'Emplacement actuel inchangé'} ({targetWarehouseId} - {targetBinLocation || 'N/A'})</span>
                </div>
              )}

              {/* Collapsible Advanced Location Details Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvancedLocation(prev => !prev)}
                  className="text-xs font-bold text-zinc-700 hover:text-zinc-950 flex items-center gap-1.5 transition-colors cursor-pointer select-none"
                >
                  {showAdvancedLocation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>{t.mat_edit_advanced_loc_toggle || "Détails d'emplacement avancés (Zone, Rayon, Étagère...)"}</span>
                </button>

                {showAdvancedLocation && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-white p-3.5 rounded-2xl border border-zinc-200 mt-2.5 animate-in fade-in">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Zone</label>
                      <input
                        type="text"
                        value={targetZone}
                        onChange={(e) => setTargetZone(e.target.value)}
                        placeholder="Ex: Zone A, MD01"
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Rayon (Rack)</label>
                      <input
                        type="text"
                        value={targetRack}
                        onChange={(e) => setTargetRack(e.target.value)}
                        placeholder="Ex: R01, R12"
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Étagère (Shelf)</label>
                      <input
                        type="text"
                        value={targetShelf}
                        onChange={(e) => setTargetShelf(e.target.value)}
                        placeholder="Ex: S01, S03"
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Rangée (Row)</label>
                      <input
                        type="text"
                        value={targetRow}
                        onChange={(e) => setTargetRow(e.target.value)}
                        placeholder="Ex: L1, Rangée 4"
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Position / Bac</label>
                      <input
                        type="text"
                        value={targetPosition}
                        onChange={(e) => setTargetPosition(e.target.value)}
                        placeholder="Ex: P02, C-04"
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">N° Conteneur</label>
                      <input
                        type="text"
                        value={targetContainerNumber}
                        onChange={(e) => setTargetContainerNumber(e.target.value)}
                        placeholder="Ex: CONT-01"
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Remarques / Repères</label>
                      <input
                        type="text"
                        value={targetLocationNotes}
                        onChange={(e) => setTargetLocationNotes(e.target.value)}
                        placeholder="Ex: Au sol près de la porte 2..."
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                      />
                    </div>
                  </div>
                )}
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
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Déverrouillage réussi : vous pouvez maintenant enregistrer la fiche.</span>
                  </span>
                ) : inputSecurityWord.length > 0 ? (
                  <span className="text-amber-800 font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Saisie actuelle : « {inputSecurityWord} » (attendu : « {randomSecurityWord} »)</span>
                  </span>
                ) : (
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>Bouton d'enregistrement verrouillé tant que le mot n'est pas saisi.</span>
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
              {/* Photo Preview with Zoom on click */}
              <div 
                onClick={() => {
                  if (material.imageUrl) setIsImageLightboxOpen(true);
                }}
                className={`w-32 h-32 rounded-2xl bg-white border border-zinc-300 flex items-center justify-center overflow-hidden relative group shrink-0 shadow-xs ${
                  material.imageUrl ? 'cursor-pointer hover:border-zinc-800 transition-all' : ''
                }`}
                title={material.imageUrl ? "Cliquer pour agrandir l'image" : "Aucune photo"}
              >
                {material.imageUrl ? (
                  <>
                    <img src={material.imageUrl} alt={material.materialCode} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                      <ZoomIn className="w-6 h-6 stroke-[2.5]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Agrandir</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-400 p-3 text-center">
                    <Package className="w-8 h-8 mb-1 text-zinc-300" />
                    <span className="text-[10px] font-medium text-zinc-400">Aucune photo</span>
                  </div>
                )}
              </div>

              {/* Photo description & specs */}
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-zinc-600" />
                    <span>{t.photo_manager_title || 'Photo & Identité Visuelle'}</span>
                  </span>
                  {material.imageUrl ? (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{t.photo_attached_badge || 'Photo attachée'}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-zinc-100 text-zinc-500 border border-zinc-200 px-2 py-0.5 rounded-full font-mono font-medium">
                      Non renseignée
                    </span>
                  )}
                </div>
                <p className="text-zinc-500 text-[11px] leading-relaxed">
                  {material.imageUrl
                    ? "Cliquez sur l'image pour l'afficher en grand écran et inspecter les détails du matériel. Pour modifier ou remplacer cette photo, utilisez le bouton « Modifier la fiche » en haut à droite."
                    : "Aucune photo n'est actuellement associée à cet article. Pour ajouter une image de référence, passez par « Modifier la fiche »."}
                </p>
                {material.imageUrl && (
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsImageLightboxOpen(true)}
                      className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-[11px] font-bold inline-flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5 text-lime" />
                      <span>Agrandir l'image</span>
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

      {/* ========================================================================= */}
      {/* IMAGE LIGHTBOX MODAL (ENLARGED VIEW)                                     */}
      {/* ========================================================================= */}
      {isImageLightboxOpen && material.imageUrl && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsImageLightboxOpen(false)}
        >
          <div 
            className="relative max-w-4xl max-h-[92vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Top Bar */}
            <div className="w-full flex items-center justify-between text-white pb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm sm:text-base text-lime">{material.materialCode}</span>
                <span className="text-xs text-zinc-300 hidden sm:inline">— {material.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsImageLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Fermer (Échap)"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Enlarged Image */}
            <div className="relative rounded-2xl overflow-hidden bg-zinc-950/80 border border-white/10 shadow-2xl flex items-center justify-center max-h-[82vh] w-auto">
              <img
                src={material.imageUrl}
                alt={material.materialCode}
                className="max-h-[82vh] max-w-full w-auto h-auto object-contain rounded-xl select-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialDetailModal;
