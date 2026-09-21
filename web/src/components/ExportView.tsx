import React from 'react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import { Download, Building2, History, Layers } from 'lucide-react';

export const ExportView: React.FC = () => {
  const { t } = useAuth();
  const exportStockB1 = () => dataService.exportStockToExcel('B1');
  const exportStockB2 = () => dataService.exportStockToExcel('B2');
  const exportStockGlobal = () => dataService.exportStockToExcel('ALL');
  const exportMovements = () => dataService.exportMovementsToExcel('ALL');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pb-3 border-b border-zinc-200">
        <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
          <Download className="w-5 h-5 text-zinc-800" />
          <span>{t('export_view_title')}</span>
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          {t('export_view_subtitle')}
        </p>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Stock Global */}
        <div className="bg-white border border-zinc-200 rounded p-4 flex flex-col justify-between hover:border-zinc-400 transition">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-zinc-100 text-zinc-800 border border-zinc-200 rounded">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-xs">{t('export_global_title')}</h3>
                <p className="text-[11px] text-zinc-500 font-mono">{t('export_global_meta')}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {t('export_global_desc')}
            </p>
          </div>
          <button
            onClick={exportStockGlobal}
            className="mt-4 w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>{t('btn_download_stock_global')}</span>
          </button>
        </div>

        {/* Export Stock B1 */}
        <div className="bg-white border border-zinc-200 rounded p-4 flex flex-col justify-between hover:border-zinc-400 transition">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-zinc-100 text-zinc-800 border border-zinc-200 rounded">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-xs">{t('export_b1_title')}</h3>
                <p className="text-[11px] text-zinc-500 font-mono">{t('export_b1_meta')}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {t('export_b1_desc')}
            </p>
          </div>
          <button
            onClick={exportStockB1}
            className="mt-4 w-full py-2 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 rounded text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>{t('btn_download_stock_b1')}</span>
          </button>
        </div>

        {/* Export Stock B2 */}
        <div className="bg-white border border-zinc-200 rounded p-4 flex flex-col justify-between hover:border-zinc-400 transition">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-zinc-100 text-zinc-800 border border-zinc-200 rounded">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-xs">{t('export_b2_title')}</h3>
                <p className="text-[11px] text-zinc-500 font-mono">{t('export_b2_meta')}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {t('export_b2_desc')}
            </p>
          </div>
          <button
            onClick={exportStockB2}
            className="mt-4 w-full py-2 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-300 rounded text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>{t('btn_download_stock_b2')}</span>
          </button>
        </div>

        {/* Export Movement History */}
        <div className="bg-white border border-zinc-200 rounded p-4 flex flex-col justify-between hover:border-zinc-400 transition">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-zinc-100 text-zinc-800 border border-zinc-200 rounded">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 text-xs">{t('export_movements_title')}</h3>
                <p className="text-[11px] text-zinc-500 font-mono">{t('export_movements_meta')}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {t('export_movements_desc')}
            </p>
          </div>
          <button
            onClick={exportMovements}
            className="mt-4 w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>{t('btn_download_movements')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
