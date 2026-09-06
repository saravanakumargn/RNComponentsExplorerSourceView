import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, FlatList, Pressable, ScrollView, View } from 'react-native';

import { NativeBadge } from '@/components/native-ui/native-badge';
import { NativeCard } from '@/components/native-ui/native-card';
import { NativeListRow } from '@/components/native-ui/native-list-row';
import { NativeProgressBar } from '@/components/native-ui/native-progress-bar';
import { NativeText } from '@/components/native-ui/native-text';
import { getLearningAreaStyle, NATIVE_BACKGROUND, NATIVE_COLORS, NATIVE_TINT } from '@/components/native-ui/native-tokens';

import { CenteredEmptyState, useBottomContentPadding } from '@/components/screen-layout';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import { getLearningProgressRepository } from '@/features/learning/data/learning-progress-repository';
import type { GuidedProject, ProjectSummary } from '@/features/learning/data/learning-types';
import { InlineCodeText } from '@/features/learning/inline-code';
import { getFreeItemCount, isItemUnlocked } from '@/features/learning/learning-access-policy';
import { LearningEmptyState } from '@/features/learning/learning-empty-state';
import { LearningRowLink } from '@/features/learning/learning-row-link';
import { getLearningNavigationAccessibility } from '@/features/learning/learning-navigation-accessibility';
import { formatProjectProgress, formatProjectShape } from '@/features/learning/project-shape';
import { useSubscription } from '@/features/purchases/use-subscription';

const { symbol: PROJECT_SYMBOL, tint: PROJECT_TINT } = getLearningAreaStyle('projects');

const LEVEL_LABELS = ['', 'Beginner', 'Intermediate', 'Advanced'] as const;

export function ProjectListScreen() {
  const database = useSQLiteContext();
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [doneCounts, setDoneCounts] = useState<Record<number, number>>({});
  const { learningUnlocked } = useSubscription();
  const bottomPadding = useBottomContentPadding(32);

  useEffect(() => {
    void createLearningContentRepository(database).getGuidedProjects().then(setProjects).catch(() => setProjects([]));
    void getLearningProgressRepository().then((progress) => progress.getProjectDoneCounts()).then(setDoneCounts).catch(() => undefined);
  }, [database]);

  if (!projects) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading projects" /></CenteredEmptyState>;
  const freeCount = getFreeItemCount(projects.length);

  return (
    <FlatList
      testID="projects-ready"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ gap: 10, padding: 16, paddingBottom: bottomPadding }}
      extraData={doneCounts}
      ListHeaderComponent={
        <View style={{ gap: 6, paddingBottom: 8 }}>
          <NativeText textStyle="title2">Something to build, with a way to know it worked</NativeText>
          {freeCount > 0 && !learningUnlocked ? <NativeText textStyle="footnote" tone="secondary">{freeCount === 1 ? 'The first project is open.' : `The first ${freeCount} projects are open.`} The one-time library unlock opens the rest.</NativeText> : null}
        </View>
      }
      ListEmptyComponent={<LearningEmptyState testID="projects-empty" title="No projects yet" message="Guided projects are not part of this release. The study plans cover the same ground as reading you can work through in order." />}
      data={projects}
      keyExtractor={(item) => String(item.projectId)}
      renderItem={({ item, index }) => {
        const unlocked = isItemUnlocked(index, projects.length, learningUnlocked);
        const done = doneCounts[item.projectId] ?? 0;
        return (
          <LearningRowLink
            href={unlocked ? { pathname: '/projects/[projectId]', params: { projectId: item.projectId } } : null}
            paywallSource="premium_projects_list"
            testID={`project-${index}`}
            accessibilityLabel={getLearningNavigationAccessibility({ title: item.title, destination: 'project', locked: !unlocked })}
            accessibilityHint={unlocked ? 'Opens project' : 'Opens unlock options'}
          >
            <NativeCard style={{ gap: 8 }}>
                <NativeListRow
                  caption={unlocked ? `${LEVEL_LABELS[item.level]} · ${formatProjectShape(item)}` : 'Locked'}
                  locked={!unlocked}
                  symbol={unlocked ? PROJECT_SYMBOL : 'lock.fill'}
                  tint={PROJECT_TINT}
                  title={item.title}
                />
                {unlocked ? <NativeText selectable textStyle="footnote" tone="secondary">{item.brief}</NativeText> : null}
                {unlocked && done > 0 ? (
                  <View style={{ gap: 4 }}>
                    <NativeProgressBar progress={done / Math.max(1, item.stepCount)} tint={PROJECT_TINT} />
                    <NativeText textStyle="caption" tone="tertiary">{formatProjectProgress(done, item.stepCount)}</NativeText>
                  </View>
                ) : null}
            </NativeCard>
          </LearningRowLink>
        );
      }}
    />
  );
}

