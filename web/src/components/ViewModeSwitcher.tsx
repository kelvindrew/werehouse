import React from 'react';
import { LayoutGrid, Table as TableIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ViewModeSwitcherProps {
  viewMode: 'cards' | 'table';
  onChange: (mode: 'cards' | 'table') => void;
  cardsLabel?: string;
  tableLabel?: string;
  className?: string;
  showMobileLabel?: boolean;
}

export const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({
  viewMode,
  onChange,
  cardsLabel: cardsLabelProp,
  tableLabel: tableLabelProp,
  className = '',
  showMobileLabel = false
}) => {
  const { t } = useAuth();
  const cardsLabel = cardsLabelProp || t.btn_cards || 'Cartes';
  const tableLabel = tableLabelProp || t.btn_table || 'Tableau';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showMobileLabel && (
        <span className="text-[11px] font-semibold text-zinc-500 sm:hidden">
          {t.view_mode_prefix || 'Affichage :'}
        </span>
      )}
      <div className="inline-flex items-center bg-zinc-100 p-0.5 rounded-full border border-zinc-300 shadow-2xs">
        <button
          type="button"
          onClick={() => onChange('cards')}
          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full transition-all active:scale-95 ${
            viewMode === 'cards'
              ? 'bg-zinc-950 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
          title={t.view_mode_cards_tooltip || 'Affichage en cartes verticales (Optimisé pour smartphone)'}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>{cardsLabel}</span>
        </button>
        <button
          type="button"
          onClick={() => onChange('table')}
          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full transition-all active:scale-95 ${
            viewMode === 'table'
              ? 'bg-zinc-950 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
          title={t.view_mode_table_tooltip || 'Affichage en tableau complet'}
        >
          <TableIcon className="w-3.5 h-3.5" />
          <span>{tableLabel}</span>
        </button>
      </div>
    </div>
  );
};

