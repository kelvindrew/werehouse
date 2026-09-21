import React, { useState, useEffect } from 'react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import { Material, StockItem, StorageLocation } from '@shared/types/models';
import { X, ArrowDownToLine, Check, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { AutocompleteInput } from './AutocompleteInput';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedItem?: StockItem | null;
  onSuccess: (msg: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  preselectedItem,
  onSuccess
}) => {
  const { currentUser, t } = useAuth();
  const [materialSearch, setMaterialSearch] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [warehouseId, setWarehouseId] = useState<string>('B1');
  const [binLocation, setBinLocation] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [supplier, setSupplier] = useState('');
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Optional flexible sub-location attributes
  const [showAdvancedLocation, setShowAdvancedLocation] = useState(false);
  const [zone, setZone] = useState('');
  const [rack, setRack] = useState('');
  const [shelf, setShelf] = useState('');
  const [row, setRow] = useState('');
  const [position, setPosition] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [locationNotes, setLocationNotes] = useState('');

  const [locations, setLocations] = useState<StorageLocation[]>(() => dataService.getLocations());
  const materials = dataService.getMaterials();

  useEffect(() => {
    setLocations(dataService.getLocations());
    if (preselectedItem) {
      const mat = dataService.getMaterial(preselectedItem.materialId);
      if (mat) {
        setSelectedMaterial(mat);
        setMaterialSearch(`${mat.materialCode} — ${mat.name}`);
      }
      setWarehouseId(preselectedItem.warehouseId);
      setBinLocation(preselectedItem.binLocation);
      setUnitPrice(preselectedItem.unitPrice);
      setZone(preselectedItem.zone || '');
      setRack(preselectedItem.rack || '');
      setShelf(preselectedItem.shelf || '');
      setRow(preselectedItem.row || '');
      setPosition(preselectedItem.position || '');
      setContainerNumber(preselectedItem.containerNumber || '');
      setLocationNotes(preselectedItem.locationNotes || '');
    } else {
      setSelectedMaterial(null);
      setMaterialSearch('');
      setBinLocation('');
      setQuantity('');
      setUnitPrice('');
      setReferenceNumber('');
      setSupplier('');
      setComments('');
      setZone('');
      setRack('');
      setShelf('');
      setRow('');
      setPosition('');
      setContainerNumber('');
      setLocationNotes('');
      setError(null);
    }
  }, [preselectedItem, isOpen]);

  if (!isOpen) return null;

  const filteredMaterials = materialSearch.trim() && !selectedMaterial
    ? materials.filter(m => 
        m.materialCode.toLowerCase().includes(materialSearch.toLowerCase()) ||
        m.name.toLowerCase().includes(materialSearch.toLowerCase()) ||
        (m.chineseName && m.chineseName.toLowerCase().includes(materialSearch.toLowerCase()))
      ).slice(0, 8)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedMaterial) {
      setError(t.select_material);
      return;
    }

    // Auto-generate composite bin if left empty but granular fields specified
    let targetBin = binLocation.trim().toUpperCase();
    if (!targetBin) {
      const parts = [
        zone.trim(),
        rack.trim(),
        shelf.trim(),
        row.trim(),
        position.trim(),
        containerNumber.trim()
      ].filter(Boolean);
      if (parts.length > 0) {
        targetBin = parts.join('-');
      } else {
        targetBin = `${warehouseId}-STD`;
      }
    }

    const qtyNum = Number(quantity);
    if (!quantity || isNaN(qtyNum) || qtyNum <= 0) {
      setError(t.receipt_qty);
      return;
    }

    const priceNum = Number(unitPrice) || 0;

    try {
      const matchedLoc = locations.find(l => l.code === warehouseId);
      dataService.performReceipt({
        materialId: selectedMaterial.id,
        warehouseId,
        locationId: matchedLoc?.id,
        binLocation: targetBin,
        quantity: qtyNum,
        unitPrice: priceNum,
        referenceNumber: referenceNumber.trim() || undefined,
        supplier: supplier.trim() || undefined,
        comments: comments.trim() || undefined,
        zone: zone.trim() || undefined,
        rack: rack.trim() || undefined,
        shelf: shelf.trim() || undefined,
        row: row.trim() || undefined,
        position: position.trim() || undefined,
        containerNumber: containerNumber.trim() || undefined,
        locationNotes: locationNotes.trim() || undefined,
        user: currentUser
      });

      onSuccess(`${t.receipt_success} (+${qtyNum} ${selectedMaterial.uom} ${selectedMaterial.materialCode} -> ${warehouseId} / ${targetBin})`);
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
              <ArrowDownToLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">{t.receipt_title}</h3>
              <p className="text-[11px] text-zinc-500">{t.receipt_desc}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded transition-colors" title={t.btn_close}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
              {error}
            </div>
          )}

          {/* Material Selection */}
          <div className="relative">
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              {t.col_name} <span className="text-red-500">*</span>
            </label>
            <AutocompleteInput
              field="materialName"
              placeholder={t.select_material}
              value={materialSearch}
              onChange={(val) => {
                setMaterialSearch(val);
                if (selectedMaterial && `${selectedMaterial.materialCode} — ${selectedMaterial.name}` !== val) {
                  setSelectedMaterial(null);
                }
              }}
              onSelectSuggestion={(s) => {
                if (s.payload) {
                  const m = s.payload as Material;
                  setSelectedMaterial(m);
                  setMaterialSearch(`${m.materialCode} — ${m.name}`);
                  setUnitPrice(m.standardPrice || 0);
                }
              }}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Warehouse Site Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                {t.col_warehouse} <span className="text-red-500">*</span>
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full bg-white border border-zinc-300 text-xs text-zinc-800 px-3 py-2 rounded focus:outline-none focus:border-zinc-900 font-semibold"
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

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                {t.target_bin} / {t.field_physical_address}
              </label>
              <AutocompleteInput
                field="binLocation"
                placeholder={warehouseId === 'B1' ? 'ex: MD01-01-01' : warehouseId === 'B2' ? 'ex: B2-01-01' : 'ex: Côté gauche, C-04'}
                value={binLocation}
                onChange={setBinLocation}
                uppercase
                fontMono
              />
            </div>
          </div>

          {/* Toggle for Optional Sub-Location Attributes */}
          <div className="border border-zinc-200 rounded p-3 bg-zinc-50">
            <button
              type="button"
              onClick={() => setShowAdvancedLocation(!showAdvancedLocation)}
              className="w-full flex items-center justify-between text-xs font-semibold text-zinc-700"
            >
              <span>{t.sub_location_toggle}</span>
              {showAdvancedLocation ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
            </button>

            {showAdvancedLocation && (
              <div className="grid grid-cols-3 gap-2.5 pt-3 mt-2 border-t border-zinc-200">
                <div>
                  <label className="block text-[11px] text-zinc-600 mb-0.5 font-medium">{t.field_zone}</label>
                  <AutocompleteInput
                    field="zone"
                    value={zone}
                    onChange={setZone}
                    placeholder="ex: Zone A"
                    inputClassName="px-2 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-600 mb-0.5 font-medium">{t.field_container_number}</label>
                  <AutocompleteInput
                    field="containerNumber"
                    value={containerNumber}
                    onChange={setContainerNumber}
                    placeholder="ex: Container 02"
                    inputClassName="px-2 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-600 mb-0.5 font-medium">{t.field_rack}</label>
                  <AutocompleteInput
                    field="rack"
                    value={rack}
                    onChange={setRack}
                    placeholder="ex: R12"
                    inputClassName="px-2 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-600 mb-0.5 font-medium">{t.field_shelf}</label>
                  <AutocompleteInput
                    field="shelf"
                    value={shelf}
                    onChange={setShelf}
                    placeholder="ex: S03"
                    inputClassName="px-2 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-600 mb-0.5 font-medium">{t.field_position}</label>
                  <AutocompleteInput
                    field="position"
                    value={position}
                    onChange={setPosition}
                    placeholder="ex: C-04"
                    inputClassName="px-2 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-600 mb-0.5 font-medium">{t.field_location_notes}</label>
                  <input
                    type="text"
                    value={locationNotes}
                    onChange={(e) => setLocationNotes(e.target.value)}
                    placeholder="ex: Au sol près porte"
                    className="w-full px-2 py-1.5 text-xs bg-white border border-zinc-300 rounded focus:border-zinc-900 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quantity & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                {t.receipt_qty} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0.001"
                  placeholder="0.00"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-white border border-zinc-300 text-xs text-zinc-900 font-mono font-bold px-3 py-2 rounded focus:outline-none focus:border-zinc-900"
                />
                <span className="absolute right-3 top-2 text-xs text-zinc-500 font-mono">
                  {selectedMaterial?.uom || t.col_uom}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                {t.col_unit_price} (USD)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-zinc-300 text-xs text-zinc-900 font-mono px-3 py-2 rounded focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          {/* Reference & Supplier */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                {t.po_number}
              </label>
              <input
                type="text"
                placeholder="BL-2026-XXXX"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full bg-white border border-zinc-300 text-xs text-zinc-900 px-3 py-2 rounded focus:outline-none focus:border-zinc-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                {t.supplier}
              </label>
              <AutocompleteInput
                field="supplier"
                placeholder="..."
                value={supplier}
                onChange={setSupplier}
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
              className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
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
