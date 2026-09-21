import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { StockItem, StorageLocation } from '@shared/types/models';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Printer, 
  QrCode, 
  Smartphone, 
  Download, 
  Check, 
  Copy, 
  Building2, 
  Tag, 
  MapPin 
} from 'lucide-react';

interface BarcodeLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: StockItem | null;
  location?: StorageLocation | null;
}

export const BarcodeLabelModal: React.FC<BarcodeLabelModalProps> = ({
  isOpen,
  onClose,
  item,
  location,
}) => {
  const { t } = useAuth();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [labelSize, setLabelSize] = useState<'standard' | 'medium' | 'large'>('standard');
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Target payload format: compatible with Android ScannerScreen.kt
  // Android Scanner recognizes either plain code or json string
  const labelPayload = item
    ? JSON.stringify({
        type: 'MATERIAL',
        code: item.materialCode,
        name: item.materialName.slice(0, 40),
        wh: item.warehouseId,
        bin: item.binLocation
      })
    : location
    ? JSON.stringify({
        type: 'LOCATION',
        code: location.code,
        name: location.name,
        whType: location.type
      })
    : '';

  useEffect(() => {
    if (!isOpen || !labelPayload) return;
    QRCode.toDataURL(labelPayload, {
      width: 256,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#09090b',
        light: '#ffffff'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [isOpen, labelPayload]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCode = () => {
    const textToCopy = item ? item.materialCode : location ? location.code : '';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border border-zinc-300 rounded-lg w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-zinc-900 text-white flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">
                {t.label_modal_title || "Générateur d'Étiquette Industrielle"}
              </h3>
              <p className="text-[11px] text-zinc-500">
                {t.label_modal_desc || "Étiquette code-barres & QR Code scannable par l'application Android"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded transition-colors"
            title={t.btn_close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Format size selector */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <span className="text-xs font-semibold text-zinc-700">Format d'impression :</span>
            <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
              <button
                type="button"
                onClick={() => setLabelSize('standard')}
                className={`px-2.5 py-1 text-xs font-medium rounded ${
                  labelSize === 'standard' ? 'bg-white text-zinc-900 shadow-2xs font-bold' : 'text-zinc-600'
                }`}
              >
                50 × 30 mm
              </button>
              <button
                type="button"
                onClick={() => setLabelSize('medium')}
                className={`px-2.5 py-1 text-xs font-medium rounded ${
                  labelSize === 'medium' ? 'bg-white text-zinc-900 shadow-2xs font-bold' : 'text-zinc-600'
                }`}
              >
                70 × 40 mm
              </button>
              <button
                type="button"
                onClick={() => setLabelSize('large')}
                className={`px-2.5 py-1 text-xs font-medium rounded ${
                  labelSize === 'large' ? 'bg-white text-zinc-900 shadow-2xs font-bold' : 'text-zinc-600'
                }`}
              >
                100 × 60 mm (Rack)
              </button>
            </div>
          </div>

          {/* Realistic Label Card Preview */}
          <div className="flex justify-center p-4 bg-zinc-100 rounded-xl border border-zinc-200">
            <div
              ref={printRef}
              className="bg-white border-2 border-zinc-900 rounded p-4 shadow-md text-zinc-900 max-w-sm w-full font-sans print:border print:shadow-none print:m-0"
              style={{ minHeight: '160px' }}
            >
              {/* Header inside label */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-1.5 font-black text-[11px] uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>WMS B1 & B2</span>
                </div>
                <div className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-900 text-white rounded font-bold">
                  {item ? `SITE: ${item.warehouseId}` : location ? `SITE: ${location.code}` : 'WMS'}
                </div>
              </div>

              {/* Main Content (QR + Details) */}
              <div className="flex items-center gap-4 py-3">
                {/* QR Code image */}
                <div className="w-24 h-24 shrink-0 bg-white border border-zinc-300 rounded p-1 flex items-center justify-center">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-zinc-100 animate-pulse rounded" />
                  )}
                </div>

                {/* Right side labels */}
                <div className="flex-1 min-w-0 space-y-1">
                  {item ? (
                    <>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase">Code SAP</div>
                      <div className="font-mono font-black text-sm sm:text-base text-zinc-900 tracking-tight break-all">
                        {item.materialCode}
                      </div>

                      {item.chineseName && (
                        <div className="text-xs text-zinc-600 font-sans truncate" title={item.chineseName}>
                          {item.chineseName}
                        </div>
                      )}

                      <div className="text-xs font-semibold text-zinc-800 line-clamp-2 leading-snug">
                        {item.materialName}
                      </div>

                      <div className="pt-1 flex items-center gap-1 text-[11px] font-mono">
                        <span className="text-zinc-500">BIN :</span>
                        <strong className="text-zinc-900">{item.binLocation}</strong>
                      </div>
                    </>
                  ) : location ? (
                    <>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase">Emplacement / Site</div>
                      <div className="font-mono font-black text-lg text-zinc-900 tracking-tight">
                        {location.code}
                      </div>
                      <div className="text-xs font-semibold text-zinc-800">
                        {location.name}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Type : <strong>{location.type}</strong>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Footer inside label */}
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                <span className="flex items-center gap-1 text-zinc-700 font-semibold">
                  <Smartphone className="w-2.5 h-2.5" />
                  {t.scan_on_android || "Scan App Android"}
                </span>
                <span>{new Date().toISOString().slice(0, 10)}</span>
              </div>
            </div>
          </div>

          {/* Android App synergy notice */}
          <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-lg text-xs text-blue-900 flex items-start gap-2.5">
            <Smartphone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Scannable avec l'Application Android</strong>
              <span className="text-blue-800 text-[11px] leading-relaxed">
                Ce QR Code est instantanément reconnu par le module <code>ScannerScreen.kt</code> de l'application Android WMS pour préparer une entrée, une sortie ou un inventaire en rayon.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer actions */}
        <div className="px-6 py-3 border-t border-zinc-200 flex items-center justify-between bg-zinc-50">
          <button
            type="button"
            onClick={handleCopyCode}
            className="px-3 py-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 rounded text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copié !' : 'Copier le code'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 rounded text-xs font-semibold transition-colors"
            >
              {t.btn_cancel}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer l'étiquette</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
