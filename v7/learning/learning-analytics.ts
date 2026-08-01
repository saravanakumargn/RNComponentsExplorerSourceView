/**
 * Single integration point for the old app's premium_* analytics events
 * (setAnalyticsEvent calls in ContentsSubTopicList/InterviewQuestionsList/faqList).
 * No analytics SDK is wired into this app yet — this is a no-op placeholder so
 * call sites don't need to change again once one is added.
 */
export function trackPremiumEvent(eventName: string): void {
  if (__DEV__) {
    console.debug(`[learning-analytics] ${eventName}`);
  }
  // TODO: forward to an analytics SDK once one is added to this app.
}
