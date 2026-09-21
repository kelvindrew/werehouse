import React, { useState, useEffect, useRef } from 'react';
import { StockItem } from '@shared/types/models';
import { dataService } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  ExternalLink, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowLeftRight, 
  QrCode,
  Layers,
  MapPin,
  Camera
} from 'lucide-react';

interface StockHoverCardProps {
  item: StockItem;
  children: React.ReactNode;
  onQuickReceipt?: (item: StockItem) => void;
  onQuickIssue?: (item: StockItem) => void;
  onQuickTransfer?: (item: StockItem) => void;
  onOpenMaterialModal?: (materialId: string) => void;
  onOpenLabelModal?: (item: StockItem) => void;
  onOpenVisualTour?: (item: StockItem) => void;
}

export const StockHoverCard: React.FC<StockHoverCardProps> = ({
  item,
  children,
  onQuickReceipt,
  onQuickIssue,
  onQuickTransfer,
  onOpenMaterialModal,
  onOpenLabelModal,
  onOpenVisualTour,
}) => {
  const { t, canOperateStock } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const timerRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // All location stocks for this material
  const [allSiteStocks, setAllSiteStocks] = useState<StockItem[]>([]);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      // Calculate best position
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setPosition(spaceBelow < 320 ? 'top' : 'bottom');
      }

      // Fetch all stock occurrences for this material across all warehouses/containers
      const allStocks = dataService.getStock({ onlyAvailable: false });
      const matching = allStocks.filter(s => s.materialId === item.materialId);
      setAllSiteStocks(matching);
      setIsOpen(true);
    }, 180); // Snappy 180ms delay to prevent flickering on fast scroll
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const totalAcrossSites = allSiteStocks.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div 
      ref={triggerRef} 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isOpen && (
        <div 
          className={`absolute left-0 z-50 w-80 sm:w-96 bg-white border border-zinc-300 rounded-xl shadow-2xl p-4 text-xs pointer-events-auto transition-opacity duration-150 animate-in fade-in zoom-in-95 ${
            position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'
          }`}
          onMouseEnter={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
          }}
          onMouseLeave={handleMouseLeave}
        >
          {/* Top Material Info Card */}
          <div className="flex items-start gap-3 pb-3 border-b border-zinc-200">
            <div className="w-16 h-16 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.materialCode} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-8 h-8 text-zinc-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-zinc-900 text-sm tracking-tight">
                  {item.materialCode}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
                  {item.uom}
                </span>
              </div>

              {item.chineseName && (
                <div className="text-zinc-600 font-sans text-[11px] truncate mt-0.5" title={item.chineseName}>
                  {item.chineseName}
                </div>
              )}

              <div className="font-semibold text-zinc-900 line-clamp-2 mt-0.5" title={item.materialName}>
                {item.materialName}
              </div>

              {item.specification && (
                <div className="text-[10px] text-zinc-500 font-mono truncate mt-0.5" title={item.specification}>
                  {item.specification}
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Total stock */}
          <div className="grid grid-cols-2 gap-2 py-2.5 border-b border-zinc-200 bg-zinc-50/50 -mx-4 px-4">
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase font-medium">{t.col_unit_price}</span>
              <span className="font-mono font-bold text-zinc-900">
                ${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase font-medium">Stock Global Référencé</span>
              <span className="font-mono font-bold text-zinc-900">
                {totalAcrossSites.toLocaleString()} {item.uom}
              </span>
            </div>
          </div>

          {/* Real-time Multi-site breakdown */}
          <div className="py-2.5">
            <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-700 mb-1.5">
              <Layers className="w-3.5 h-3.5 text-zinc-500" />
              <span>{t.stock_in_other_locations || 'Répartition par site & emplacement :'}</span>
            </div>

            <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
              {allSiteStocks.length > 0 ? (
                allSiteStocks.map((stock) => (
                  <div 
                    key={stock.id}
                    className="flex items-center justify-between p-1.5 bg-zinc-50 rounded border border-zinc-200/80 font-mono text-[11px]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-900 font-bold text-[10px]">
                        {stock.warehouseId}
                      </span>
                      <span className="text-zinc-700 flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 text-zinc-400" />
                        {stock.binLocation}
                      </span>
                    </div>
                    <div className="text-right">
                      <strong className="text-zinc-900 font-bold">{stock.quantity}</strong> {stock.uom}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-zinc-500 italic">Aucun autre emplacement répertorié</div>
              )}
            </div>
          </div>

          {/* Quick Actions Footer */}
          <div className="pt-2.5 border-t border-zinc-200 flex items-center justify-between gap-1 flex-wrap">
            <div className="flex items-center gap-1">
              {canOperateStock && onQuickReceipt && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onQuickReceipt(item);
                  }}
                  className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                  title={t.action_receipt}
                >
                  <ArrowDownToLine className="w-3 h-3" />
                  <span>+ Entrée</span>
                </button>
              )}

              {canOperateStock && onQuickIssue && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onQuickIssue(item);
                  }}
                  className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                  title={t.action_issue}
                >
                  <ArrowUpFromLine className="w-3 h-3" />
                  <span>- Sortie</span>
                </button>
              )}

              {canOperateStock && onQuickTransfer && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onQuickTransfer(item);
                  }}
                  className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                  title={t.action_transfer}
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>⇄ Transférer</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 ml-auto">
              {onOpenVisualTour && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onOpenVisualTour(item);
                  }}
                  className="p-1 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                  title={t.btn_tour_item || "Visite Visuelle"}
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}

              {onOpenLabelModal && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onOpenLabelModal(item);
                  }}
                  className="p-1 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                  title="Imprimer QR Code / Étiquette"
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>
              )}

              {onOpenMaterialModal && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onOpenMaterialModal(item.materialId);
                  }}
                  className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                  title={t.btn_details}
                >
                  <span>Fiche 360°</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
