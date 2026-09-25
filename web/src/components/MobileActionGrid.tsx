import React from 'react';
import { 
  ArrowUpFromLine, 
  ArrowDownToLine, 
  ArrowLeftRight, 
  Camera, 
  Share2, 
  QrCode,
  Sparkles
} from 'lucide-react';
import { TranslationDictionary } from '../lib/i18n';

interface MobileActionGridProps {
  onOpenIssue: () => void;
  onOpenReceipt: () => void;
  onOpenTransfer: () => void;
  onOpenTour?: () => void;
  onOpenShare?: () => void;
  t: TranslationDictionary;
}

export const MobileActionGrid: React.FC<MobileActionGridProps> = ({
  onOpenIssue,
  onOpenReceipt,
  onOpenTransfer,
  onOpenTour,
  onOpenShare,
  t
}) => {
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch (e) {}
    }
  };

  const actions = [
    {
      id: 'issue',
      label: t?.action_issue || 'Sortie',
      icon: ArrowUpFromLine,
      color: 'text-zinc-900 dark:text-white',
      badge: '⚡',
      badgeColor: 'bg-lime text-zinc-950',
      action: onOpenIssue
    },
    {
      id: 'receipt',
      label: t?.action_receipt || 'Entrée',
      icon: ArrowDownToLine,
      color: 'text-emerald-700 dark:text-emerald-400',
      badge: '+',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      action: onOpenReceipt
    },
    {
      id: 'transfer',
      label: t?.action_transfer || 'Transfert',
      icon: ArrowLeftRight,
      color: 'text-blue-700 dark:text-blue-400',
      action: onOpenTransfer
    },
    {
      id: 'tour',
      label: t?.btn_tour_item || 'Visite 360°',
      icon: Camera,
      color: 'text-purple-700 dark:text-purple-400',
      action: onOpenTour
    },
    {
      id: 'share',
      label: 'Partager',
      icon: Share2,
      color: 'text-zinc-700 dark:text-zinc-300',
      action: onOpenShare
    }
  ];

  return (
    <div className="md:hidden mb-5">
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
          Actions Rapides d'Atelier
        </span>
        <span className="text-[10px] font-mono text-zinc-400">Tactile</span>
      </div>

      {/* Horizontal row of tactile squircles (Inspired by reference image top row) */}
      <div className="flex items-center justify-between gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        {actions.map(act => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={() => {
                triggerHaptic();
                act.action?.();
              }}
              className="flex-1 min-w-[62px] flex flex-col items-center group active:scale-90 transition-transform"
            >
              {/* Tactile 3D Squircle (Inspired by user's reference image) */}
              <div className="relative w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border border-white/90 dark:border-zinc-800 shadow-[0_8px_18px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)] flex items-center justify-center transition-all group-hover:shadow-[0_10px_22px_rgba(0,0,0,0.1)]">
                <Icon className={`w-6 h-6 stroke-[2] ${act.color} transition-transform group-hover:scale-110`} />
                {act.badge && (
                  <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${act.badgeColor} text-[9px] font-mono font-bold flex items-center justify-center shadow-2xs`}>
                    {act.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono font-semibold text-zinc-600 dark:text-zinc-400 mt-1.5 truncate max-w-[64px]">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default MobileActionGrid;
