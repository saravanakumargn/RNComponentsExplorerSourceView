import { SymbolView } from 'expo-symbols';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Share, View } from 'react-native';

import { NativeBadge } from '@/components/native-ui/native-badge';
import { NativeButton } from '@/components/native-ui/native-button';
import { NativeCard } from '@/components/native-ui/native-card';
import { NativeSegmentedControl } from '@/components/native-ui/native-segmented-control';
import { NativeText } from '@/components/native-ui/native-text';
import { getLearningAreaStyle, NATIVE_BACKGROUND, NATIVE_COLORS } from '@/components/native-ui/native-tokens';
import { CenteredEmptyState, useBottomContentPadding } from '@/components/screen-layout';
import { ContentDemoLink } from '@/features/learning/content-demo-links';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import type { DecisionGuide } from '@/features/learning/data/learning-types';
import { getDemoForPackage } from '@/features/learning/decision-guide-demos';
import { CRITERION_WEIGHTS, hasClearWinner, rankDecisionOptions, type CriterionWeights } from '@/features/learning/decision-guide-wizard';
import { InlineCodeText } from '@/features/learning/inline-code';
import { LearningEmptyState } from '@/features/learning/learning-empty-state';
import { formatResultShareMessage, SHARE_RESULT_TITLE } from '@/features/learning/share-result';

const { tint: GUIDE_TINT } = getLearningAreaStyle('decision-guides');

/**
 * A recommendation that opens the running demo — the reason a guide here beats
 * the comparison article a reader could find for free.
 *
 * The link is derived from the option's npm package rather than authored, so it
 * needs no `content_demos` row and appears automatically on any future guide
 * that names a package the explorer ships. Options with no demo behind them
 * simply render nothing.
 */
function OptionDemo({ npmPackage, testID }: { npmPackage: string | null; testID: string }) {
  const demo = getDemoForPackage(npmPackage);
  if (!demo) return null;
  return (
    <View style={{ alignSelf: 'flex-start', paddingTop: 2 }}>
      <ContentDemoLink demo={demo} testID={testID} />
    </View>
  );
}

/**
 * One weighting question and its segmented control.
 *
 * Split out so a press re-renders this row rather than the whole guide: the
 * ranking below is derived from every weight, so the screen above recomputes on
 * each change, and a `Picker` that has to wait for that work before it can draw
 * its selection feels slower than the control it is imitating.
 */
function CriterionWeight({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <View style={{ gap: 8 }}>
      <NativeText textStyle="subheadline">{label}</NativeText>
      <NativeSegmentedControl
        label={`How much ${label} matters`}
        onChange={onChange}
        options={CRITERION_WEIGHTS.map((weight) => ({
          label: `${label}: ${weight.description}`,
          title: weight.label,
          value: weight.value,
        }))}
        value={value}
      />
    </View>
  );
}

/**
 * One decision guide: the weighting questions, the ranked answer, and every
 * option in full.
 *
 * **Why this screen stays React Native on both platforms.** Its prose is
 * authored with markdown backticks — an option's verdict names the package it
 * is about — and `InlineCodeText` renders those as inline code inside a running
 * sentence. SwiftUI's `Text` takes a string, not a tree, so there is no way to
 * set one span of a sentence in monospace inside a `@expo/ui` view. The guide
 * would have to lose the distinction between a package name and a word, on the
 * screen where that distinction carries the most meaning.
 *
 * It is shared rather than duplicated: both `decision-guide-screen.tsx` and its
 * `.ios` sibling re-export this file, so the list screen can be SwiftUI on iOS
 * and Paper on Android without either copy of the guide drifting from the other.
 *
 * What did change is everything Material about it. The one control a reader
 * actually touches — the weighting — is now a real `UISegmentedControl` through
 * `NativeSegmentedControl` rather than Paper's row of outlined buttons, and the
 * winner is marked by filling its card in the area's own hue, which is how iOS
 * distinguishes a card, rather than by raising it on a shadow, which is how
 * Material does.
 */