export function ProjectScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const database = useSQLiteContext();
  const [project, setProject] = useState<GuidedProject | null | undefined>();
  const [done, setDone] = useState<number[]>([]);
  const bottomPadding = useBottomContentPadding(32);

  useEffect(() => {
    void createLearningContentRepository(database).getGuidedProject(Number(projectId)).then(setProject).catch(() => setProject(null));
    void getLearningProgressRepository().then((progress) => progress.getProjectDonePositions(Number(projectId))).then(setDone).catch(() => undefined);
  }, [database, projectId]);

  /* Optimistic for the same reason the study plan's tick is: a control that
     lags behind the finger reads as broken. */
  const toggle = useCallback(async (position: number, next: boolean) => {
    setDone((current) => (next ? [...current, position] : current.filter((value) => value !== position)));
    try {
      const progress = await getLearningProgressRepository();
      await progress.setProjectStepDone(Number(projectId), position, next);
    } catch (error) {
      if (error instanceof Error) console.error('[projects] could not save progress:', error.message);
      setDone((current) => (next ? current.filter((value) => value !== position) : [...current, position]));
    }
  }, [projectId]);

  if (project === undefined) return <CenteredEmptyState><ActivityIndicator accessibilityLabel="Loading project" /></CenteredEmptyState>;
  if (!project) return <CenteredEmptyState><NativeText tone="secondary">This project is unavailable.</NativeText></CenteredEmptyState>;

  return (
    <>
      <Stack.Screen options={{ title: project.title }} />
      <ScrollView testID="project-ready" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ gap: 14, padding: 16, paddingBottom: bottomPadding }} style={{ backgroundColor: NATIVE_BACKGROUND }}>
        <View style={{ gap: 8 }}>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
            <NativeBadge label={LEVEL_LABELS[project.level]} tint={PROJECT_TINT} />
            <NativeText textStyle="footnote" tone="secondary">{formatProjectShape(project)}</NativeText>
          </View>
          <NativeText selectable textStyle="callout">{project.brief}</NativeText>
          <NativeProgressBar progress={done.length / Math.max(1, project.steps.length)} tint={PROJECT_TINT} />
          <NativeText accessibilityLiveRegion="polite" textStyle="caption" tone="tertiary">{formatProjectProgress(done.length, project.steps.length)}</NativeText>
        </View>

        {project.steps.map((step) => {
          const checked = done.includes(step.position);
          return (
            <NativeCard key={step.position} style={{ gap: 10 }} testID={`project-step-${step.position}`}>
                {/*
                  The whole header is the control, not a checkbox beside it. A
                  step is a paragraph of work, so the tap target that marks it
                  done should be the size of the thing it refers to — and the
                  checklist screen already learned that iOS renders an unticked
                  native checkbox as nothing at all, which is why this draws its
                  own always-visible box.
                */}
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                  accessibilityLabel={`Step ${step.position}. ${step.goal}`}
                  accessibilityHint={checked ? 'Marks this step not done' : 'Marks this step done'}
                  onPress={() => { void toggle(step.position, !checked); }}
                  style={{ alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 44 }}
                  testID={`project-step-toggle-${step.position}`}
                >
                  <SymbolView
                    name={checked ? 'checkmark.circle.fill' : 'circle'}
                    size={24}
                    tintColor={checked ? PROJECT_TINT : '#C7C7CC'}
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <NativeText textStyle="caption" tone="tertiary" weight="600">{`Step ${step.position}`}</NativeText>
                    <NativeText style={{ textDecorationLine: checked ? 'line-through' : 'none' }} textStyle="headline">{step.goal}</NativeText>
                  </View>
                </Pressable>

                <InlineCodeText textStyle="callout">{step.instructions}</InlineCodeText>

                {/*
                  The checkpoint is the reason this content type exists, so it
                  is drawn as its own block rather than a third paragraph — a
                  reader scanning for "am I finished?" should find it without
                  reading the instructions again.
                */}
                <View style={{ backgroundColor: NATIVE_COLORS.fill, borderCurve: 'continuous', borderRadius: 12, gap: 4, padding: 12 }}>
                  <View style={{ alignItems: 'center', flexDirection: 'row', gap: 6 }}>
                    <SymbolView name="flag.fill" size={13} tintColor={NATIVE_TINT} />
                    <NativeText style={{ color: NATIVE_TINT }} textStyle="caption" weight="600">Done when</NativeText>
                  </View>
                  <InlineCodeText textStyle="footnote">{step.checkpoint}</InlineCodeText>
                </View>
            </NativeCard>
          );
        })}
      </ScrollView>
    </>
  );
}
