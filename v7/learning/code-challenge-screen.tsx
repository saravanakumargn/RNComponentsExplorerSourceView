import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, View } from 'react-native';

import { NativeBadge } from '@/components/native-ui/native-badge';
import { NativeButton } from '@/components/native-ui/native-button';
import { NativeCard } from '@/components/native-ui/native-card';
import { NativeListRow } from '@/components/native-ui/native-list-row';
import { NativeText } from '@/components/native-ui/native-text';
import { getLearningAreaStyle, NATIVE_BACKGROUND } from '@/components/native-ui/native-tokens';

import { CenteredEmptyState, useBottomContentPadding } from '@/components/screen-layout';
import { ContentDemoLink } from '@/features/learning/content-demo-links';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import { getLearningProgressRepository } from '@/features/learning/data/learning-progress-repository';
import type { CodeChallenge } from '@/features/learning/data/learning-types';
import { getFreeItemCount, isItemUnlocked } from '@/features/learning/learning-access-policy';
import { LearningEmptyState } from '@/features/learning/learning-empty-state';
import { InlineCodeText } from '@/features/learning/inline-code';
import { LearningCodeBlock } from '@/features/learning/learning-code-block';
import { LearningRowLink } from '@/features/learning/learning-row-link';
import { getLearningNavigationAccessibility } from '@/features/learning/learning-navigation-accessibility';
import { useSubscription } from '@/features/purchases/use-subscription';

const { symbol: CHALLENGE_SYMBOL, tint: CHALLENGE_TINT } = getLearningAreaStyle('code-challenges');

const DIFFICULTY_LABELS = ['', 'Beginner', 'Intermediate', 'Advanced'] as const;

export function CodeChallengeListScreen() {
  const database = useSQLiteContext();
  const [challenges, setChallenges] = useState<CodeChallenge[] | null>(null);
  const [solved, setSolved] = useState<number[]>([]);
  const { learningUnlocked } = useSubscription();
  const bottomPadding = useBottomContentPadding(32);

  useEffect(() => {
    void createLearningContentRepository(database).getCodeChallenges().then(setChallenges).catch(() => setChallenges([]));
    void getLearningProgressRepository().then((progress) => progress.getSolvedChallengeIds()).then(setSolved).catch(() => undefined);
  }, [database]);

  if (!challenges) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading code challenges" /></CenteredEmptyState>;
  const freeCount = getFreeItemCount(challenges.length);

  return (
    <FlatList
      testID="code-challenges-ready"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ gap: 10, padding: 16, paddingBottom: bottomPadding }}
      extraData={solved}
      ListHeaderComponent={
        <View style={{ gap: 6, paddingBottom: 8 }}>
          <NativeText textStyle="title2">Find the bug before you look</NativeText>
          {freeCount > 0 && !learningUnlocked ? <NativeText textStyle="footnote" tone="secondary">{freeCount === 1 ? 'The first challenge is open.' : `The first ${freeCount} challenges are open.`} The one-time library unlock opens the rest.</NativeText> : null}
        </View>
      }
      ListEmptyComponent={<LearningEmptyState testID="code-challenges-empty" title="No challenges yet" message="Code challenges are not part of this release. The quizzes cover the same tracks in a different format." />}
      data={challenges}
      keyExtractor={(item) => String(item.challengeId)}
      renderItem={({ item, index }) => {
        const unlocked = isItemUnlocked(index, challenges.length, learningUnlocked);
        const isSolved = solved.includes(item.challengeId);
        return (
          <LearningRowLink
            href={unlocked ? { pathname: '/code-challenges/[challengeId]', params: { challengeId: item.challengeId } } : null}
            paywallSource="premium_code_challenges_list"
            testID={`code-challenge-${index}`}
            accessibilityLabel={getLearningNavigationAccessibility({ title: item.title, destination: 'code challenge', locked: !unlocked })}
            accessibilityHint={unlocked ? 'Opens code challenge' : 'Opens unlock options'}
          >
            <NativeCard>
              <NativeListRow
                caption={unlocked ? `${DIFFICULTY_LABELS[item.difficulty]} · ${item.estimatedMinutes} min${isSolved ? ' · solved' : ''}` : 'Locked'}
                locked={!unlocked}
                symbol={!unlocked ? 'lock.fill' : isSolved ? 'checkmark.circle.fill' : CHALLENGE_SYMBOL}
                tint={isSolved ? '#34C759' : CHALLENGE_TINT}
                title={item.title}
              />
            </NativeCard>
          </LearningRowLink>
        );
      }}
    />
  );
}

