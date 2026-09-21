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
  QrCode
} from 'lucide-react';

interface MaterialDetailModalProps {
  materialId: string | null;
  onClose: () => void;
  onQuickReceipt?: (item: StockItem) => void;
  onQuickIssue?: (item: StockItem) => void;
  onQuickTransfer?: (item: StockItem) => void;
  onOpenLabelModal?: (item: StockItem) => void;
}

export const MaterialDetailModal: React.FC<MaterialDetailModalProps> = ({
  materialId,
  onClose,
  onQuickReceipt,
  onQuickIssue,
  onQuickTransfer,
  onOpenLabelModal,
}) => {
  const { t } = useAuth();
  const [material, setMaterial] = useState<Material | null>(null);
  const [stockRecords, setStockRecords] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border border-zinc-300 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-start justify-between bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded bg-zinc-100 text-zinc-900 border border-zinc-300 flex items-center justify-center overflow-hidden shrink-0">
              {material.imageUrl ? (
                <img src={material.imageUrl} alt={material.materialCode} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-5 h-5 text-zinc-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg text-zinc-900">{material.materialCode}</span>
                {material.chineseName && (
                  <span className="text-xs font-medium text-zinc-700 bg-zinc-200 px-2 py-0.5 rounded">
                    {material.chineseName}
                  </span>
                )}
                {material.requiresMaterialCodeReview && (
                  <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-300 px-2 py-0.5 rounded font-medium">
                    {t.requires_code_review}
                  </span>
                )}
              </div>
              <h3 className="text-xs text-zinc-500 mt-0.5">{material.name}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenLabelModal && stockRecords.length > 0 && (
              <button
                type="button"
                onClick={() => onOpenLabelModal(stockRecords[0])}
                className="px-2.5 py-1.5 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 rounded text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm"
                title={t.btn_print_label}
              >
                <QrCode className="w-3.5 h-3.5 text-zinc-700" />
                <span>{t.btn_print_label}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded transition-colors"
              title={t.btn_close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Material Photo & Quick Details */}
          <div className="bg-zinc-50 border border-zinc-200 rounded p-4 flex flex-col sm:flex-row gap-5 items-center">
            {/* Photo Preview */}
            <div className="w-32 h-32 rounded bg-white border border-zinc-300 flex items-center justify-center overflow-hidden relative group shrink-0">
              {material.imageUrl ? (
                <>
                  <img src={material.imageUrl} alt={material.materialCode} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 bg-zinc-900 text-white rounded hover:bg-zinc-800"
                      title={t.btn_change_photo}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleRemoveImage}
                      className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700"
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
                <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-zinc-600" />
                  <span>{t.photo_manager_title}</span>
                </span>
                {material.imageUrl ? (
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                    ✓ {t.photo_attached_badge}
                  </span>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-zinc-900 font-semibold underline flex items-center gap-1"
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
                    className="px-2.5 py-1 bg-white hover:bg-zinc-50 text-zinc-700 rounded text-[11px] font-medium border border-zinc-300"
                  >
                    {t.btn_change_photo}
                  </button>
                  <button
                    onClick={handleRemoveImage}
                    className="px-2.5 py-1 bg-white hover:bg-red-50 text-red-600 rounded text-[11px] font-medium border border-red-200"
                  >
                    {t.btn_remove_photo}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* General Specs and Pricing Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded border border-zinc-200">
            <div>
              <span className="text-[11px] text-zinc-500 block font-semibold uppercase">{t.mat_specs}</span>
              <span className="text-xs font-medium text-zinc-900 font-mono mt-0.5 block truncate">
                {material.specification || '—'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 block font-semibold uppercase">{t.mat_uom}</span>
              <span className="text-xs font-semibold text-zinc-900 font-mono mt-0.5 block">
                {material.uom}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 block font-semibold uppercase">{t.mat_price}</span>
              <span className="text-xs font-bold text-zinc-900 font-mono mt-0.5 block">
                ${(material.standardPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {material.currency}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 block font-semibold uppercase">{t.mat_plant}</span>
              <span className="text-xs font-semibold text-zinc-700 font-mono mt-0.5 block">
                {material.plant || '3458'} {material.valuationType ? `(${material.valuationType})` : ''}
              </span>
            </div>
          </div>

          {/* Aggregate Stock Overview */}
          <div className="flex items-center justify-between bg-zinc-50 p-3.5 rounded border border-zinc-200">
            <div>
              <span className="text-xs text-zinc-500">{t.mat_total_stock} :</span>
              <div className="text-xl font-bold font-mono text-zinc-900 mt-0.5">
                {totalQuantity.toLocaleString()} {material.uom}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-500">{t.mat_total_value} :</span>
              <div className="text-xl font-bold font-mono text-zinc-900 mt-0.5">
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
                const locTotalVal = records.reduce((acc, s) => acc + s.totalValue, 0);

                return (
                  <div key={locCode} className="bg-white border border-zinc-200 rounded p-3.5">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-zinc-100 border border-zinc-300 rounded text-zinc-900">
                          {locCode}
                        </span>
                        <span className="text-xs text-zinc-600 font-medium">
                          {records.length} {t.count_locations_suffix}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-zinc-900">
                        {locTotalQty.toLocaleString()} {material.uom}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {records.map((s) => {
                        const parts = dataService.getLocationParts(s);
                        return (
                          <div key={s.id} className="bg-zinc-50 p-2.5 rounded border border-zinc-200 text-xs">
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
                <div className="col-span-2 text-center py-6 text-zinc-400 bg-zinc-50 rounded border border-dashed border-zinc-200 text-xs">
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

            <div className="bg-white border border-zinc-200 rounded overflow-hidden max-h-56 overflow-y-auto">
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

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 flex items-center justify-end bg-zinc-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-xs font-semibold transition-colors"
          >
            {t.btn_close}
          </button>
        </div>
      </div>
    </div>
  );
};
