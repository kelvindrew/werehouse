import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage responsive view modes ('cards' vs 'table').
 * 
 * Key behavior:
 * - On mobile viewports (< 768px), ALWAYS defaults to 'cards' (portrait mobile view).
 * - Avoids reading desktop 'table' preferences when viewed on a phone.
 * - If on mobile, overrides localStorage so stale desktop preferences don't force wide landscape tables.
 * - Allows explicit switching, but keeps mobile preference scoped so it doesn't break desktop or vice-versa.
 */
export function useResponsiveViewMode(storageKey: string) {
  const [viewMode, setViewModeState] = useState<'cards' | 'table'>(() => {
    try {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      if (isMobile) {
        // Clean up any stale desktop 'table' preference that might have contaminated mobile
        try {
          if (localStorage.getItem(storageKey) === 'table') {
            localStorage.setItem(storageKey, 'cards');
          }
        } catch {}

        const mobilePref = sessionStorage.getItem(`${storageKey}_mobile`);
        return mobilePref === 'table' ? 'table' : 'cards';
      }

      const saved = localStorage.getItem(storageKey);
      return saved === 'table' ? 'table' : 'cards';
    } catch {
      return 'cards';
    }
  });

  // Keep responsive on viewport resize / device orientation changes
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        const mobilePref = sessionStorage.getItem(`${storageKey}_mobile`);
        if (!mobilePref && viewMode !== 'cards') {
          setViewModeState('cards');
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [storageKey, viewMode]);

  const setViewMode = useCallback((mode: 'cards' | 'table') => {
    setViewModeState(mode);
    try {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      if (isMobile) {
        sessionStorage.setItem(`${storageKey}_mobile`, mode);
      } else {
        localStorage.setItem(storageKey, mode);
      }
    } catch {}
  }, [storageKey]);

  return [viewMode, setViewMode] as const;
}