export function CodeChallengeScreen() {
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const database = useSQLiteContext();
  const [challenge, setChallenge] = useState<CodeChallenge | null | undefined>();
  const [hintsShown, setHintsShown] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const bottomPadding = useBottomContentPadding(32);

  useEffect(() => { void createLearningContentRepository(database).getCodeChallenge(Number(challengeId)).then(setChallenge).catch(() => setChallenge(null)); }, [database, challengeId]);

  /*
   * The attempt is recorded when the reader says how it went, not when the fix
   * is revealed. Revealing is how you check an answer you already have, so
   * treating it as a failure would punish the honest path.
   */
  const record = useCallback(async (solvedIt: boolean) => {
    if (!challenge) return;
    const progress = await getLearningProgressRepository();
    await progress.recordChallengeAttempt({ challengeId: challenge.challengeId, solved: solvedIt, hintsUsed: hintsShown });
    setRevealed(true);
  }, [challenge, hintsShown]);

  if (challenge === undefined) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading challenge" /></CenteredEmptyState>;
  if (!challenge) return <CenteredEmptyState><NativeText tone="secondary">This challenge is unavailable.</NativeText></CenteredEmptyState>;

  return (
    <>
      <Stack.Screen options={{ title: challenge.title }} />
      <ScrollView testID="code-challenge-ready" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ gap: 14, padding: 16, paddingBottom: bottomPadding }} style={{ backgroundColor: NATIVE_BACKGROUND }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
          <NativeBadge label={DIFFICULTY_LABELS[challenge.difficulty]} tint={CHALLENGE_TINT} />
          <NativeBadge label={challenge.challengeType} />
        </View>
        <InlineCodeText textStyle="callout">{challenge.brief}</InlineCodeText>

        <NativeText textStyle="headline">The code</NativeText>
        <LearningCodeBlock code={challenge.brokenCode} language={challenge.language} />

        {challenge.hints.slice(0, hintsShown).map((hint, index) => (
          <NativeCard key={hint} padding={12} style={{ gap: 4 }}>
            <NativeText textStyle="caption" tone="tertiary" weight="600">{`Hint ${index + 1}`}</NativeText>
            <InlineCodeText textStyle="footnote">{hint}</InlineCodeText>
          </NativeCard>
        ))}

        {hintsShown < challenge.hints.length && !revealed ? (
          <NativeButton
            onPress={() => setHintsShown((count) => count + 1)}
            style={{ alignSelf: 'flex-start' }}
            symbol="lightbulb"
            testID="challenge-hint"
            title={hintsShown === 0 ? 'Show a hint' : 'Show another hint'}
          />
        ) : null}

        {revealed ? (
          <View testID="challenge-answer" style={{ gap: 10 }}>
            <NativeText textStyle="headline">The fix</NativeText>
            <LearningCodeBlock code={challenge.fixedCode} language={challenge.language} />
            <NativeText textStyle="headline">Why</NativeText>
            <InlineCodeText textStyle="callout">{challenge.explanation}</InlineCodeText>
            {/*
              * Demo links sit inside the answer, never above it. On a challenge
              * about an unbounded list, a link reading "Open the FlashList demo"
              * placed next to the broken code would give the fix away.
              */}
            {challenge.demos.map((demo) => (
              <ContentDemoLink key={demo.demoId} demo={demo} testID={`challenge-demo-${demo.demoId}`} />
            ))}
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <NativeText textStyle="footnote" tone="secondary">Work out the fix first, then say how it went — the answer opens either way.</NativeText>
            <NativeButton onPress={() => { void record(true); }} testID="challenge-solved" title="I found it" variant="filled" />
            <NativeButton onPress={() => { void record(false); }} testID="challenge-stuck" title="Show me the fix" variant="tinted" />
          </View>
        )}
      </ScrollView>
    </>
  );
}