export function DecisionGuideScreen() {
  const { guideId } = useLocalSearchParams<{ guideId: string }>();
  const database = useSQLiteContext();
  const [guide, setGuide] = useState<DecisionGuide | null | undefined>();
  const [weights, setWeights] = useState<CriterionWeights>({});
  const bottomPadding = useBottomContentPadding(32);

  useEffect(() => {
    void createLearningContentRepository(database)
      .getDecisionGuide(Number(guideId))
      .then(setGuide)
      .catch(() => setGuide(null));
  }, [database, guideId]);

  // Ranking is derived, not stored, so the answer follows the sliders live
  // rather than hiding behind a submit step the reader has to find.
  const outcome = useMemo(() => (guide ? rankDecisionOptions(guide, weights) : null), [guide, weights]);

  const shareResult = useCallback(async () => {
    if (!guide || outcome?.kind !== 'ranked') return;
    const weighted = guide.criteria
      .filter((criterion) => (weights[criterion.criterionId] ?? 0) > 0)
      .map((criterion) => criterion.label);
    const top = outcome.ranked[0];
    await Share.share({
      title: SHARE_RESULT_TITLE,
      message: formatResultShareMessage(
        { question: guide.question, winner: top.option.name, percent: top.percent, weighted },
        Platform.OS,
      ),
    });
  }, [guide, outcome, weights]);

  if (guide === undefined) {
    return (
      <CenteredEmptyState>
        <ActivityIndicator accessibilityLabel="Loading decision guide" />
      </CenteredEmptyState>
    );
  }

  if (!guide) {
    return (
      <CenteredEmptyState>
        <NativeText tone="secondary">This guide is unavailable.</NativeText>
      </CenteredEmptyState>
    );
  }

  const clearWinner = outcome?.kind === 'ranked' && hasClearWinner(outcome.ranked);

  return (
    <>
      <Stack.Screen options={{ title: guide.title }} />
      <ScrollView
        testID="decision-guide-ready"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ gap: 18, padding: 16, paddingBottom: bottomPadding }}
        style={{ backgroundColor: NATIVE_BACKGROUND }}
      >
        <View style={{ gap: 6 }}>
          <NativeText textStyle="title2">{guide.question}</NativeText>
          <InlineCodeText textStyle="callout" tone="secondary">
            {guide.summary}
          </InlineCodeText>
        </View>

        {guide.criteria.length > 0 ? (
          <NativeCard style={{ gap: 16 }}>
            <NativeText textStyle="headline">How much does each matter to you?</NativeText>
            {guide.criteria.map((criterion) => (
              <CriterionWeight
                key={criterion.criterionId}
                label={criterion.label}
                onChange={(value) => setWeights((current) => ({ ...current, [criterion.criterionId]: value }))}
                value={weights[criterion.criterionId] ?? 0}
              />
            ))}
          </NativeCard>
        ) : null}

        {outcome?.kind === 'unscored' ? (
          <LearningEmptyState
            testID="decision-guide-unscored"
            title="Not scored yet"
            message="This guide lists its options but has not been scored against the criteria, so it cannot recommend one yet."
          />
        ) : null}

        {outcome?.kind === 'no-preference' ? (
          <NativeText selectable testID="decision-guide-prompt" textStyle="footnote" tone="secondary">
            Mark at least one thing above as mattering and the options will be ranked for you. Until then, here they are in order.
          </NativeText>
        ) : null}

        {outcome?.kind === 'ranked' ? (
          <View testID="decision-guide-result" style={{ gap: 10 }}>
            <NativeText textStyle="headline">For what you said matters</NativeText>
            {clearWinner ? (
              <NativeButton
                onPress={() => {
                  void shareResult();
                }}
                style={{ alignSelf: 'flex-start' }}
                symbol="square.and.arrow.up"
                testID="share-result"
                title="Share this result"
              />
            ) : (
              <NativeText textStyle="footnote" tone="secondary">
                Several options score the same here. Mark more of the list above as mattering to separate them.
              </NativeText>
            )}
            {outcome.ranked.map((entry, index) => {
              const best = index === 0 && clearWinner;

              return (
                <NativeCard accent={best ? GUIDE_TINT : undefined} key={entry.option.optionId} style={{ gap: 8 }}>
                  <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
                    {best ? <NativeBadge label="Best fit" tint={GUIDE_TINT} /> : null}
                    <NativeText style={{ flex: 1 }} textStyle="headline">
                      {entry.option.name}
                    </NativeText>
                    <NativeText
                      style={{ color: best ? GUIDE_TINT : NATIVE_COLORS.secondaryLabel }}
                      textStyle="subheadline"
                      weight="600"
                    >
                      {entry.percent}%
                    </NativeText>
                  </View>
                  <InlineCodeText textStyle="footnote">{entry.option.verdict}</InlineCodeText>
                  {entry.reasons.map((reason) => (
                    <View key={reason.criterionId} style={{ flexDirection: 'row', gap: 8 }}>
                      <SymbolView name="checkmark" size={13} tintColor={GUIDE_TINT} weight="semibold" />
                      <NativeText style={{ flex: 1 }} textStyle="footnote" tone="secondary">
                        {reason.label}
                        {reason.note ? ` — ${reason.note}` : ''}
                      </NativeText>
                    </View>
                  ))}
                  <OptionDemo npmPackage={entry.option.npmPackage} testID={`ranked-demo-${index}`} />
                </NativeCard>
              );
            })}
          </View>
        ) : null}

        <View style={{ gap: 10 }}>
          <NativeText textStyle="headline">Every option</NativeText>
          {guide.options.map((option) => (
            <NativeCard key={option.optionId} style={{ gap: 6 }}>
              <NativeText textStyle="headline">{option.name}</NativeText>
              <InlineCodeText textStyle="footnote" tone="secondary">
                {`Best for: ${option.bestFor}`}
              </InlineCodeText>
              <InlineCodeText textStyle="footnote" tone="secondary">
                {`Avoid when: ${option.avoidWhen}`}
              </InlineCodeText>
              <OptionDemo npmPackage={option.npmPackage} testID={`option-demo-${option.position}`} />
            </NativeCard>
          ))}
        </View>
      </ScrollView>
    </>
  );
}
