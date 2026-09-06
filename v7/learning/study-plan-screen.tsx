import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, FlatList, Pressable, ScrollView, View } from 'react-native';

import { NativeBadge } from '@/components/native-ui/native-badge';
import { NativeCard } from '@/components/native-ui/native-card';
import { NativeListRow } from '@/components/native-ui/native-list-row';
import { NativeProgressBar } from '@/components/native-ui/native-progress-bar';
import { NativeText } from '@/components/native-ui/native-text';
import { getLearningAreaStyle, NATIVE_BACKGROUND } from '@/components/native-ui/native-tokens';

import { CenteredEmptyState, useBottomContentPadding } from '@/components/screen-layout';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import { getLearningProgressRepository } from '@/features/learning/data/learning-progress-repository';
import type { StudyPlan, StudyPlanItem, StudyPlanSummary } from '@/features/learning/data/learning-types';
import { getFreeItemCount, isItemUnlocked } from '@/features/learning/learning-access-policy';
import { LearningEmptyState } from '@/features/learning/learning-empty-state';
import { LearningRowLink } from '@/features/learning/learning-row-link';
import { getLearningNavigationAccessibility } from '@/features/learning/learning-navigation-accessibility';
import { getSearchResultRoute } from '@/features/learning/learning-search';
import { formatPlanShape } from '@/features/learning/study-plan-shape';
import { useSubscription } from '@/features/purchases/use-subscription';

const { symbol: PLAN_SYMBOL, tint: PLAN_TINT } = getLearningAreaStyle('study-plans');

const LEVEL_LABELS = ['', 'Beginner', 'Intermediate', 'Advanced'] as const;

const ITEM_LABELS: Record<StudyPlanItem['itemType'], string> = {
  lesson: 'Lesson', quiz: 'Quiz', cheat_sheet: 'Cheat sheet', checklist: 'Checklist',
  code_challenge: 'Challenge', snippet: 'Snippet', decision_guide: 'Guide',
  interview_question: 'Interview', faq: 'FAQ', library_tool: 'Good to know',
  project: 'Project',
};

export function StudyPlanListScreen() {
  const database = useSQLiteContext();
  const [plans, setPlans] = useState<StudyPlanSummary[] | null>(null);
  const [doneCounts, setDoneCounts] = useState<Record<number, number>>({});
  const { learningUnlocked } = useSubscription();
  const bottomPadding = useBottomContentPadding(32);

  useEffect(() => {
    void createLearningContentRepository(database).getStudyPlans().then(setPlans).catch(() => setPlans([]));
    void getLearningProgressRepository().then((progress) => progress.getStudyPlanDoneCounts()).then(setDoneCounts).catch(() => undefined);
  }, [database]);

  if (!plans) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading study plans" /></CenteredEmptyState>;
  const freeCount = getFreeItemCount(plans.length);

  return (
    <FlatList
      testID="study-plans-ready"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ gap: 10, padding: 16, paddingBottom: bottomPadding }}
      extraData={doneCounts}
      ListHeaderComponent={
        <View style={{ gap: 6, paddingBottom: 8 }}>
          <NativeText textStyle="title2">A route through, not a pile to search</NativeText>
          {freeCount > 0 && !learningUnlocked ? <NativeText textStyle="footnote" tone="secondary">{freeCount === 1 ? 'The first plan is open.' : `The first ${freeCount} plans are open.`} The one-time library unlock opens the rest.</NativeText> : null}
        </View>
      }
      ListEmptyComponent={<LearningEmptyState testID="study-plans-empty" title="No study plans yet" message="Study plans are not part of this release. The Learning Path covers the same tracks to browse in any order." />}
      data={plans}
      keyExtractor={(item) => String(item.pathId)}
      renderItem={({ item, index }) => {
        const unlocked = isItemUnlocked(index, plans.length, learningUnlocked);
        const done = doneCounts[item.pathId] ?? 0;
        return (
          <LearningRowLink
            href={unlocked ? { pathname: '/study-plans/[pathId]', params: { pathId: item.pathId } } : null}
            paywallSource="premium_study_plans_list"
            testID={`study-plan-${index}`}
            accessibilityLabel={getLearningNavigationAccessibility({ title: item.title, destination: 'study plan', locked: !unlocked })}
            accessibilityHint={unlocked ? 'Opens study plan' : 'Opens unlock options'}
          >
            <NativeCard style={{ gap: 8 }}>
                <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
                  <NativeListRow
                    caption={unlocked ? `${LEVEL_LABELS[item.level]} · ${formatPlanShape(item)}` : 'Locked'}
                    locked={!unlocked}
                    symbol={unlocked ? PLAN_SYMBOL : 'lock.fill'}
                    tint={PLAN_TINT}
                    title={item.title}
                  />
                </View>
                {unlocked ? <NativeText selectable textStyle="footnote" tone="secondary">{item.description}</NativeText> : null}
                {unlocked && done > 0 ? (
                  <View style={{ gap: 4 }}>
                    <NativeProgressBar progress={done / Math.max(1, item.itemCount)} tint={PLAN_TINT} />
                    <NativeText textStyle="caption" tone="tertiary">{`${done} of ${item.itemCount} done`}</NativeText>
                  </View>
                ) : null}
            </NativeCard>
          </LearningRowLink>
        );
      }}
    />
  );
}

