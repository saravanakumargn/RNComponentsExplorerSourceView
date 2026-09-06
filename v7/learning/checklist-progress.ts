import type { ChecklistItem } from '@/features/learning/data/learning-types';

export type ChecklistSummary = {
  total: number;
  checked: number;
  requiredTotal: number;
  requiredChecked: number;
  /** Whole percent of all items ticked, which is what the progress bar shows. */
  percent: number;
  /**
   * True only when every required item is ticked. Recommended and optional
   * items are advice, and treating them as blockers would make a checklist
   * something readers abandon rather than finish.
   */
  complete: boolean;
};

const SEVERITY_LABELS: Record<ChecklistItem['severity'], string> = {
  required: 'Required',
  recommended: 'Recommended',
  optional: 'Optional',
};

export function summarizeChecklist(items: ChecklistItem[], checkedItemIds: Iterable<number>): ChecklistSummary {
  const checkedIds = new Set(checkedItemIds);
  // Only ticks belonging to this checklist count. A stale row for an item that
  // is no longer published must not push the count above the list on screen.
  const checked = items.filter((item) => checkedIds.has(item.itemId)).length;
  const required = items.filter((item) => item.severity === 'required');
  const requiredChecked = required.filter((item) => checkedIds.has(item.itemId)).length;
  return {
    total: items.length,
    checked,
    requiredTotal: required.length,
    requiredChecked,
    percent: items.length === 0 ? 0 : Math.round((checked / items.length) * 100),
    complete: items.length > 0 && requiredChecked === required.length,
  };
}

export function getChecklistSeverityLabel(severity: ChecklistItem['severity']): string {
  return SEVERITY_LABELS[severity];
}

/** The line under a checklist title, both in the list and on the checklist itself. */
export function formatChecklistProgress(summary: ChecklistSummary): string {
  if (summary.total === 0) return 'No items yet';
  const progress = `${summary.checked} of ${summary.total} done`;
  if (summary.requiredTotal === 0) return progress;
  return summary.complete ? `${progress} · every required item covered` : `${progress} · ${summary.requiredTotal - summary.requiredChecked} required left`;
}

/** The badge on a checklist row before it is opened. */
export function formatChecklistBadge(checkedCount: number, itemCount: number): string | null {
  if (itemCount <= 0 || checkedCount <= 0) return null;
  return checkedCount >= itemCount ? 'All ticked' : `${Math.min(checkedCount, itemCount)} of ${itemCount} ticked`;
}

export function formatCheatSheetSize(sectionCount: number): string {
  return `${sectionCount} ${sectionCount === 1 ? 'section' : 'sections'}`;
}
