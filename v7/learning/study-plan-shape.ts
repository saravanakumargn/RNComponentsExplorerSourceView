/**
 * "4 weeks · 17 items · 3h 10m" — the three facts that decide whether someone
 * starts a plan, in the order they ask them.
 *
 * Lives apart from the screen so it can be unit tested: importing the screen
 * would pull in React Native, which does not resolve under vitest.
 */
export function formatPlanShape({ targetWeeks, itemCount, totalMinutes }: { targetWeeks: number; itemCount: number; totalMinutes: number }): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const time = hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}` : `${minutes}m`;
  return `${targetWeeks} week${targetWeeks === 1 ? '' : 's'} · ${itemCount} item${itemCount === 1 ? '' : 's'} · ${time}`;
}
