import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'catalog.pinnedLibraryIds';

/** Persists pinned library ids to AsyncStorage so pins survive app restarts. */
export function usePinnedLibraries() {
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setPinnedIds(parsed.filter((id): id is string => typeof id === 'string'));
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setIsLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const togglePin = useCallback((libraryId: string) => {
    setPinnedIds((current) => {
      const next = current.includes(libraryId)
        ? current.filter((id) => id !== libraryId)
        : [...current, libraryId];
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isPinned = useCallback((libraryId: string) => pinnedIds.includes(libraryId), [pinnedIds]);

  return { isLoaded, pinnedIds, isPinned, togglePin };
}
