import React, { useState, useEffect, useMemo } from 'react';
import { StockIssueVoucher, User } from '@shared/types/models';
import { dataService } from '../lib/dataService';
import { TranslationDictionary } from '../lib/i18n';
import { IssueVoucherModal } from './IssueVoucherModal';
import { IssueVoucherDetailModal } from './IssueVoucherDetailModal';
import { IssueModal } from './IssueModal';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText, 
  Printer, 
  Eye, 
  ArrowUpRight, 
  ArrowUpFromLine,
  Building, 
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface IssuesViewProps {
  currentUser: User;
  t: TranslationDictionary;
}

export const IssuesView: React.FC<IssuesViewProps> = ({ currentUser, t }) => {
  const [vouchers, setVouchers] = useState<StockIssueVoucher[]>([]);
  const [kpis, setKpis] = useState({
    totalConfirmed: 0,
    todayIssues: 0,
    pendingIssues: 0,
    totalUnitsIssued: 0
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');
  const [isQuickIssueOpen, setIsQuickIssueOpen] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [voucherToEdit, setVoucherToEdit] = useState<StockIssueVoucher | null>(null);
  const [selectedVoucherForDetail, setSelectedVoucherForDetail] = useState<StockIssueVoucher | null>(null);

  const loadData = () => {
    const list = dataService.getIssueVouchers();
    setVouchers(list);
    setKpis(dataService.getIssueVoucherKPIs());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dataService.subscribe(() => {
      loadData();
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Filtered vouchers
  const filteredVouchers = useMemo(() => {
    return dataService.getIssueVouchers({
      searchQuery,
      warehouseId: selectedWarehouse,
      status: selectedStatus
    });
  }, [vouchers, searchQuery, selectedWarehouse, selectedStatus]);

  const handleOpenNewVoucher = () => {
    setVoucherToEdit(null);
    setIsCreateModalOpen(true);
  };

  const handleContinueVoucher = (voucher: StockIssueVoucher) => {
    setVoucherToEdit(voucher);
    setIsCreateModalOpen(true);
  };

  const handleCancelVoucher = (voucher: StockIssueVoucher, reason: string) => {
    dataService.cancelIssueVoucher(voucher.id, reason, currentUser);
    loadData();
  };

  const getStatusBadge = (status: StockIssueVoucher['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[11px] font-mono font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-current">
            <CheckCircle className="w-3 h-3" />
            <span>{t.status_confirmed}</span>
          </span>
        );
      case 'READY':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[11px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
            <Clock className="w-3 h-3" />
            <span>{t.status_ready}</span>
          </span>
        );
      case 'PREPARING':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[11px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            <Clock className="w-3 h-3" />
            <span>{t.status_preparing}</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[11px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 line-through">
            <XCircle className="w-3 h-3" />
            <span>{t.status_cancelled}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <span>{t.status_draft}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-mono font-bold text-xs">
              OUT
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono uppercase">
              {t.issues_title}
            </h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {t.issues_desc}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQuickIssueOpen(true)}
            className="px-3.5 py-2 text-xs font-mono font-bold bg-lime hover:bg-lime/90 text-zinc-950 transition-all flex items-center gap-1.5 rounded-lg shadow-2xs"
          >
            <ArrowUpFromLine className="w-4 h-4 stroke-[2.5]" />
            <span>⚡ Sortie Rapide (Express)</span>
          </button>

          <button
            onClick={handleOpenNewVoucher}
            className="px-4 py-2 text-xs font-mono font-bold bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 transition-colors flex items-center gap-1.5 rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t.btn_new_issue_voucher || '+ Bon Groupé (Multi-articles)'}</span>
          </button>
        </div>
      </div>

      {/* Industrial KPI Cards Strip (Ron Design Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Confirmed Issues */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider">
              {t.kpi_confirmed_issues}
            </span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-zinc-900 tracking-tight">
              {kpis.totalConfirmed}
            </span>
            <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
              Bons archivés
            </span>
          </div>
        </div>

        {/* Today Issues */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider">
              {t.kpi_today_issues}
            </span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-zinc-900 tracking-tight">
              {kpis.todayIssues}
            </span>
            <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
              Aujourd'hui
            </span>
          </div>
        </div>

        {/* Pending / In Progress */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider">
              {t.kpi_pending_issues}
            </span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-zinc-900 tracking-tight">
              {kpis.pendingIssues}
            </span>
            <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
              À confirmer
            </span>
          </div>
        </div>

        {/* Total Units Issued */}
        <div className="p-5 rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider">
              {t.kpi_total_units_issued}
            </span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-zinc-400"></span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-zinc-900 tracking-tight">
              {kpis.totalUnitsIssued}
            </span>
            <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
              Pièces sorties
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar with Segmented Status Pills */}
      <div className="p-4 rounded-2xl border border-zinc-200/80 bg-white shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full md:w-auto relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher par N° bon, acheteur, matériel, département, motif, page carnet..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-50 hover:bg-zinc-100/70 border border-zinc-200 rounded-full text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
          />
        </div>

        {/* Warehouse Selection Capsule */}
        <div className="flex items-center bg-zinc-100/90 p-1 rounded-full border border-zinc-200/80 overflow-x-auto max-w-full text-xs font-medium">
          {[
            { id: 'ALL', label: 'Tous Magasins' },
            { id: 'B1', label: 'B1' },
            { id: 'B2', label: 'B2' },
            { id: 'CONT-01', label: 'CONT-01' },
            { id: 'CONT-02', label: 'CONT-02' },
            { id: 'YARD', label: 'YARD' },
          ].map((wh) => (
            <button
              key={wh.id}
              onClick={() => setSelectedWarehouse(wh.id)}
              className={`px-2.5 py-1 rounded-full transition-all whitespace-nowrap ${
                selectedWarehouse === wh.id
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
              }`}
            >
              {wh.label}
            </button>
          ))}
        </div>

        {/* Segmented Status Capsule Pills (Inspired by Navexa & Cardiology Reference) */}
        <div className="flex items-center bg-zinc-100/90 p-1 rounded-full border border-zinc-200/80 overflow-x-auto max-w-full text-xs font-medium">
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'CONFIRMED', label: t.status_confirmed },
            { id: 'READY', label: t.status_ready },
            { id: 'PREPARING', label: t.status_preparing },
            { id: 'CANCELLED', label: t.status_cancelled },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={`px-3 py-1 rounded-full transition-all whitespace-nowrap ${
                selectedStatus === st.id
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Reset button if filter active */}
        {(searchQuery || selectedWarehouse !== 'ALL' || selectedStatus !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedWarehouse('ALL');
              setSelectedStatus('ALL');
            }}
            className="text-xs font-mono px-3.5 py-1.5 rounded-full border border-zinc-200 hover:bg-zinc-100 text-zinc-600 transition-colors shrink-0"
          >
            Réinitialiser
          </button>
        )}

        {/* Mobile View Toggle: Cartes / Tableau */}
        <div className="flex sm:hidden items-center justify-between w-full pt-2 border-t border-zinc-100">
          <span className="text-[11px] font-mono font-semibold text-zinc-500">Affichage :</span>
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-full border border-zinc-200">
            <button
              type="button"
              onClick={() => setMobileViewMode('cards')}
              className={`px-3 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                mobileViewMode === 'cards' ? 'bg-zinc-950 text-white shadow-2xs' : 'text-zinc-600'
              }`}
            >
              Cartes
            </button>
            <button
              type="button"
              onClick={() => setMobileViewMode('table')}
              className={`px-3 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                mobileViewMode === 'table' ? 'bg-zinc-950 text-white shadow-2xs' : 'text-zinc-600'
              }`}
            >
              Tableau
            </button>
          </div>
        </div>
      </div>

      {/* Vouchers Table / Mobile Cards */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden">
        {/* Mobile Tactile Cards */}
        {mobileViewMode === 'cards' && (
          <div className="md:hidden space-y-3 p-3 bg-zinc-50/60">
            {filteredVouchers.map((v) => {
              const isConfirmed = v.status === 'CONFIRMED';
              const isCancelled = v.status === 'CANCELLED';

              return (
                <div 
                  key={v.id}
                  className="bg-white rounded-2xl p-3.5 border border-zinc-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedVoucherForDetail(v)}
                      className="font-mono font-bold text-xs text-zinc-950 hover:underline flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-zinc-600" />
                      <span>{v.voucherNumber}</span>
                    </button>
                    <div>
                      {getStatusBadge(v.status)}
                    </div>
                  </div>

                  <div className="mt-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold px-2 py-0.5 bg-zinc-100 rounded text-zinc-800 text-[10px]">
                        {v.warehouseId}
                      </span>
                      <span className="font-semibold text-zinc-900 truncate">
                        {v.buyerName}
                      </span>
                      {v.department && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          • {v.department}
                        </span>
                      )}
                    </div>
                    {v.reason && (
                      <p className="text-[11px] text-zinc-500 mt-1 italic line-clamp-1">
                        "{v.reason}"
                      </p>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-600 font-bold">
                      {v.totalIssuedQty} pcs <span className="text-zinc-400 font-normal">({v.items.length} réf.)</span>
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {new Date(v.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedVoucherForDetail(v)}
                      className="flex-1 py-1.5 px-2 bg-zinc-950 text-white hover:bg-zinc-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all"
                    >
                      <Printer className="w-3.5 h-3.5 text-lime" />
                      <span>Imprimer A4</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedVoucherForDetail(v)}
                      className="py-1.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Détail</span>
                    </button>
                    {!isConfirmed && !isCancelled && (
                      <button
                        type="button"
                        onClick={() => handleContinueVoucher(v)}
                        className="py-1.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-blue-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all"
                      >
                        <span>Continuer</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredVouchers.length === 0 && (
              <div className="py-8 text-center text-zinc-400 font-mono text-xs">
                Aucun bon de sortie ne correspond aux critères.
              </div>
            )}
          </div>
        )}

        <div className={`${mobileViewMode === 'cards' ? 'hidden md:block' : 'block'} overflow-x-auto`}>
          <table className="w-full text-xs text-left">
          <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 font-mono text-[11px] uppercase border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="py-3 px-4">{t.issue_voucher_number}</th>
              <th className="py-3 px-4">{t.col_date}</th>
              <th className="py-3 px-4">Magasin</th>
              <th className="py-3 px-4">{t.issue_buyer_name}</th>
              <th className="py-3 px-4">{t.destination_dept}</th>
              <th className="py-3 px-4 text-right">Articles & Sortie</th>
              <th className="py-3 px-4">Carnet papier</th>
              <th className="py-3 px-4">{t.issue_voucher_status}</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredVouchers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-zinc-500 font-mono text-xs">
                  Aucun bon de sortie ne correspond aux critères sélectionnés.
                </td>
              </tr>
            ) : (
              filteredVouchers.map(v => {
                const isConfirmed = v.status === 'CONFIRMED';
                const isCancelled = v.status === 'CANCELLED';

                return (
                  <tr key={v.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    {/* Voucher Number */}
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      <button
                        onClick={() => setSelectedVoucherForDetail(v)}
                        className="hover:underline flex items-center space-x-1"
                      >
                        <span>{v.voucherNumber}</span>
                      </button>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 font-mono text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                      {new Date(v.date).toLocaleDateString()} <span className="text-[10px] text-zinc-400">{new Date(v.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>

                    {/* Warehouse */}
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className="px-2 py-0.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
                        {v.warehouseId}
                      </span>
                    </td>

                    {/* Buyer Name */}
                    <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                      <div>{v.buyerName}</div>
                      {v.reason && (
                        <div className="text-[11px] text-zinc-500 truncate max-w-xs">{v.reason}</div>
                      )}
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                      {v.department || '—'}
                    </td>

                    {/* Articles & Quantities */}
                    <td className="py-3 px-4 text-right font-mono whitespace-nowrap">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {v.totalIssuedQty} {v.items[0]?.uom || 'pcs'}
                      </span>
                      <span className="block text-[11px] text-zinc-500">
                        ({v.items.length} références)
                      </span>
                    </td>

                    {/* Paper Book Reference */}
                    <td className="py-3 px-4 font-mono text-xs whitespace-nowrap">
                      {v.paperSignatureCompleted ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-zinc-900 dark:text-zinc-100 font-bold">☑</span>
                          <span className="text-zinc-700 dark:text-zinc-300 text-[11px]">
                            {v.paperBookReference || 'Attesté'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-[11px]">En attente ☒</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(v.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => setSelectedVoucherForDetail(v)}
                          className="px-2.5 py-1 text-[11px] font-mono border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center space-x-1"
                          title={t.btn_view_voucher}
                        >
                          <Eye className="w-3 h-3" />
                          <span>Voir</span>
                        </button>

                        {!isConfirmed && !isCancelled && (
                          <button
                            onClick={() => handleContinueVoucher(v)}
                            className="px-2.5 py-1 text-[11px] font-mono font-bold bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 transition-colors flex items-center space-x-1"
                            title={t.btn_continue_preparation}
                          >
                            <span>Traiter</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Issue Voucher Modal (Create / Edit / Physical Verify / Confirm) */}
      <IssueVoucherModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaved={saved => {
          loadData();
          setSelectedVoucherForDetail(saved);
        }}
        voucherToEdit={voucherToEdit}
        currentUser={currentUser}
        t={t}
      />

      {/* Issue Voucher Detail Modal (Consultation / Printing) */}
      <IssueVoucherDetailModal
        isOpen={!!selectedVoucherForDetail}
        onClose={() => setSelectedVoucherForDetail(null)}
        voucher={selectedVoucherForDetail}
        onContinuePreparation={v => {
          setSelectedVoucherForDetail(null);
          handleContinueVoucher(v);
        }}
        onCancelVoucher={handleCancelVoucher}
        currentUser={currentUser}
        t={t}
      />

      {/* Quick Issue Express Modal */}
      <IssueModal
        isOpen={isQuickIssueOpen}
        onClose={() => setIsQuickIssueOpen(false)}
        onSuccess={() => {
          loadData();
        }}
        onOpenMultiVoucher={() => {
          setIsCreateModalOpen(true);
        }}
      />

    </div>
  );
};
