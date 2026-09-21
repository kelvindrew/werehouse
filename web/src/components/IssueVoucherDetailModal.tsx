import React, { useState } from 'react';
import { StockIssueVoucher, User } from '@shared/types/models';
import { TranslationDictionary } from '../lib/i18n';
import { 
  X, 
  Printer, 
  CheckCircle, 
  Clock, 
  FileText, 
  Calendar, 
  Warehouse, 
  AlertCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';

interface IssueVoucherDetailModalProps {
  voucher: StockIssueVoucher | null;
  isOpen: boolean;
  onClose: () => void;
  onContinuePreparation?: (voucher: StockIssueVoucher) => void;
  onCancelVoucher?: (voucher: StockIssueVoucher, reason: string) => void;
  currentUser: User;
  t: TranslationDictionary;
}

export const IssueVoucherDetailModal: React.FC<IssueVoucherDetailModalProps> = ({
  voucher,
  isOpen,
  onClose,
  onContinuePreparation,
  onCancelVoucher,
  currentUser,
  t
}) => {
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (!isOpen || !voucher) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: StockIssueVoucher['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-mono font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-current">
            <CheckCircle className="w-3 h-3" />
            <span>{t.status_confirmed}</span>
          </span>
        );
      case 'READY':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
            <Clock className="w-3 h-3" />
            <span>{t.status_ready}</span>
          </span>
        );
      case 'PREPARING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            <Clock className="w-3 h-3" />
            <span>{t.status_preparing}</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 line-through">
            <XCircle className="w-3 h-3" />
            <span>{t.status_cancelled}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <span>{t.status_draft}</span>
          </span>
        );
    }
  };

  const isConfirmed = voucher.status === 'CONFIRMED';
  const isCancelled = voucher.status === 'CANCELLED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col my-auto text-zinc-900 dark:text-zinc-100 print:border-none print:shadow-none print:max-w-none print:w-full">
        
        {/* Header (No print close button) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 print:bg-white print:border-b-2 print:border-black">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 border border-zinc-400 dark:border-zinc-600 flex items-center justify-center bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono font-bold text-sm">
              OUT
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-base font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100">
                  {voucher.voucherNumber}
                </h2>
                {getStatusBadge(voucher.status)}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                {new Date(voucher.date).toLocaleString()} • Magasin {voucher.warehouseId}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 print:hidden">
            <button
              onClick={handlePrint}
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center space-x-1.5 text-xs font-mono font-medium"
              title={t.btn_print_voucher}
            >
              <Printer className="w-4 h-4" />
              <span>{t.btn_print_voucher}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Status Notices */}
          {isConfirmed && (
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 flex items-center space-x-2.5 print:hidden">
              <CheckCircle className="w-4 h-4 text-zinc-700 dark:text-zinc-300 flex-shrink-0" />
              <div>
                <span className="font-bold">{t.voucher_confirmed_readonly_notice}</span>
                {voucher.confirmedAt && (
                  <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                    Confirmé le {new Date(voucher.confirmedAt).toLocaleString()} par {voucher.confirmedByName || voucher.agentName}
                  </span>
                )}
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400 flex items-center space-x-2.5 print:hidden">
              <XCircle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
              <div>
                <span className="font-bold">{t.voucher_cancelled_notice}</span>
                {voucher.cancellationReason && (
                  <span className="block text-[11px] mt-0.5 font-mono">
                    Motif : {voucher.cancellationReason}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-xs font-mono">
            <div>
              <span className="text-zinc-500 dark:text-zinc-400 block text-[10px] uppercase">
                {t.issue_buyer_name}
              </span>
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {voucher.buyerName}
              </span>
            </div>

            <div>
              <span className="text-zinc-500 dark:text-zinc-400 block text-[10px] uppercase">
                {t.destination_dept}
              </span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {voucher.department || '—'}
              </span>
            </div>

            <div>
              <span className="text-zinc-500 dark:text-zinc-400 block text-[10px] uppercase">
                {t.issue_agent_name}
              </span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                {voucher.agentName}
              </span>
            </div>

            <div>
              <span className="text-zinc-500 dark:text-zinc-400 block text-[10px] uppercase">
                {t.issue_reason}
              </span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate block">
                {voucher.reason || '—'}
              </span>
            </div>
          </div>

          {/* Paper Book Verification Card */}
          <div className="p-4 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                <span className="font-mono font-bold uppercase text-zinc-900 dark:text-zinc-100">
                  {t.issue_paper_book_signature}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold ${
                  voucher.paperSignatureCompleted 
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' 
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}>
                  {voucher.paperSignatureCompleted ? 'ATTESTÉE ☑' : 'NON ATTESTÉE ☒'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                L'acheteur a apposé sa signature manuelle dans le registre papier du magasin.
              </p>
            </div>

            <div className="font-mono text-xs text-right md:border-l md:border-zinc-200 md:dark:border-zinc-700 md:pl-4">
              <span className="text-zinc-500 text-[10px] block uppercase">{t.issue_paper_book_ref}</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {voucher.paperBookReference || 'Non renseigné'}
              </span>
            </div>
          </div>

          {/* Observations if any */}
          {voucher.observations && (
            <div className="p-3 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
              <span className="font-mono font-bold block mb-1 text-[11px] text-zinc-500 uppercase">
                {t.remarks}
              </span>
              <p className="whitespace-pre-wrap">{voucher.observations}</p>
            </div>
          )}

          {/* Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Articles délivrés ({voucher.items.length})
              </h3>
              <span className="text-xs font-mono text-zinc-500">
                Total : <strong className="text-zinc-900 dark:text-zinc-100">{voucher.totalIssuedQty} unités sorties</strong>
              </span>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 font-mono text-[11px] uppercase border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Désignation</th>
                    <th className="py-2.5 px-3">Emplacement</th>
                    {isConfirmed && (
                      <th className="py-2.5 px-3 text-right">{t.issue_stock_before}</th>
                    )}
                    <th className="py-2.5 px-3 text-right">Demandé</th>
                    <th className="py-2.5 px-3 text-right">Sorti réel</th>
                    {isConfirmed && (
                      <th className="py-2.5 px-3 text-right">{t.issue_stock_after}</th>
                    )}
                    <th className="py-2.5 px-3 text-right">P.U ($)</th>
                    <th className="py-2.5 px-3 text-right">Total ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                  {voucher.items.map(it => (
                    <tr key={it.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="py-2.5 px-3 font-bold">{it.materialCode}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">{it.materialName}</div>
                        {it.specification && (
                          <div className="text-[11px] text-zinc-500 font-mono">{it.specification}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3">{it.binLocation}</td>
                      {isConfirmed && (
                        <td className="py-2.5 px-3 text-right text-zinc-500">
                          {it.stockBefore !== undefined ? `${it.stockBefore} ${it.uom}` : '—'}
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-right">{it.requestedQuantity}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-zinc-900 dark:text-zinc-100">
                        {it.issuedQuantity} {it.uom}
                      </td>
                      {isConfirmed && (
                        <td className="py-2.5 px-3 text-right font-bold text-zinc-900 dark:text-zinc-100">
                          {it.stockAfter !== undefined ? `${it.stockAfter} ${it.uom}` : '—'}
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-right">${it.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-bold">${(it.issuedQuantity * it.unitPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-zinc-100 dark:bg-zinc-800/80 border-t border-zinc-200 dark:border-zinc-800 font-mono font-bold text-xs">
                  <tr>
                    <td colSpan={isConfirmed ? 4 : 3} className="py-2.5 px-3 text-right">TOTAUX :</td>
                    <td className="py-2.5 px-3 text-right">{voucher.totalRequestedQty}</td>
                    <td className="py-2.5 px-3 text-right text-zinc-900 dark:text-zinc-100">{voucher.totalIssuedQty}</td>
                    {isConfirmed && <td></td>}
                    <td></td>
                    <td className="py-2.5 px-3 text-right">${voucher.totalValuationUSD.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Physical Signatures Section (Visible in Print Mode) */}
          <div className="hidden print:grid grid-cols-2 gap-8 pt-10 border-t-2 border-black font-mono text-xs">
            <div className="border border-black p-4 h-32 flex flex-col justify-between">
              <div>
                <span className="font-bold block">VISA DU MAGASINIER (WAREHOUSE CLERK)</span>
                <span className="text-[10px] text-zinc-600">Nom : {voucher.agentName}</span>
              </div>
              <div className="border-t border-dotted border-black pt-1 text-[10px] text-zinc-500">
                Signature :
              </div>
            </div>

            <div className="border border-black p-4 h-32 flex flex-col justify-between">
              <div>
                <span className="font-bold block">VISA DU RÉCEPTIONNAIRE / ACHETEUR</span>
                <span className="text-[10px] text-zinc-600">Nom : {voucher.buyerName} ({voucher.department || '—'})</span>
              </div>
              <div className="border-t border-dotted border-black pt-1 text-[10px] text-zinc-500">
                Signature :
              </div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 print:hidden">
          <div>
            {!isConfirmed && !isCancelled && onCancelVoucher && (
              <button
                type="button"
                onClick={() => setShowCancelPrompt(true)}
                className="px-3 py-1.5 text-xs font-mono text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {t.issue_cancel_btn}
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {!isConfirmed && !isCancelled && onContinuePreparation && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onContinuePreparation(voucher);
                }}
                className="px-4 py-2 text-xs font-mono font-bold bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 transition-colors flex items-center space-x-1.5"
              >
                <span>{t.btn_continue_preparation}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              {t.btn_cancel}
            </button>
          </div>
        </div>

      </div>

      {/* Cancel Prompt Dialog */}
      {showCancelPrompt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 max-w-sm w-full p-5 text-zinc-900 dark:text-zinc-100 shadow-2xl space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-tight text-red-600 dark:text-red-400">
              {t.issue_cancel_btn}
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Voulez-vous vraiment annuler ce bon de sortie non confirmé ?
            </p>
            <input
              type="text"
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Motif de l'annulation..."
              className="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900"
            />
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelPrompt(false)}
                className="px-3 py-1.5 text-xs font-mono border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onCancelVoucher) {
                    onCancelVoucher(voucher, cancelReason || 'Annulation manuelle');
                  }
                  setShowCancelPrompt(false);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-mono font-bold bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Confirmer l'annulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
