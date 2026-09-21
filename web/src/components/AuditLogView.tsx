import React, { useState, useMemo } from 'react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import { History, Search, ShieldCheck } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { t } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const auditLogs = dataService.getAuditLogs(500);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchSearch = !searchTerm || 
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchAction = !actionFilter || log.action === actionFilter;

      return matchSearch && matchAction;
    });
  }, [auditLogs, searchTerm, actionFilter]);

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 tracking-tight">
            <span className="p-2 bg-zinc-900 text-white rounded-xl shadow-xs">
              <History className="w-4 h-4" />
            </span>
            <span>{t.audit_view_title}</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            {t.audit_view_subtitle}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 font-mono shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{filteredLogs.length} {t.audit_events_count}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.search_audit_placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-50/80 border border-zinc-200 text-xs text-zinc-900 pl-9 pr-3.5 py-1.5 rounded-full focus:bg-white focus:outline-none focus:border-zinc-900 transition-all"
          />
        </div>

        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full bg-zinc-50/80 border border-zinc-200 text-xs text-zinc-800 px-3.5 py-1.5 rounded-full font-semibold focus:bg-white focus:outline-none focus:border-zinc-900 transition-all"
          >
            <option value="">{t.all_actions}</option>
            <option value="STOCK_RECEIPT">{t.tab_receipts}</option>
            <option value="STOCK_ISSUE">{t.tab_issues}</option>
            <option value="STOCK_TRANSFER">{t.tab_transfers}</option>
            <option value="INVENTORY_ADJUSTMENT">{t.mov_adjustment}</option>
            <option value="EXCEL_IMPORT">{t.tab_import}</option>
            <option value="LOCATION_CREATED">{t.audit_action_location_created}</option>
            <option value="LOCATION_UPDATED">{t.audit_action_location_updated}</option>
            <option value="LOCATION_DELETED">{t.audit_action_location_deleted}</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 font-mono text-[11px] uppercase font-semibold">
              <tr>
                <th className="py-3 px-3">{t.col_timestamp}</th>
                <th className="py-3 px-3">{t.col_action_type}</th>
                <th className="py-3 px-3">{t.col_user}</th>
                <th className="py-3 px-3">{t.col_target}</th>
                <th className="py-3 px-3">{t.col_desc_changes}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 border border-zinc-300 text-zinc-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-zinc-900 block">{log.userName}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">[{log.userRole}]</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-zinc-600 text-[11px]">
                    {log.targetId}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-800">
                    <div className="font-medium">{log.description}</div>
                    {log.previousValue && log.newValue && (
                      <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                        {JSON.stringify(log.previousValue)} → {JSON.stringify(log.newValue)}
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400 italic">
                    {t.no_matching_audit}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
