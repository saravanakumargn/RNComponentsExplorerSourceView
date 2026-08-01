export function isLessonUnlocked(index: number, sectionSize: number, isSubscribed: boolean): boolean {
  if (!Number.isInteger(index) || !Number.isInteger(sectionSize) || index < 0 || sectionSize < 1 || index >= sectionSize) return false;
  if (isSubscribed) return true;
  return sectionSize > 6 ? index < 5 : index === 0;
}

export function isListItemUnlocked(index: number, isSubscribed: boolean): boolean {
  if (!Number.isInteger(index) || index < 0) return false;
  return isSubscribed || index < 10;
}