export function StudyPlanScreen() {
  const { pathId } = useLocalSearchParams<{ pathId: string }>();
  const database = useSQLiteContext();
  const [plan, setPlan] = useState<StudyPlan | null | undefined>();
  const [done, setDone] = useState<number[]>([]);
  const bottomPadding = useBottomContentPadding(32);

  useEffect(() => {
    void createLearningContentRepository(database).getStudyPlan(Number(pathId)).then(setPlan).catch(() => setPlan(null));
    void getLearningProgressRepository().then((progress) => progress.getStudyPlanDonePositions(Number(pathId))).then(setDone).catch(() => undefined);
  }, [database, pathId]);

  /*
   * The tick is optimistic. Writing first and reading back would make every tap
   * wait on the progress database, and a checkbox that lags behind the finger
   * reads as broken — the same complaint the snippet Copy button drew.
   */
  const toggle = useCallback(async (position: number, next: boolean) => {
    setDone((current) => (next ? [...current, position] : current.filter((value) => value !== position)));
    try {
      const progress = await getLearningProgressRepository();
      await progress.setStudyPlanItemDone(Number(pathId), position, next);
    } catch (error) {
      if (error instanceof Error) console.error('[study-plans] could not save progress:', error.message);
      setDone((current) => (next ? current.filter((value) => value !== position) : [...current, position]));
    }
  }, [pathId]);

  if (plan === undefined) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading study plan" /></CenteredEmptyState>;
  if (!plan) return <CenteredEmptyState><NativeText tone="secondary">This study plan is unavailable.</NativeText></CenteredEmptyState>;

  return (
    <>
      <Stack.Screen options={{ title: plan.title }} />
      <ScrollView testID="study-plan-ready" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ gap: 14, padding: 16, paddingBottom: bottomPadding }} style={{ backgroundColor: NATIVE_BACKGROUND }}>
        <View style={{ gap: 8 }}>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
            <NativeBadge label={LEVEL_LABELS[plan.level]} tint={PLAN_TINT} />
            <NativeText textStyle="footnote" tone="secondary">{formatPlanShape(plan)}</NativeText>
          </View>
          <NativeText selectable textStyle="callout">{plan.description}</NativeText>
          <NativeProgressBar progress={done.length / Math.max(1, plan.items.length)} tint={PLAN_TINT} />
          <NativeText accessibilityLiveRegion="polite" textStyle="caption" tone="tertiary">{`${done.length} of ${plan.items.length} done`}</NativeText>
        </View>

        {plan.items.map((item) => {
          const checked = done.includes(item.position);
          return (
            <NativeCard key={item.position} padding={8} style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }} testID={`study-plan-item-${item.position}`}>
                {/* `Checkbox.Android` was used because iOS renders an unticked
                    native checkbox as nothing at all — the same finding the
                    checklist screen recorded. A filled/empty SF Symbol circle is
                    the iOS way to say the same thing and is always visible. */}
                <Pressable
                  accessibilityLabel={`${item.title}, ${checked ? 'done' : 'not done'}`}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                  hitSlop={8}
                  onPress={() => { void toggle(item.position, !checked); }}
                  style={{ alignItems: 'center', height: 44, justifyContent: 'center', width: 34 }}
                >
                  <SymbolView
                    name={checked ? 'checkmark.circle.fill' : 'circle'}
                    size={24}
                    tintColor={checked ? PLAN_TINT : '#C7C7CC'}
                  />
                </Pressable>
                <Link href={getSearchResultRoute({ itemType: item.itemType, itemId: item.itemId, parentId: item.parentId, title: item.title, subtitle: '' })} asChild>
                  <Pressable
                    testID={`study-plan-open-${item.position}`}
                    accessibilityRole="button"
                    accessibilityLabel={getLearningNavigationAccessibility({ title: item.title, destination: ITEM_LABELS[item.itemType].toLowerCase() })}
                    style={{ flex: 1, gap: 2, minHeight: 44, justifyContent: 'center', paddingVertical: 8 }}
                  >
                    <NativeText style={{ textDecorationLine: checked ? 'line-through' : 'none' }} textStyle="body">{item.title}</NativeText>
                    <NativeText textStyle="footnote" tone="secondary">{`${ITEM_LABELS[item.itemType]} · ${item.estimatedMinutes} min`}</NativeText>
                  </Pressable>
                </Link>
                <SymbolView name="chevron.right" size={13} tintColor="#C7C7CC" weight="semibold" />
            </NativeCard>
          );
        })}
      </ScrollView>
    </>
  );
}
