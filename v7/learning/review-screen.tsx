import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { NativeButton } from '@/components/native-ui/native-button';
import { NativeCard } from '@/components/native-ui/native-card';
import { NativeProgressBar } from '@/components/native-ui/native-progress-bar';
import { NativeText } from '@/components/native-ui/native-text';
import { getLearningAreaStyle, NATIVE_COLORS } from '@/components/native-ui/native-tokens';

import { CenteredEmptyState } from '@/components/screen-layout';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import { getLearningProgressRepository } from '@/features/learning/data/learning-progress-repository';
import type { ReviewItem, ReviewRecord } from '@/features/learning/data/learning-types';
import { InlineCodeText } from '@/features/learning/inline-code';
import { LearningEmptyState } from '@/features/learning/learning-empty-state';
import {
  formatReviewBacklog,
  formatSessionSize,
  reviewDueCutoff,
  reviewKeyId,
  scheduleNextReview,
  selectReviewSession,
  type ReviewRating,
  type ReviewSessionPlan,
} from '@/features/learning/review-scheduling';
import { useSubscription } from '@/features/purchases/use-subscription';

type ReviewPhase = 'overview' | 'session' | 'summary';
type RatingTally = Record<ReviewRating, number>;

const EMPTY_TALLY: RatingTally = { 0: 0, 1: 0, 2: 0, 3: 0 };

/**
 * The four judgements the scheduler understands. Wording is about recall rather
 * than about difficulty ("Again" is not a failure, it is a request to see the
 * card once more this sitting).
 */
const { tint: REVIEW_TINT } = getLearningAreaStyle('review');

const RATINGS: { rating: ReviewRating; label: string; hint: string; colour: string }[] = [
  { rating: 0, label: 'Again', hint: 'Comes back later in this session', colour: '#B3261E' },
  { rating: 1, label: 'Hard', hint: 'Recalled, but slowly', colour: '#8A5000' },
  { rating: 2, label: 'Good', hint: 'Recalled', colour: '#005AC1' },
  { rating: 3, label: 'Easy', hint: 'Instant — push it further out', colour: '#18723A' },
];

const SOURCE_LABEL = { flashcard: 'FLASHCARD', interview_question: 'INTERVIEW QUESTION' } as const;

