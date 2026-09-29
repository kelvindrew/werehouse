import React from 'react';
import { Smartphone, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileTableNoticeProps {
  onSwitchToCards: () => void;
  cardsLabel?: string;
}

export const MobileTableNotice: React.FC<MobileTableNoticeProps> = ({
  onSwitchToCards,
  cardsLabel
}) => {
  const { t } = useAuth();
  const label = cardsLabel || t.btn_cards || 'Cartes';

  return (
    <div className="md:hidden flex items-center justify-between gap-3 p-3 bg-zinc-900 text-white rounded-xl shadow-xs text-xs mb-3">
      <div className="flex items-center gap-2 min-w-0">
        <Smartphone className="w-4 h-4 text-lime shrink-0" />
        <span className="truncate text-zinc-300">
          {t.mobile_table_wide_notice || 'Tableau large : défilement horizontal nécessaire'}
        </span>
      </div>
      <button
        type="button"
        onClick={onSwitchToCards}
        className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime text-zinc-950 font-bold rounded-full text-xs shadow-xs hover:bg-lime/90 active:scale-95 transition-all shrink-0"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>
    </div>
  );
};

