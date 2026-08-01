export type LearningTopicState = 'not-started' | 'in-progress' | 'completed';

export function learningProgressPercent(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((Math.max(0, Math.min(completed, total)) / total) * 100);
}

export function learningTopicState(completed: number, total: number): LearningTopicState {
  if (completed <= 0 || total <= 0) return 'not-started';
  return completed >= total ? 'completed' : 'in-progress';
}
