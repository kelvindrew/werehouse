import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../lib/dataService';
import { SharedLink } from '@shared/types/models';
import { GenerateShareModal } from './GenerateShareModal';
import { 
  Share2, 
  Plus, 
  Copy, 
  Check, 
  ExternalLink, 
  Trash2, 
  Ban, 
  Search
} from 'lucide-react';

export const SharedLinksView: React.FC = () => {
  const { currentUser, t } = useAuth();
  const [links, setLinks] = useState<SharedLink[]>(() => dataService.getSharedLinks());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');

  // Auto-refresh links state
  useEffect(() => {
    const update = () => {
      setLinks(dataService.getSharedLinks());
    };
    const unsubscribe = dataService.subscribe(update);
    const interval = setInterval(update, 10000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const getFullShareUrl = (token: string) => {
    const origin = window.location.origin;
    return `${origin}/share/${token}`;
  };

  const handleCopy = (token: string) => {
    const url = getFullShareUrl(token);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 3000);
    });
  };

  const handleRevoke = (link: SharedLink) => {
    if (window.confirm(t.confirm_revoke_link)) {
      dataService.revokeSharedLink(link.id, currentUser);
      setLinks(dataService.getSharedLinks());
    }
  };

  const handleDelete = (link: SharedLink) => {
    if (window.confirm(t.confirm_delete_link)) {
      dataService.deleteSharedLink(link.id, currentUser);
      setLinks(dataService.getSharedLinks());
    }
  };

  const getDynamicStatus = (link: SharedLink): 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'REVOKED' => {
    if (link.status === 'REVOKED') return 'REVOKED';
    const now = Date.now();
    const expiry = new Date(link.expiresAt).getTime();
    if (expiry <= now) return 'EXPIRED';

    const diffHours = (expiry - now) / (3600 * 1000);
    if (diffHours <= 2) return 'EXPIRING_SOON';
    return 'ACTIVE';
  };

  const formatRemainingTime = (expiresAt: string) => {
    const now = Date.now();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) return t.status_expired;

    const minutes = Math.floor(diff / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}${t.unit_days_short} ${hours % 24}${t.unit_hours_short}`;
    if (hours > 0) return `${hours}${t.unit_hours_short} ${minutes % 60}${t.unit_minutes_short}`;
    return `${minutes} ${t.unit_minutes_short}`;
  };

  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      const dynStatus = getDynamicStatus(link);
      if (statusFilter !== 'ALL' && dynStatus !== statusFilter) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchTitle = link.title.toLowerCase().includes(q);
        const matchToken = link.token.toLowerCase().includes(q);
        const matchAuthor = link.createdByName.toLowerCase().includes(q);
        const matchWh = link.filters.warehouseId?.toLowerCase().includes(q);
        const matchSearchQ = link.filters.searchQuery?.toLowerCase().includes(q);
        return matchTitle || matchToken || matchAuthor || matchWh || matchSearchQ;
      }
      return true;
    });
  }, [links, statusFilter, searchTerm]);

  return (
    <div className="space-y-5 pb-28">
      {/* Top Banner */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 bg-zinc-900 text-white rounded-xl shadow-xs">
              <Share2 className="w-4 h-4" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
                {t.shared_links_management_title}
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                {t.shared_links_management_subtitle}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 min-h-[44px] bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-full shadow-xs transition-colors shrink-0 w-full sm:w-auto active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.btn_generate_share_link}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={t.search_links_placeholder}
            className="w-full bg-zinc-50/80 border border-zinc-200 text-xs text-zinc-900 pl-9 pr-3.5 py-2 sm:py-1.5 rounded-full outline-none focus:bg-white focus:border-zinc-900 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-none bg-zinc-50/80 border border-zinc-200 text-xs text-zinc-800 px-3.5 py-2 sm:py-1.5 rounded-full font-semibold focus:bg-white focus:outline-none focus:border-zinc-900 transition-all"
          >
            <option value="ALL">{t.all_statuses} ({links.length})</option>
            <option value="ACTIVE">{t.status_active}</option>
            <option value="EXPIRING_SOON">{t.status_expiring_soon}</option>
            <option value="EXPIRED">{t.status_expired}</option>
            <option value="REVOKED">{t.status_revoked}</option>
          </select>

          {/* Mobile View Switcher (Cards / Tableau) */}
          <div className="md:hidden flex items-center bg-zinc-100 p-0.5 rounded-full border border-zinc-200 shrink-0">
            <button
              onClick={() => setMobileViewMode('cards')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                mobileViewMode === 'cards'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t.btn_cards || 'Cartes'}
            </button>
            <button
              onClick={() => setMobileViewMode('table')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                mobileViewMode === 'table'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {t.btn_table || 'Tableau'}
            </button>
          </div>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-full px-4 py-1.5 flex items-center justify-between text-xs text-zinc-600 shadow-xs shrink-0">
          <span>{t.consultations_label}</span>
          <span className="font-bold font-mono text-zinc-900 ml-2">
            {links.reduce((acc, l) => acc + (l.accessCount || 0), 0)} {t.visits_count}
          </span>
        </div>
      </div>

      {/* Mobile Tactile Cards */}
      {mobileViewMode === 'cards' && (
        <div className="md:hidden space-y-3">
          {filteredLinks.map(link => {
            const dynStatus = getDynamicStatus(link);
            return (
              <div
                key={link.id}
                className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-4 space-y-3"
              >
                {/* Title & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 leading-snug">{link.title}</h3>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      {link.createdByName} • {new Date(link.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {dynStatus === 'ACTIVE' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {t.status_active}
                      </span>
                    )}
                    {dynStatus === 'EXPIRING_SOON' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {t.status_expiring_soon}
                      </span>
                    )}
                    {dynStatus === 'EXPIRED' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200">
                        {t.status_expired}
                      </span>
                    )}
                    {dynStatus === 'REVOKED' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                        {t.status_revoked}
                      </span>
                    )}
                  </div>
                </div>

                {/* Token Box with 1-tap copy */}
                <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-xl p-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Token:</span>
                    <span className="font-mono text-xs font-bold text-zinc-800 truncate">
                      {link.token}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(link.token)}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-white border border-zinc-200 hover:border-zinc-400 rounded-lg text-zinc-700 active:scale-95 transition-all shadow-xs"
                    title={t.copy_public_link_title}
                  >
                    {copiedToken === link.token ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Filters & Visits */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="bg-zinc-100 text-zinc-800 font-mono px-2 py-0.5 rounded border border-zinc-200">
                    WH: {link.filters.warehouseId || 'ALL'}
                  </span>
                  {link.filters.searchQuery && (
                    <span className="bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded border border-zinc-200 truncate max-w-[120px]">
                      «{link.filters.searchQuery}»
                    </span>
                  )}
                  {link.filters.binLocation && (
                    <span className="bg-zinc-100 text-zinc-800 font-mono px-2 py-0.5 rounded border border-zinc-200">
                      BIN: {link.filters.binLocation}
                    </span>
                  )}
                  <span className="bg-zinc-100 text-zinc-600 font-mono px-2 py-0.5 rounded border border-zinc-200 ml-auto">
                    {link.accessCount || 0} {t.visits_count}
                  </span>
                </div>

                {/* Expiry Details */}
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1 border-t border-zinc-100">
                  <span>{t.col_link_expires_at}:</span>
                  <span className="font-bold text-zinc-800">{formatRemainingTime(link.expiresAt)}</span>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100">
                  <a
                    href={`/share/${link.token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 min-h-[44px] flex items-center justify-center gap-1.5 bg-zinc-900 text-white rounded-xl text-xs font-semibold active:scale-95 transition-all shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{t.btn_view_public}</span>
                  </a>

                  {dynStatus !== 'REVOKED' && dynStatus !== 'EXPIRED' ? (
                    <button
                      onClick={() => handleRevoke(link)}
                      className="py-2.5 min-h-[44px] flex items-center justify-center gap-1.5 bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 rounded-xl text-xs font-semibold active:scale-95 transition-all"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>{t.btn_revoke_link}</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    onClick={() => handleDelete(link)}
                    className="py-2.5 min-h-[44px] flex items-center justify-center gap-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold active:scale-95 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.btn_delete_link}</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredLinks.length === 0 && (
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-8 text-center text-zinc-400 text-xs italic">
              {t.no_shared_links}
            </div>
          )}
        </div>
      )}

      {/* Links Table */}
      <div className={`${mobileViewMode === 'cards' ? 'hidden md:block' : 'block'} bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 border-b border-zinc-200 font-mono text-[11px] uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">{t.col_link_title}</th>
                <th className="py-3 px-3">{t.col_link_filters}</th>
                <th className="py-3 px-3">{t.col_link_status}</th>
                <th className="py-3 px-3">{t.col_link_expires_at}</th>
                <th className="py-3 px-3 text-center">{t.col_link_access_count}</th>
                <th className="py-3 px-3">{t.col_link_created_at}</th>
                <th className="py-3 px-4 text-right">{t.actions_col}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredLinks.map(link => {
                const dynStatus = getDynamicStatus(link);
                return (
                  <tr key={link.id} className="hover:bg-zinc-50 transition-colors">
                    {/* Title & Token */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-900">{link.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[11px] text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-300">
                          {link.token}
                        </span>
                        <button
                          onClick={() => handleCopy(link.token)}
                          title={t.copy_public_link_title}
                          className="text-zinc-500 hover:text-zinc-900 transition-colors"
                        >
                          {copiedToken === link.token ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Applied Filters */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                        <span className="text-[10px] bg-zinc-100 text-zinc-800 font-mono px-1.5 py-0.5 rounded border border-zinc-200">
                          WH: {link.filters.warehouseId || 'ALL'}
                        </span>
                        {link.filters.searchQuery && (
                          <span className="text-[10px] bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 truncate max-w-[120px]">
                            {link.filters.searchQuery}
                          </span>
                        )}
                        {link.filters.binLocation && (
                          <span className="text-[10px] bg-zinc-100 text-zinc-800 font-mono px-1.5 py-0.5 rounded border border-zinc-200">
                            BIN: {link.filters.binLocation}
                          </span>
                        )}
                        {link.filters.status && link.filters.status !== 'ALL' && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                            {link.filters.status}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1 font-mono">
                        {link.visibleColumns.length} {t.visible_columns_suffix}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {dynStatus === 'ACTIVE' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {t.status_active}
                        </span>
                      )}
                      {dynStatus === 'EXPIRING_SOON' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {t.status_expiring_soon}
                        </span>
                      )}
                      {dynStatus === 'EXPIRED' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200">
                          {t.status_expired}
                        </span>
                      )}
                      {dynStatus === 'REVOKED' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                          {t.status_revoked}
                        </span>
                      )}
                    </td>

                    {/* Expiration Time */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono text-xs text-zinc-800">
                        {new Date(link.expiresAt).toLocaleDateString()} {new Date(link.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[10px] font-mono mt-0.5 text-zinc-500">
                        {formatRemainingTime(link.expiresAt)}
                      </div>
                    </td>

                    {/* Visits */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 bg-zinc-100 text-zinc-900 font-mono font-bold rounded border border-zinc-300 text-xs">
                        {link.accessCount || 0}
                      </span>
                      {link.lastAccessedAt && (
                        <div className="text-[9px] text-zinc-400 mt-1 font-mono">
                          {t.last_visit_label} : {new Date(link.lastAccessedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </td>

                    {/* Creation & Author */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="text-zinc-900 font-semibold">{link.createdByName}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {new Date(link.createdAt).toLocaleDateString()} {new Date(link.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopy(link.token)}
                          className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300 rounded transition-colors"
                          title={t.copy_public_link_title}
                        >
                          {copiedToken === link.token ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <a
                          href={`/share/${link.token}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded transition-colors"
                          title={t.btn_view_public}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {dynStatus !== 'REVOKED' && dynStatus !== 'EXPIRED' && (
                          <button
                            onClick={() => handleRevoke(link)}
                            className="p-1.5 bg-white hover:bg-amber-50 text-amber-700 border border-amber-300 rounded transition-colors"
                            title={t.btn_revoke_link}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(link)}
                          className="p-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded transition-colors"
                          title={t.btn_delete_link}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredLinks.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400 italic">
                    {t.no_shared_links}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Share Modal */}
      <GenerateShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLinkCreated={() => setLinks(dataService.getSharedLinks())}
      />
    </div>
  );
};
