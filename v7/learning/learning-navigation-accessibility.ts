type LearningNavigationAccessibilityInput = {
  title: string;
  destination: string;
  locked?: boolean;
};

/**
 * Gives VoiceOver the same state and action that sighted users get from a row's
 * card, status text, and lock icon.
 */
export function getLearningNavigationAccessibility({
  title,
  destination,
  locked = false,
}: LearningNavigationAccessibilityInput): string {
  const accessibleTitle = title.trim() || 'Learning content';
  if (locked) return `${accessibleTitle}. Locked. Opens subscription options.`;
  return `${accessibleTitle}. Available. Opens ${destination}.`;
}
