
export const LESSON_END_THRESHOLD = 24;

export function createLessonCompletionGate() {
  let completionStarted = false;

  return {
    tryBegin(): boolean {
      if (completionStarted) return false;
      completionStarted = true;
      return true;
    },
    reset(): void {
      completionStarted = false;
    },
  };
}

type ReaderScrollMetrics = {
  contentOffsetY: number;
  viewportHeight: number;
  contentHeight: number;
};

export function isLessonEndReached({ contentOffsetY, viewportHeight, contentHeight }: ReaderScrollMetrics): boolean {
  if (![contentOffsetY, viewportHeight, contentHeight].every(Number.isFinite)) return false;
  if (contentOffsetY < 0 || viewportHeight <= 0 || contentHeight <= 0) return false;
  return contentOffsetY + viewportHeight >= contentHeight - LESSON_END_THRESHOLD;
}

export function hasReadableLessonContent(contentBody: string): boolean {
  return contentBody.trim().length > 0;
}

export function getLessonCompletionFeedback(completed: boolean): string | null {
  return completed ? 'Lesson completed. Your progress has been updated.' : null;
}

export function getLessonProgressUnavailableFeedback(): string {
  return 'Your saved progress could not be restored. The lesson is still available offline.';
}

export function getLearningReaderFontSize(fontScale: number): number {
  if (!Number.isFinite(fontScale) || fontScale <= 0) return 18;
  return Math.min(36, Math.max(16, Math.round(18 * fontScale)));
}
