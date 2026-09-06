import { trackPaywallImpression } from '@/features/telemetry/telemetry';

/**
 * Single integration point for the premium_* events the old app recorded
 * (setAnalyticsEvent calls in ContentsSubTopicList/InterviewQuestionsList/faqList).
 *
 * These are the paywall impressions: every one of them is a reader who reached
 * a lock. With the offer split into a library purchase and a tip, this is the
 * only measurement of how often the lock is actually hit, so it forwards to
 * Firebase rather than staying a placeholder.
 */
export function trackPremiumEvent(eventName: string): void {
  trackPaywallImpression(eventName);
}
