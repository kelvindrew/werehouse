import React, { useState, useMemo } from 'react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import { History, Search, Download } from 'lucide-react';
import { AutocompleteInput } from './AutocompleteInput';

export const MovementsTableView: React.FC = () => {
  const { selectedWarehouse, t } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;

  const movements = useMemo(() => {
    return dataService.getStockMovements({ warehouseId: selectedWarehouse });
  }, [selectedWarehouse]);

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const matchSearch = !searchTerm ||
        m.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.binLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.referenceNumber && m.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.requester && m.requester.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchType = !typeFilter || m.movementType === typeFilter;

      return matchSearch && matchType;
    });
  }, [movements, searchTerm, typeFilter]);

  const totalPages = Math.ceil(filteredMovements.length / pageSize) || 1;
  const paginatedMovements = filteredMovements.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = () => {
    dataService.exportMovementsToExcel(selectedWarehouse);
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 tracking-tight">
            <span className="p-2 bg-zinc-900 text-white rounded-xl shadow-xs">
              <History className="w-4 h-4" />
            </span>
            <span>{t.movements_title}</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            {filteredMovements.length} {t.movements_subtitle}
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-zinc-700 px-4 py-2 rounded-full text-xs font-semibold transition-colors border border-zinc-200/80 shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-zinc-600" />
          <span>{t.btn_export_movements}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div className="sm:col-span-2 relative">
          <AutocompleteInput
            field="materialName"
            placeholder={t.search_placeholder}
            value={searchTerm}
            onChange={setSearchTerm}
            icon={<Search className="w-4 h-4" />}
            inputClassName="rounded-full bg-zinc-50/80 border-zinc-200 text-xs py-1.5 px-3.5"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-zinc-50/80 border border-zinc-200 text-xs text-zinc-800 px-3.5 py-1.5 rounded-full font-semibold focus:bg-white focus:outline-none focus:border-zinc-900 transition-all"
          >
            <option value="">{t.filter_all_movements}</option>
            <option value="RECEIPT">RECEIPT ({t.mov_receipt})</option>
            <option value="ISSUE">ISSUE ({t.mov_issue})</option>
            <option value="TRANSFER_OUT">TRANSFER_OUT ({t.mov_transfer_out})</option>
            <option value="TRANSFER_IN">TRANSFER_IN ({t.mov_transfer_in})</option>
            <option value="ADJUSTMENT">ADJUSTMENT ({t.mov_adjustment})</option>
            <option value="INITIAL_IMPORT">INITIAL_IMPORT ({t.tab_import})</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 font-mono text-[11px] uppercase font-semibold">
              <tr>
                <th className="py-3 px-3">{t.col_date}</th>
                <th className="py-3 px-3">{t.col_type}</th>
                <th className="py-3 px-3">{t.col_material}</th>
                <th className="py-3 px-3">{t.col_warehouse} & {t.col_bin}</th>
                <th className="py-3 px-3 text-right">{t.col_qty}</th>
                <th className="py-3 px-3 text-right">{t.col_stock_before_after}</th>
                <th className="py-3 px-3 text-right">{t.col_total_amount}</th>
                <th className="py-3 px-3">{t.col_ref_reason}</th>
                <th className="py-3 px-3">{t.col_operator}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {paginatedMovements.map((m) => {
                const isPlus = m.movementType === 'RECEIPT' || m.movementType === 'TRANSFER_IN' || m.movementType === 'INITIAL_IMPORT';
                return (
                  <tr key={m.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 border border-zinc-300 text-zinc-800">
                        {m.movementType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-zinc-900 block">{m.materialCode}</span>
                      <span className="text-[11px] text-zinc-500 block truncate max-w-[200px]">{m.materialName}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className="font-bold text-zinc-900 mr-1.5">{m.warehouseId}</span>
                      <span className="text-zinc-700">{m.binLocation}</span>
                      {m.destinationWarehouseId && (
                        <span className="text-zinc-500 block text-[10px]">
                          → {m.destinationWarehouseId} ({m.destinationBinLocation})
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      <span className={isPlus ? 'text-emerald-700' : 'text-zinc-900'}>
                        {isPlus ? '+' : '-'}{m.quantity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-zinc-600">
                      {m.previousQuantity} → <span className="font-bold text-zinc-900">{m.newQuantity}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-zinc-800">
                      ${m.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-600 max-w-[180px] truncate">
                      {m.referenceNumber || m.reason || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-600 font-medium whitespace-nowrap">
                      {m.performedByName}
                    </td>
                  </tr>
                );
              })}

              {paginatedMovements.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-400 italic">
                    {t.no_matching_movements}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-zinc-50 px-4 py-3 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-600 font-mono">
          <span>
            {t.showing_items} {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredMovements.length)} {t.of_total} {filteredMovements.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-white border border-zinc-300 rounded disabled:opacity-30 text-zinc-700 hover:bg-zinc-100"
            >
              {t.prev_page}
            </button>
            <span className="px-2 py-1 font-bold">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-white border border-zinc-300 rounded disabled:opacity-30 text-zinc-700 hover:bg-zinc-100"
            >
              {t.next_page}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
