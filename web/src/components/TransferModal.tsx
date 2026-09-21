import React, { useState, useEffect } from 'react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import { StockItem, StorageLocation } from '@shared/types/models';
import { 
  X, 
  ArrowLeftRight, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  MapPin 
} from 'lucide-react';
import { AutocompleteInput } from './AutocompleteInput';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedItem?: StockItem | null;
  onSuccess: (msg: string) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  preselectedItem,
  onSuccess
}) => {
  const { currentUser, selectedWarehouse, t } = useAuth();
  const [locations, setLocations] = useState<StorageLocation[]>(() => dataService.getLocations());

  // Source site filter
  const [sourceWarehouse, setSourceWarehouse] = useState<string>('ALL');
  const [selectedStockId, setSelectedStockId] = useState<string>('');
  const [destWarehouseId, setDestWarehouseId] = useState<string>('B2');
  const [destBinLocation, setDestBinLocation] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Optional destination sub-location details
  const [showAdvancedLocation, setShowAdvancedLocation] = useState(false);
  const [destZone, setDestZone] = useState('');
  const [destRack, setDestRack] = useState('');
  const [destShelf, setDestShelf] = useState('');
  const [destRow, setDestRow] = useState('');
  const [destPosition, setDestPosition] = useState('');
  const [destContainerNumber, setDestContainerNumber] = useState('');
  const [destLocationNotes, setDestLocationNotes] = useState('');

  // All available stock
  const allAvailableStock = dataService.getStock({ onlyAvailable: true });
  const stockList = sourceWarehouse === 'ALL'
    ? allAvailableStock
    : allAvailableStock.filter(s => s.warehouseId === sourceWarehouse);

  useEffect(() => {
    const locs = dataService.getLocations();
    setLocations(locs);

    const initialSource = preselectedItem
      ? preselectedItem.warehouseId
      : (selectedWarehouse !== 'ALL' ? selectedWarehouse : 'ALL');
    setSourceWarehouse(initialSource);

    const available = dataService.getStock({ onlyAvailable: true });
    const relevant = initialSource === 'ALL'
      ? available
      : available.filter(s => s.warehouseId === initialSource);

    if (preselectedItem) {
      setSelectedStockId(preselectedItem.id);
      setDestWarehouseId(preselectedItem.warehouseId === 'B1' ? 'B2' : 'B1');
    } else if (relevant.length > 0) {
      setSelectedStockId(relevant[0].id);
      setDestWarehouseId(relevant[0].warehouseId === 'B1' ? 'B2' : 'B1');
    } else {
      setSelectedStockId('');
    }

    setDestBinLocation('');
    setQuantity('');
    setReason('');
    setComments('');
    setDestZone('');
    setDestRack('');
    setDestShelf('');
    setDestRow('');
    setDestPosition('');
    setDestContainerNumber('');
    setDestLocationNotes('');
    setError(null);
  }, [preselectedItem, isOpen]);

  if (!isOpen) return null;

  const currentStockItem = allAvailableStock.find(s => s.id === selectedStockId) || preselectedItem;
  const availableQty = currentStockItem ? currentStockItem.availableQuantity : 0;

  // Compute common suggestions for the selected destination warehouse
  const destStockBins = Array.from(
    new Set(
      dataService.getStock({ warehouseId: destWarehouseId })
        .map(s => s.binLocation)
        .filter(b => b && !b.endsWith('-STD'))
    )
  ).slice(0, 5);

  const fallbackSuggestions = (() => {
    if (destWarehouseId === 'B1') return ['R01-S01', 'R02-S01', 'R03-S01', 'MD01'];
    if (destWarehouseId === 'B2') return ['A1-S01', 'B2-S01', 'C1-S01', 'D1-S01'];
    const matchedLoc = locations.find(l => l.code === destWarehouseId);
    if (matchedLoc?.type === 'CONTAINER') return ['CONT-GAUCHE', 'CONT-DROITE', 'CONT-FOND', 'ETAG-01'];
    if (matchedLoc?.type === 'YARD') return ['ZONE-A', 'ZONE-B', 'PARC-01'];
    return ['ZONE-01', 'RAYON-A', 'ETAGERE-1'];
  })();

  const combinedSuggestions = Array.from(new Set([...destStockBins, ...fallbackSuggestions])).slice(0, 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentStockItem) {
      setError(t.select_material);
      return;
    }

    let finalDestBin = destBinLocation.trim().toUpperCase();
    if (!finalDestBin) {
      const parts = [
        destZone.trim(),
        destRack.trim(),
        destShelf.trim(),
        destRow.trim(),
        destPosition.trim(),
        destContainerNumber.trim()
      ].filter(Boolean);
      if (parts.length > 0) {
        finalDestBin = parts.join('-');
      }
    }

    // Strictly enforce destination physical location is provided!
    if (!finalDestBin) {
      setError(t.dest_bin_required_error || "L'emplacement physique de destination est obligatoire (ex: Rayon, Travée, Casier ou Conteneur).");
      return;
    }

    const qtyNum = Number(quantity);
    if (!quantity || isNaN(qtyNum) || qtyNum <= 0) {
      setError(t.transfer_qty);
      return;
    }

    if (qtyNum > availableQty) {
      setError(`${t.insufficient_stock_error} (${qtyNum} > ${availableQty})`);
      return;
    }

    if (currentStockItem.warehouseId === destWarehouseId && currentStockItem.binLocation === finalDestBin) {
      setError(`${t.source_bin} = ${t.dest_bin} ! (${finalDestBin})`);
      return;
    }

    try {
      const matchedDestLoc = locations.find(l => l.code === destWarehouseId);
      const result = dataService.performTransfer({
        materialId: currentStockItem.materialId,
        sourceWarehouseId: currentStockItem.warehouseId,
        sourceBinLocation: currentStockItem.binLocation,
        destinationWarehouseId: destWarehouseId,
        destinationLocationId: matchedDestLoc?.id,
        destinationBinLocation: finalDestBin,
        destinationZone: destZone.trim() || undefined,
        destinationRack: destRack.trim() || undefined,
        destinationShelf: destShelf.trim() || undefined,
        destinationRow: destRow.trim() || undefined,
        destinationPosition: destPosition.trim() || undefined,
        destinationContainerNumber: destContainerNumber.trim() || undefined,
        destinationLocationNotes: destLocationNotes.trim() || undefined,
        quantity: qtyNum,
        reason: reason.trim() || undefined,
        comments: comments.trim() || undefined,
        user: currentUser
      });

      onSuccess(`${t.transfer_success} [${result.transferId}] : ${qtyNum} ${currentStockItem.uom} ${currentStockItem.materialCode} -> ${destWarehouseId} (${finalDestBin})`);
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
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">{t.transfer_title}</h3>
              <p className="text-[11px] text-zinc-500">{t.transfer_desc}</p>
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

          {/* Source Selection & Article Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                {t.source_warehouse_filter}
              </label>
              <select
                value={sourceWarehouse}
                onChange={(e) => {
                  const newSource = e.target.value;
                  setSourceWarehouse(newSource);
                  const filtered = newSource === 'ALL'
                    ? allAvailableStock
                    : allAvailableStock.filter(s => s.warehouseId === newSource);
                  if (filtered.length > 0) {
                    setSelectedStockId(filtered[0].id);
                    if (destWarehouseId === filtered[0].warehouseId) {
                      setDestWarehouseId(filtered[0].warehouseId === 'B1' ? 'B2' : 'B1');
                    }
                  } else {
                    setSelectedStockId('');
                  }
                }}
                className="w-full bg-white border border-zinc-300 text-xs text-zinc-900 p-2.5 rounded focus:outline-none focus:border-zinc-900 font-semibold"
              >
                <option value="ALL">{t.all_sources} ({allAvailableStock.length})</option>
                <optgroup label={t.main_warehouses_group}>
                  <option value="B1">Magasin B1 (MD01)</option>
                  <option value="B2">Magasin B2 (Zones A-E)</option>
                  {locations.filter(l => l.type === 'WAREHOUSE' && l.code !== 'B1' && l.code !== 'B2').map(l => (
                    <option key={l.id} value={l.code}>Magasin {l.code} — {l.name}</option>
                  ))}
                </optgroup>
                <optgroup label={t.containers_and_sites_group}>
                  {locations.filter(l => l.type === 'CONTAINER').map(l => (
                    <option key={l.id} value={l.code}>Conteneur {l.code} ({l.name})</option>
                  ))}
                  {locations.filter(l => l.type !== 'WAREHOUSE' && l.type !== 'CONTAINER' && l.code !== 'B1' && l.code !== 'B2').map(l => (
                    <option key={l.id} value={l.code}>{l.code} — {l.name}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                {t.source_article_available_location} <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedStockId}
                onChange={(e) => {
                  setSelectedStockId(e.target.value);
                  const itm = allAvailableStock.find(s => s.id === e.target.value);
                  if (itm && destWarehouseId === itm.warehouseId) {
                    setDestWarehouseId(itm.warehouseId === 'B1' ? 'B2' : 'B1');
                  }
                }}
                disabled={stockList.length === 0}
                className="w-full bg-white border border-zinc-300 text-xs text-zinc-900 p-2.5 rounded focus:outline-none focus:border-zinc-900 font-mono disabled:bg-zinc-100 disabled:text-zinc-400"
              >
                {stockList.length === 0 ? (
                  <option value="">Aucun article disponible sur ce site</option>
                ) : (
                  stockList.map(s => (
                    <option key={s.id} value={s.id}>
                      [{s.warehouseId} - {s.binLocation}] {s.materialCode} — {s.materialName.slice(0, 30)} ({t.col_available}: {s.availableQuantity} {s.uom})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Origin vs Destination Flow Card */}
          {currentStockItem && (
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Source details */}
                <div className="flex-1 bg-white p-3 rounded border border-zinc-200 shadow-2xs">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                    {t.source_warehouse} & {t.col_bin}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-zinc-200 text-zinc-900 border border-zinc-300">
                      {currentStockItem.warehouseId}
                    </span>
                    <span className="font-mono text-zinc-900 font-bold text-xs bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                      {currentStockItem.binLocation}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-zinc-600 font-mono">
                    {t.available_short_label}: <strong className="text-zinc-900">{currentStockItem.availableQuantity}</strong> {currentStockItem.uom}
                  </div>
                </div>

                <div className="flex items-center justify-center text-zinc-400 self-center">
                  <div className="p-2 bg-zinc-200 rounded-full">
                    <ArrowRight className="w-4 h-4 text-zinc-800" />
                  </div>
                </div>

                {/* Destination Warehouse Config */}
                <div className="flex-1 bg-white p-3 rounded border border-zinc-200 shadow-2xs space-y-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                    {t.dest_warehouse}
                  </span>
                  <select
                    value={destWarehouseId}
                    onChange={(e) => setDestWarehouseId(e.target.value)}
                    className="w-full bg-white border border-zinc-300 text-xs text-zinc-900 p-1.5 rounded font-bold outline-none focus:border-zinc-900"
                  >
                    <optgroup label={t.main_warehouses_group}>
                      <option value="B1">Magasin B1 (MD01)</option>
                      <option value="B2">Magasin B2 (Zones A-E)</option>
                      {locations.filter(l => l.type === 'WAREHOUSE' && l.code !== 'B1' && l.code !== 'B2').map(l => (
                        <option key={l.id} value={l.code}>Magasin {l.code} — {l.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label={t.containers_and_sites_group}>
                      {locations.filter(l => l.type === 'CONTAINER').map(loc => (
                        <option key={loc.id} value={loc.code}>
                          Conteneur {loc.code} ({loc.name})
                        </option>
                      ))}
                      {locations.filter(l => l.type !== 'WAREHOUSE' && l.type !== 'CONTAINER' && l.code !== 'B1' && l.code !== 'B2').map(loc => (
                        <option key={loc.id} value={loc.code}>
                          {loc.code} — {loc.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Destination Physical Location (MANDATORY) */}
              <div className="bg-white p-3 rounded border border-zinc-200 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-700" />
                    <span>{t.dest_bin}</span>
                    <span className="text-red-600 font-bold text-[11px]">* ({t.field_required_badge || 'Obligatoire'})</span>
                  </label>
                  {destBinLocation && (
                    <span className="text-[10px] text-emerald-600 font-semibold font-mono">
                      ✓ Emplacement renseigné
                    </span>
                  )}
                </div>
                <AutocompleteInput
                  field="binLocation"
                  placeholder="ex: R01-S01, Rayon 2, Travée B, Conteneur Gauche..."
                  value={destBinLocation}
                  onChange={setDestBinLocation}
                  uppercase
                  fontMono
                  inputClassName={`py-2 px-3 text-xs font-mono font-bold ${
                    !destBinLocation.trim() ? 'border-amber-400 bg-amber-50/20 focus:border-zinc-900' : 'focus:border-zinc-900'
                  }`}
                />
                {combinedSuggestions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-zinc-400 font-medium">Suggestions :</span>
                    {combinedSuggestions.map((sugg) => (
                      <button
                        key={sugg}
                        type="button"
                        onClick={() => setDestBinLocation(sugg)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                          destBinLocation === sugg
                            ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                            : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-300'
                        }`}
                      >
                        {sugg}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Toggle for destination optional sub-location attributes */}
          <div className="border border-zinc-200 rounded p-3 bg-zinc-50">
            <button
              type="button"
              onClick={() => setShowAdvancedLocation(!showAdvancedLocation)}
              className="w-full flex items-center justify-between text-xs font-semibold text-zinc-700"
            >
              <span>{t.sub_location_dest_toggle}</span>
              {showAdvancedLocation ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
            </button>

            {showAdvancedLocation && (
              <div className="grid grid-cols-3 gap-2.5 pt-3 mt-2 border-t border-zinc-200">
                <div>
                  <label className="block text-[11px] text-zinc-600 mb-0.5 font-medium">{t.field_zone}</label>
                  <AutocompleteInput
                    field="zone"
                    value={destZone}
                    onChange={setDestZone}
                    placeholder="ex: Zone A"
                    inputClassName="px-2 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-600 mb-0.5 font-medium">{t.field_container_number}</label>
                  <AutocompleteInput
                    field="containerNumber"
                    value={destContainerNumber}
                    onChange={setDestContainerNumber}
                    placeholder="ex: Container 02"
                    inputClassName="px-2 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-600 mb-0.5 font-medium">{t.field_rack}</label>
                  <AutocompleteInput
                    field="rack"
                    value={destRack}
                    onChange={setDestRack}
                    placeholder="ex: R12"
                    inputClassName="px-2 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-600 mb-0.5 font-medium">{t.field_shelf}</label>
                  <AutocompleteInput
                    field="shelf"
                    value={destShelf}
                    onChange={setDestShelf}
                    placeholder="ex: S03"
                    inputClassName="px-2 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-600 mb-0.5 font-medium">{t.field_position}</label>
                  <AutocompleteInput
                    field="position"
                    value={destPosition}
                    onChange={setDestPosition}
                    placeholder="ex: C-04"
                    inputClassName="px-2 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-600 mb-0.5 font-medium">{t.field_location_notes}</label>
                  <input
                    type="text"
                    value={destLocationNotes}
                    onChange={(e) => setDestLocationNotes(e.target.value)}
                    placeholder="ex: Au sol"
                    className="w-full px-2 py-1.5 text-xs bg-white border border-zinc-300 rounded focus:border-zinc-900 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              {t.transfer_qty} <span className="text-red-500">*</span>
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
                className="w-full bg-white border border-zinc-300 text-sm text-zinc-900 font-mono font-bold px-3 py-2 rounded focus:outline-none focus:border-zinc-900"
              />
              <span className="absolute right-3 top-2 text-xs text-zinc-500 font-mono">
                {currentStockItem?.uom || t.col_uom}
              </span>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              {t.transfer_reason}
            </label>
            <AutocompleteInput
              field="reason"
              placeholder="ex: Réapprovisionnement atelier, réorganisation magasin..."
              value={reason}
              onChange={setReason}
            />
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