export function ReviewScreen() {
  const database = useSQLiteContext();
  const [plan, setPlan] = useState<ReviewSessionPlan | null | undefined>();
  const [scheduled, setScheduled] = useState(0);
  const [phase, setPhase] = useState<ReviewPhase>('overview');
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [sessionSize, setSessionSize] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [tally, setTally] = useState<RatingTally>(EMPTY_TALLY);
  const [saveError, setSaveError] = useState<string | null>(null);
  /**
   * The scheduler state for cards rated in this session, kept in a ref rather
   * than in state: an "Again" card is rated twice in one sitting and the second
   * rating must build on the first, but nothing on screen depends on it.
   */
  const recordsById = useRef(new Map<string, ReviewRecord>());
  /**
   * Held across a rating so two taps landing in the same frame cannot retire
   * two cards for one judgement — the second tap would otherwise run against
   * the queue React has not re-rendered yet.
   */
  const rating = useRef(false);

  /** The deck is built from what this reader can also read. */
  const { learningUnlocked } = useSubscription();

  const loadOverview = useCallback(() => {
    let active = true;
    void (async () => {
      const keys = await createLearningContentRepository(database).getReviewItemKeys(learningUnlocked);
      let records: ReviewRecord[] = [];
      try {
        records = await (await getLearningProgressRepository()).getReviewRecords();
      } catch {
        // A first session is still possible when past reviews cannot be read.
        records = [];
      }
      if (!active) return;
      recordsById.current = new Map(records.map((record) => [reviewKeyId(record), record]));
      setScheduled(records.length);
      setPlan(selectReviewSession(keys, records, reviewDueCutoff(new Date())));
    })().catch(() => { if (active) setPlan(null); });
    return () => { active = false; };
  }, [database, learningUnlocked]);

  /** Reload on focus so a session finished a moment ago is reflected here. */
  useFocusEffect(useCallback(() => {
    if (phase === 'overview') return loadOverview();
    return undefined;
  }, [loadOverview, phase]));

  useEffect(() => {
    if (phase === 'session' && queue.length === 0) setPhase('summary');
  }, [phase, queue.length]);

  const start = useCallback(async () => {
    if (!plan || plan.keys.length === 0) return;
    let items: ReviewItem[] = [];
    try {
      items = await createLearningContentRepository(database).getReviewItems(plan.keys);
    } catch {
      setPlan(null);
      return;
    }
    if (items.length === 0) return;
    setQueue(items);
    setSessionSize(items.length);
    setTally(EMPTY_TALLY);
    setRevealed(false);
    setSaveError(null);
    setPhase('session');
  }, [database, plan]);

  const rate = useCallback(async (value: ReviewRating) => {
    const item = queue[0];
    if (!item || rating.current) return;
    rating.current = true;
    const reviewedAt = new Date();
    const id = reviewKeyId(item);
    const schedule = scheduleNextReview(recordsById.current.get(id) ?? null, value, reviewedAt);
    recordsById.current.set(id, { itemType: item.itemType, itemId: item.itemId, reviewedAt: reviewedAt.toISOString(), rating: value, ...schedule });

    setTally((current) => ({ ...current, [value]: current[value] + 1 }));
    setRevealed(false);
    // "Again" returns the card to the back of this session rather than to
    // tomorrow, which is the whole difference between it and "Hard".
    setQueue((current) => (value === 0 ? [...current.slice(1), current[0]] : current.slice(1)));

    try {
      await (await getLearningProgressRepository()).recordReview(item, { rating: value, ...schedule }, reviewedAt.toISOString());
    } catch {
      setSaveError('This session could not be saved to your device. Your ratings still apply until you leave the screen.');
    } finally {
      rating.current = false;
    }
  }, [queue]);

  /** Returning to the overview re-runs the focus effect, which reloads the plan. */
  const finish = useCallback(() => { setPhase('overview'); setPlan(undefined); }, []);

  if (plan === undefined) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading review" /></CenteredEmptyState>;
  if (plan === null) return <CenteredEmptyState><NativeText tone="secondary">Review is unavailable.</NativeText></CenteredEmptyState>;

  if (phase === 'summary') {
    const rated = RATINGS.reduce((total, entry) => total + tally[entry.rating], 0);
    return (
      <ScrollView testID="review-summary-ready" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ gap: 12, padding: 16, paddingBottom: 32 }}>
        <NativeCard accent={REVIEW_TINT} padding={18} style={{ gap: 8 }}>
            <NativeText style={{ color: REVIEW_TINT }} textStyle="footnote" weight="600">Session complete</NativeText>
            <NativeText textStyle="title2">{sessionSize} {sessionSize === 1 ? 'card' : 'cards'} reviewed</NativeText>
            <NativeText selectable textStyle="footnote" tone="secondary">
              {tally[0] > 0
                ? `${tally[0]} ${tally[0] === 1 ? 'card came' : 'cards came'} back for another look before the end. Each card is now scheduled by how well you recalled it.`
                : 'Each card is now scheduled by how well you recalled it, and the next batch is waiting whenever you are.'}
            </NativeText>
            <NativeButton onPress={finish} testID="review-done" title="Back to review" variant="filled" />
        </NativeCard>
        {saveError ? <NativeText accessibilityLiveRegion="polite" selectable textStyle="footnote" tone="destructive">{saveError}</NativeText> : null}
        <NativeCard style={{ gap: 8 }}>
            <NativeText textStyle="headline">{rated} {rated === 1 ? 'rating' : 'ratings'} in this session</NativeText>
            {RATINGS.map((entry) => (
              <View key={entry.rating} style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
                <View accessible={false} style={{ backgroundColor: entry.colour, borderRadius: 6, height: 10, width: 10 }} />
                <NativeText style={{ flex: 1 }} textStyle="subheadline">{entry.label}</NativeText>
                <NativeText textStyle="subheadline" tone="secondary">{tally[entry.rating]}</NativeText>
              </View>
            ))}
        </NativeCard>
      </ScrollView>
    );
  }

  if (phase === 'session') {
    const item = queue[0];
    if (!item) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Finishing session" /></CenteredEmptyState>;
    const done = sessionSize - queue.length;
    return (
      <View testID="review-session-ready" style={{ flex: 1 }}>
        <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ gap: 12, padding: 16, paddingBottom: 24 }}>
          <NativeText textStyle="footnote" tone="secondary" weight="600">{SOURCE_LABEL[item.itemType]} · {done + 1} of {sessionSize}</NativeText>
          <NativeProgressBar accessibilityLabel={`${done} of ${sessionSize} cards reviewed`} progress={sessionSize === 0 ? 0 : done / sessionSize} tint={REVIEW_TINT} />
          <NativeCard padding={18} style={{ gap: 10 }}>
              <InlineCodeText textStyle="title3">{item.front}</InlineCodeText>
              {revealed ? (
                <>
                  <View accessible={false} style={{ backgroundColor: NATIVE_COLORS.separator, height: 1 }} />
                  <InlineCodeText testID="review-answer" textStyle="callout">{item.back}</InlineCodeText>
                </>
              ) : null}
          </NativeCard>
          {revealed ? <NativeText selectable textStyle="footnote" tone="secondary">Rate how easily you recalled it. That rating, not a clock, decides when the card comes back.</NativeText> : null}
        </ScrollView>
        <View style={{ gap: 8, padding: 12 }}>
          {revealed ? (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {RATINGS.map((entry) => (
                <NativeButton
                  accessibilityLabel={`${entry.label}. ${entry.hint}.`}
                  key={entry.rating}
                  onPress={() => void rate(entry.rating)}
                  style={{ flex: 1 }}
                  testID={`review-rate-${entry.rating}`}
                  title={entry.label}
                  variant={entry.rating === 2 ? 'filled' : 'tinted'}
                />
              ))}
            </View>
          ) : (
            <NativeButton onPress={() => setRevealed(true)} testID="review-reveal" title="Show answer" variant="filled" />
          )}
        </View>
      </View>
    );
  }

  return (
    <ScrollView testID="review-ready" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ gap: 12, padding: 16, paddingBottom: 32 }}>
      <View style={{ gap: 6, paddingBottom: 4 }}>
        <NativeText textStyle="title2">Keep what you learned</NativeText>
        <NativeText selectable textStyle="footnote" tone="secondary">Flashcards and interview questions share one schedule, so a single session covers whatever is due across both.</NativeText>
      </View>
      {plan.keys.length === 0 ? (
        <LearningEmptyState
          testID="review-empty"
          title="Nothing due today"
          message={plan.newAvailable === 0 && plan.dueAvailable === 0 ? 'Every card is scheduled ahead. Come back tomorrow and the ones falling due will be waiting here.' : 'No cards are ready yet. Come back tomorrow.'}
        />
      ) : (
        <NativeCard accent={REVIEW_TINT} padding={18} style={{ gap: 10 }}>
            <NativeText style={{ color: REVIEW_TINT }} textStyle="footnote" weight="600">{formatReviewBacklog(plan)}</NativeText>
            <NativeText textStyle="title2">{formatSessionSize(plan)}</NativeText>
            <NativeText selectable textStyle="footnote" tone="secondary">{plan.dueCount} due · {plan.newCount} new in this session.</NativeText>
            <NativeButton onPress={() => void start()} testID="review-start" title="Start review" variant="filled" />
        </NativeCard>
      )}
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
        <SymbolView name="arrow.down.circle.fill" size={16} tintColor={NATIVE_COLORS.tertiaryLabel} />
        <NativeText selectable textStyle="footnote" tone="secondary">Saved on this device · {scheduled.toLocaleString('en-US')} {scheduled === 1 ? 'card' : 'cards'} in your schedule</NativeText>
      </View>
    </ScrollView>
  );
}
