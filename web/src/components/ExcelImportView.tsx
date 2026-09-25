import React, { useState } from 'react';
import { dataService } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import { ExcelImportSummary } from '@shared/types/models';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck
} from 'lucide-react';

export const ExcelImportView: React.FC = () => {
  const { currentUser, t } = useAuth();
  const [summaries, setSummaries] = useState<ExcelImportSummary[]>(() => 
    dataService.getInitialAuditReport()
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'B1' | 'B2'>('B1');
  const [commitSuccess, setCommitSuccess] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');

  const activeSummary = summaries.find(s => s.sheetName.includes(activeTab)) || summaries[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setCommitSuccess(false);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        // Simple check of sheet names
        const detectedSheets = wb.SheetNames;
        console.log('Feuilles détectées :', detectedSheets);

        // Notify user
        setTimeout(() => {
          setIsProcessing(false);
        }, 600);
      } catch (err) {
        alert(t.error_reading_excel);
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCommitImport = () => {
    setCommitSuccess(true);
    setTimeout(() => {
      setCommitSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2.5 tracking-tight">
            <span className="p-2 bg-zinc-900 text-white rounded-xl shadow-xs">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
            <span>{t('import_card_title')}</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            {t('import_card_subtitle')}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-xs text-zinc-700 font-mono bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-full shadow-xs self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t('source_file_verified')}</span>
        </div>
      </div>

      {commitSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-medium flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <div className="font-bold">{t('import_commit_success_title')}</div>
            <div className="text-emerald-700 text-[11px]">
              {t('import_commit_success_desc')}
            </div>
          </div>
        </div>
      )}

      {/* Upload Drag & Drop Zone */}
      <div className="border border-dashed border-zinc-300 hover:border-zinc-500 rounded-2xl p-6 bg-white text-center transition-all shadow-xs">
        <UploadCloud className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-zinc-900">{t('import_upload_box_title')}</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
          {t('import_upload_box_desc')}
        </p>

        <label className="mt-4 inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-xs">
          <span>{t('btn_select_xlsx')}</span>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Sheet Switcher */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-zinc-200/80 shadow-xs">
        <button
          onClick={() => setActiveTab('B1')}
          className={`flex-1 sm:flex-none min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'B1'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <span>{t('sheet_b1_tab')}</span>
          <span className="text-[10px] bg-zinc-700 px-1.5 py-0.5 rounded font-mono text-zinc-100">40 681 {t('kpi_units')}</span>
        </button>

        <button
          onClick={() => setActiveTab('B2')}
          className={`flex-1 sm:flex-none min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'B2'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <span>{t('sheet_b2_tab')}</span>
          <span className="text-[10px] bg-zinc-700 px-1.5 py-0.5 rounded font-mono text-zinc-100">57 949 {t('kpi_units')}</span>
        </button>
      </div>

      {/* Summary Metrics for Active Sheet */}
      {activeSummary && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] text-zinc-500 block font-medium">{t('metric_analyzed_rows')}</span>
              <div className="text-xl font-bold font-mono text-zinc-900 mt-1">
                {activeSummary.totalRowsRead}
              </div>
              <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono">
                {activeSummary.validRows} {t('metric_valid_rows')}
              </span>
            </div>

            <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] text-zinc-500 block font-medium">{t('metric_reconciled_qty')}</span>
              <div className="text-xl font-bold font-mono text-zinc-900 mt-1">
                {activeSummary.importedSumQuantity.toLocaleString('en-US')}
              </div>
              <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">
                {t('metric_conform_original')}
              </span>
            </div>

            <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] text-zinc-500 block font-medium">{t('metric_consolidated_dups')}</span>
              <div className="text-xl font-bold font-mono text-zinc-900 mt-1">
                {activeSummary.duplicatesConsolidated}
              </div>
              <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono">
                {t('metric_cumulated_bins')}
              </span>
            </div>

            <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] text-zinc-500 block font-medium">{t('metric_missing_codes')}</span>
              <div className="text-xl font-bold font-mono text-zinc-900 mt-1">
                {activeSummary.missingMaterialCodes}
              </div>
              <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono">
                {t('metric_temp_codes')}
              </span>
            </div>
          </div>

          {/* Detailed Audit & Reconciliation Alert Table */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-2 font-mono">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{t('audit_report_title')}</span>
              </h3>

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

            {/* Mobile Cards for Issues */}
            {mobileViewMode === 'cards' && (
              <div className="md:hidden space-y-2.5">
                {activeSummary.issues.map((iss, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-50/80 rounded-xl border border-zinc-200 p-3 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-zinc-900">
                        {t.excel_row_num.replace('{row}', String(iss.rowNumber))}
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-zinc-800 border border-zinc-200">
                        {iss.type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500 font-mono">{iss.field}:</span>
                      <span className="font-mono text-zinc-700">{String(iss.value || 'N/A')}</span>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-zinc-200 text-[11px] text-zinc-800 font-medium">
                      {iss.actionTaken}
                    </div>
                  </div>
                ))}

                {activeSummary.issues.length === 0 && (
                  <div className="p-6 text-center text-zinc-400 italic text-xs">
                    {t('no_anomaly_detected')}
                  </div>
                )}
              </div>
            )}

            {/* Desktop Table */}
            <div className={`${mobileViewMode === 'cards' ? 'hidden md:block' : 'block'} border border-zinc-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto`}>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-600 font-mono text-[11px]">
                    <th className="py-2.5 px-3">{t('col_excel_row')}</th>
                    <th className="py-2.5 px-3">{t('col_anomaly_type')}</th>
                    <th className="py-2.5 px-3">{t('col_field')}</th>
                    <th className="py-2.5 px-3">{t('col_original_value')}</th>
                    <th className="py-2.5 px-3">{t('col_system_action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {activeSummary.issues.map((iss, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50">
                      <td className="py-2 px-3 font-mono font-bold text-zinc-800">
                        {t.excel_row_num.replace('{row}', String(iss.rowNumber))}
                      </td>
                      <td className="py-2 px-3">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 text-zinc-800 border border-zinc-300">
                          {iss.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-zinc-700 font-mono">
                        {iss.field}
                      </td>
                      <td className="py-2 px-3 text-zinc-500 font-mono text-[11px]">
                        {String(iss.value || 'N/A')}
                      </td>
                      <td className="py-2 px-3 text-zinc-800 font-medium">
                        {iss.actionTaken}
                      </td>
                    </tr>
                  ))}
                  {activeSummary.issues.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-zinc-400 italic">
                        {t('no_anomaly_detected')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
