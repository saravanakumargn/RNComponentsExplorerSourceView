import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';

import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import { getLearningProgressRepository } from '@/features/learning/data/learning-progress-repository';
import type { Checklist, ChecklistItem } from '@/features/learning/data/learning-types';

/**
 * The published checklists, with each one's tick count folded in.
 *
 * Reloaded on focus so a badge reflects ticks made a moment ago on the detail
 * screen.
 */
export function useChecklistList(): { checked: Record<number, number>; checklists: Checklist[] | null } {
  const database = useSQLiteContext();
  const [checklists, setChecklists] = useState<Checklist[] | null>(null);
  const [checked, setChecked] = useState<Record<number, number>>({});

  const load = useCallback(() => {
    let active = true;
    void (async () => {
      const list = await createLearningContentRepository(database).getChecklists();
      if (active) setChecklists(list);
      try {
        const counts = await (await getLearningProgressRepository()).getChecklistCheckedCounts();
        if (active) setChecked(counts);
      } catch {
        // A checklist is still usable when past ticks cannot be read.
        if (active) setChecked({});
      }
    })().catch(() => { if (active) setChecklists([]); });
    return () => { active = false; };
  }, [database]);

  useFocusEffect(load);

  return { checked, checklists };
}

/**
 * One checklist, its items, and the ticks against it.
 *
 * A tick is applied to local state first and written afterwards: the control
 * has to answer the tap immediately, and a write that fails says so in
 * `saveError` rather than silently reverting under the reader's finger.
 */
export function useChecklistDetail(parsedChecklistId: number) {
  const database = useSQLiteContext();
  const [checklist, setChecklist] = useState<Checklist | null | undefined>();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const content = createLearningContentRepository(database);
    void (async () => {
      const [resolved, resolvedItems] = await Promise.all([content.getChecklist(parsedChecklistId), content.getChecklistItems(parsedChecklistId)]);
      if (!active) return;
      setChecklist(resolved);
      setItems(resolvedItems);
      try {
        const ticked = await (await getLearningProgressRepository()).getCheckedChecklistItems(parsedChecklistId);
        if (active) setCheckedIds(new Set(ticked));
      } catch {
        if (active) setSaveError('Your saved ticks could not be read. The checklist is still usable, but ticks may not persist.');
      }
    })().catch(() => { if (active) setChecklist(null); });
    return () => { active = false; };
  }, [database, parsedChecklistId]);

  const toggle = useCallback(async (item: ChecklistItem) => {
    const next = !checkedIds.has(item.itemId);
    setCheckedIds((current) => {
      const updated = new Set(current);
      if (next) updated.add(item.itemId); else updated.delete(item.itemId);
      return updated;
    });
    setSaveError(null);
    try {
      await (await getLearningProgressRepository()).setChecklistItemChecked(parsedChecklistId, item.itemId, next);
    } catch {
      setSaveError('That tick could not be saved to your device.');
    }
  }, [checkedIds, parsedChecklistId]);

  const reset = useCallback(async () => {
    setCheckedIds(new Set());
    setSaveError(null);
    try {
      await (await getLearningProgressRepository()).clearChecklistProgress(parsedChecklistId);
    } catch {
      setSaveError('This checklist could not be reset on your device.');
    }
  }, [parsedChecklistId]);

  return { checkedIds, checklist, items, reset, saveError, toggle };
}
