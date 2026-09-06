import { describe, expect, it } from 'vitest';

import type { ChecklistItem } from './data/learning-types';
import {
  formatChecklistBadge,
  formatChecklistProgress,
  formatCheatSheetSize,
  getChecklistSeverityLabel,
  summarizeChecklist,
} from './checklist-progress';

function item(itemId: number, severity: ChecklistItem['severity']): ChecklistItem {
  return { itemId, checklistId: 1501, position: itemId, label: `Item ${itemId}`, detail: 'Detail', severity };
}

const ITEMS = [item(1, 'required'), item(2, 'required'), item(3, 'recommended'), item(4, 'optional')];

describe('checklist progress', () => {
  it('counts every tick but decides completion on required items alone', () => {
    expect(summarizeChecklist(ITEMS, [1, 2])).toMatchObject({ total: 4, checked: 2, requiredTotal: 2, requiredChecked: 2, percent: 50, complete: true });
    expect(summarizeChecklist(ITEMS, [1, 3, 4])).toMatchObject({ checked: 3, requiredChecked: 1, percent: 75, complete: false });
  });

  it('never treats an empty checklist as finished', () => {
    expect(summarizeChecklist([], [])).toEqual({ total: 0, checked: 0, requiredTotal: 0, requiredChecked: 0, percent: 0, complete: false });
  });

  it('is complete with no required items only once it has items at all', () => {
    const advisory = [item(1, 'recommended'), item(2, 'optional')];
    expect(summarizeChecklist(advisory, []).complete).toBe(true);
    expect(summarizeChecklist(advisory, []).percent).toBe(0);
  });

  it('ignores a tick for an item that is no longer on the checklist', () => {
    expect(summarizeChecklist(ITEMS, [1, 2, 999])).toMatchObject({ checked: 2, percent: 50 });
  });

  it('says what is left rather than only how far along the reader is', () => {
    expect(formatChecklistProgress(summarizeChecklist(ITEMS, [1]))).toBe('1 of 4 done · 1 required left');
    expect(formatChecklistProgress(summarizeChecklist(ITEMS, [1, 2]))).toBe('2 of 4 done · every required item covered');
    expect(formatChecklistProgress(summarizeChecklist([], []))).toBe('No items yet');
  });

  it('badges a checklist only once it has been started, and never past its own length', () => {
    expect(formatChecklistBadge(0, 15)).toBeNull();
    expect(formatChecklistBadge(4, 15)).toBe('4 of 15 ticked');
    expect(formatChecklistBadge(15, 15)).toBe('All ticked');
    expect(formatChecklistBadge(99, 15)).toBe('All ticked');
    expect(formatChecklistBadge(1, 0)).toBeNull();
  });

  it('names each severity for the row label and the screen reader', () => {
    expect(getChecklistSeverityLabel('required')).toBe('Required');
    expect(getChecklistSeverityLabel('recommended')).toBe('Recommended');
    expect(getChecklistSeverityLabel('optional')).toBe('Optional');
  });

  it('sizes a cheat sheet by its sections, with a matching plural', () => {
    expect(formatCheatSheetSize(1)).toBe('1 section');
    expect(formatCheatSheetSize(12)).toBe('12 sections');
  });
});
