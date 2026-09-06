import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, FlatList, Pressable, ScrollView, View } from 'react-native';

import { NativeBadge } from '@/components/native-ui/native-badge';
import { NativeCard } from '@/components/native-ui/native-card';
import { NativeListRow } from '@/components/native-ui/native-list-row';
import { NativeText } from '@/components/native-ui/native-text';
import { NATIVE_BACKGROUND, NATIVE_TINT } from '@/components/native-ui/native-tokens';
import { CenteredEmptyState, useBottomContentPadding } from '@/components/screen-layout';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import type { DesignScenario, DesignScenarioStageName, DesignScenarioSummary } from '@/features/learning/data/learning-types';
import { InlineCodeText } from '@/features/learning/inline-code';
import { getFreeItemCount, isItemUnlocked } from '@/features/learning/learning-access-policy';
import { LearningEmptyState } from '@/features/learning/learning-empty-state';
import { LearningRowLink } from '@/features/learning/learning-row-link';
import { getLearningNavigationAccessibility } from '@/features/learning/learning-navigation-accessibility';
import { useSubscription } from '@/features/purchases/use-subscription';

/** iOS system green and red: a strong answer and a weak one are states. */
const PASS = '#34C759';
const FAIL = '#FF3B30';

const LEVEL_LABELS = ['', 'Beginner', 'Intermediate', 'Advanced'] as const;

/** The schema fixes the five stages; these are what a reader should see. */
const STAGE_LABELS: Record<DesignScenarioStageName, string> = {
  requirements: 'Requirements',
  estimation: 'Estimation',
  architecture: 'Architecture',
  data: 'Data',
  'trade-offs': 'Trade-offs',
};

export function DesignScenarioListScreen() {
  const database = useSQLiteContext();
  const [scenarios, setScenarios] = useState<DesignScenarioSummary[] | null>(null);
  const { learningUnlocked } = useSubscription();
  const bottomPadding = useBottomContentPadding(32);

  useEffect(() => {
    void createLearningContentRepository(database).getDesignScenarios().then(setScenarios).catch(() => setScenarios([]));
  }, [database]);

  if (!scenarios) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading system design scenarios" /></CenteredEmptyState>;
  const freeCount = getFreeItemCount(scenarios.length);

  return (
    <FlatList
      testID="design-scenarios-ready"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ gap: 10, padding: 16, paddingBottom: bottomPadding }}
      ListHeaderComponent={
        <View style={{ gap: 6, paddingBottom: 8 }}>
          <NativeText textStyle="title2">Open questions, worked in stages</NativeText>
          <NativeText selectable textStyle="footnote" tone="secondary">Answer each stage yourself before revealing a model answer, then score yourself against what an interviewer is actually weighing.</NativeText>
          {freeCount > 0 && !learningUnlocked ? <NativeText textStyle="footnote" tone="secondary">{freeCount === 1 ? 'The first scenario is open.' : `The first ${freeCount} scenarios are open.`} The one-time library unlock opens the rest.</NativeText> : null}
        </View>
      }
      ListEmptyComponent={<LearningEmptyState testID="design-scenarios-empty" title="No scenarios yet" message="System design scenarios are not part of this release. The interview prep bank covers the questions that have single answers." />}
      data={scenarios}
      keyExtractor={(item) => String(item.scenarioId)}
      renderItem={({ item, index }) => {
        const unlocked = isItemUnlocked(index, scenarios.length, learningUnlocked);
        return (
          <LearningRowLink
            href={unlocked ? { pathname: '/system-design/[scenarioId]', params: { scenarioId: item.scenarioId } } : null}
            paywallSource="premium_design_scenarios_list"
            testID={`design-scenario-${index}`}
            accessibilityLabel={getLearningNavigationAccessibility({ title: item.title, destination: 'design scenario', locked: !unlocked })}
            accessibilityHint={unlocked ? 'Opens scenario' : 'Opens unlock options'}
          >
            <NativeCard style={{ gap: 8 }}>
                <NativeListRow
                  caption={unlocked ? `${LEVEL_LABELS[item.level]} · ${item.stageCount} stages` : 'Locked'}
                  locked={!unlocked}
                  symbol={unlocked ? 'point.topleft.down.to.point.bottomright.curvepath' : 'lock.fill'}
                  title={item.title}
                />
                {unlocked ? <NativeText selectable textStyle="footnote" tone="secondary">{item.brief}</NativeText> : null}
            </NativeCard>
          </LearningRowLink>
        );
      }}
    />
  );
}

