/**
 * "7 steps · about 4 hours" — what someone needs before deciding to start.
 *
 * Hours are deliberately vague where the study plan's minutes are exact. A plan
 * sums per-item estimates that each mean something; a project's hours are one
 * authored guess, and rendering a guess as "4h 00m" claims a precision it does
 * not have.
 *
 * Lives apart from the screen so it can be unit tested: importing the screen
 * would pull in React Native, which does not resolve under vitest.
 */
export function formatProjectShape({ stepCount, estimatedHours }: { stepCount: number; estimatedHours: number }): string {
  return `${stepCount} step${stepCount === 1 ? '' : 's'} · about ${estimatedHours} hour${estimatedHours === 1 ? '' : 's'}`;
}

/** "3 of 7 steps done", or nothing at all before the first tick. */
export function formatProjectProgress(done: number, stepCount: number): string {
  return `${done} of ${stepCount} step${stepCount === 1 ? '' : 's'} done`;
}