export function DesignScenarioScreen() {
  const { scenarioId } = useLocalSearchParams<{ scenarioId: string }>();
  const database = useSQLiteContext();
  const [scenario, setScenario] = useState<DesignScenario | null | undefined>();
  const [revealed, setRevealed] = useState<number[]>([]);
  const bottomPadding = useBottomContentPadding(32);

  useEffect(() => {
    void createLearningContentRepository(database).getDesignScenario(Number(scenarioId)).then(setScenario).catch(() => setScenario(null));
  }, [database, scenarioId]);

  /*
   * Reveal state is deliberately not persisted. A scenario is worked in one
   * sitting and re-worked later with a different answer, so remembering which
   * answers were shown last time would restore the version of the screen that
   * is least useful to come back to.
   */
  const reveal = useCallback((position: number) => {
    setRevealed((current) => (current.includes(position) ? current : [...current, position]));
  }, []);

  if (scenario === undefined) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading scenario" /></CenteredEmptyState>;
  if (!scenario) return <CenteredEmptyState><NativeText tone="secondary">This scenario is unavailable.</NativeText></CenteredEmptyState>;

  return (
    <>
      <Stack.Screen options={{ title: scenario.title }} />
      <ScrollView testID="design-scenario-ready" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ gap: 14, padding: 16, paddingBottom: bottomPadding }} style={{ backgroundColor: NATIVE_BACKGROUND }}>
        <View style={{ gap: 8 }}>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
            <NativeBadge label={LEVEL_LABELS[scenario.level]} />
            <NativeText textStyle="footnote" tone="secondary">{`${scenario.stageCount} stages`}</NativeText>
          </View>
          <NativeText selectable textStyle="callout">{scenario.brief}</NativeText>
        </View>

        <NativeCard style={{ gap: 4 }}>
            <NativeText textStyle="footnote" tone="secondary" weight="600">Constraints</NativeText>
            <InlineCodeText textStyle="footnote">{scenario.constraints}</InlineCodeText>
        </NativeCard>

        {scenario.stages.map((stage) => {
          const shown = revealed.includes(stage.position);
          return (
            <NativeCard key={stage.position} style={{ gap: 10 }} testID={`design-scenario-stage-${stage.position}`}>
                <NativeText style={{ color: NATIVE_TINT }} textStyle="footnote" weight="600">{`${stage.position}. ${STAGE_LABELS[stage.stage]}`}</NativeText>
                <InlineCodeText textStyle="callout">{stage.prompt}</InlineCodeText>
                {shown ? (
                  <View style={{ backgroundColor: `${NATIVE_TINT}14`, borderCurve: 'continuous', borderRadius: 12, gap: 4, padding: 12 }}>
                    <NativeText style={{ color: NATIVE_TINT }} textStyle="footnote" weight="600">A strong answer</NativeText>
                    <InlineCodeText textStyle="footnote">{stage.modelAnswer}</InlineCodeText>
                  </View>
                ) : (
                  /*
                    The answer is hidden until asked for, because a scenario whose
                    answers are visible while you read the prompt is an article
                    rather than practice.
                  */
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Show a strong answer for ${STAGE_LABELS[stage.stage]}`}
                    accessibilityHint="Reveals the model answer for this stage"
                    onPress={() => reveal(stage.position)}
                    style={({ pressed }) => ({ alignItems: 'center', backgroundColor: `${NATIVE_TINT}14`, borderCurve: 'continuous', borderRadius: 10, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 44, opacity: pressed ? 0.55 : 1, paddingHorizontal: 12 })}
                    testID={`design-scenario-reveal-${stage.position}`}
                  >
                    <SymbolView name="eye" size={17} tintColor={NATIVE_TINT} weight="semibold" />
                    <NativeText style={{ color: NATIVE_TINT }} textStyle="subheadline" weight="600">Answer it first, then show one</NativeText>
                  </Pressable>
                )}
            </NativeCard>
          );
        })}

        <View style={{ gap: 6, paddingTop: 4 }}>
          <NativeText textStyle="headline">What is being scored</NativeText>
          <NativeText selectable textStyle="footnote" tone="secondary">Each criterion with the answer that lands well and the one that does not.</NativeText>
        </View>

        {scenario.rubric.map((entry) => (
          <NativeCard key={entry.position} style={{ gap: 10 }} testID={`design-scenario-criterion-${entry.position}`}>
              <NativeText textStyle="headline">{entry.criterion}</NativeText>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <SymbolView name="checkmark.circle.fill" size={17} tintColor={PASS} />
                <InlineCodeText style={{ flex: 1 }} textStyle="footnote">{entry.strongAnswer}</InlineCodeText>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <SymbolView name="xmark.circle.fill" size={17} tintColor={FAIL} />
                <InlineCodeText style={{ flex: 1 }} textStyle="footnote">{entry.weakAnswer}</InlineCodeText>
              </View>
          </NativeCard>
        ))}
      </ScrollView>
    </>
  );
}
