import { ContentUnavailableView, List, ProgressView, Section, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, listStyle } from '@expo/ui/swift-ui/modifiers';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { NativeNavRow } from '@/components/native-ui/native-row.ios';
import { NativeScreen } from '@/components/native-ui/native-screen';
import { getLearningAreaStyle } from '@/components/native-ui/native-tokens';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import type { DecisionGuideSummary } from '@/features/learning/data/learning-types';
import { isDecisionGuideUnlocked } from '@/features/learning/decision-guide-access';
import { getLearningNavigationAccessibility } from '@/features/learning/learning-navigation-accessibility';
import { usePaywall } from '@/features/purchases/paywall-provider';
import { useSubscription } from '@/features/purchases/use-subscription';

/**
 * The guide itself stays React Native — see its own file for why its prose
 * cannot move to SwiftUI.
 */
export { DecisionGuideScreen } from '@/features/learning/decision-guide-detail-screen';

const SECONDARY = { type: 'hierarchical', style: 'secondary' } as const;
const LOCKED = '#8E8E93';

/** The area's hue and glyph, shared with its row on the Learning home. */
const { symbol: GUIDE_SYMBOL, tint: GUIDE_TINT } = getLearningAreaStyle('decision-guides');

/**
 * The guides, as a grouped list.
 *
 * What it replaces: an all-caps "DECIDE" eyebrow over a headline and a
 * paragraph of positioning, then one outlined Material card per guide, each
 * carrying a 36pt tinted circle around a `MaterialIcons` glyph. The eyebrow and
 * the paragraph are the kind of copy a reader scrolls past on every visit after
 * the first, and eleven identical cards below them is the same undifferentiated
 * wall the Learning home had.
 *
 * What replaces it: the positioning moves into the section footer, where iOS
 * puts explanatory text and where it is read once; the guides become rows.
 *
 * Locked rows keep the routing the Paper `LearningRowLink` established — they do
 * not navigate, they open the one shared paywall, and they end in a lock rather
 * than a chevron, because a chevron promises the thing behind it.
 */
export function DecisionGuideListScreen() {
  const database = useSQLiteContext();
  const router = useRouter();
  const { openPaywall } = usePaywall();
  const { learningUnlocked } = useSubscription();
  const [guides, setGuides] = useState<DecisionGuideSummary[] | null>(null);

  useEffect(() => {
    void createLearningContentRepository(database)
      .getDecisionGuides()
      .then(setGuides)
      .catch(() => setGuides([]));
  }, [database]);

  if (!guides) {
    return (
      <NativeScreen>
        <VStack spacing={12}>
          <ProgressView />
          <Text modifiers={[foregroundStyle(SECONDARY)]}>Loading decision guides…</Text>
        </VStack>
      </NativeScreen>
    );
  }

  if (guides.length === 0) {
    return (
      <NativeScreen testID="decision-guides-empty">
        <ContentUnavailableView
          description="Decision guides are not part of this release. The Learning Path and Good to know cover the same ground in longer form."
          systemImage="arrow.triangle.branch"
          title="No guides yet"
        />
      </NativeScreen>
    );
  }

  return (
    <NativeScreen testID="decision-guides-ready">
      <List modifiers={[listStyle('insetGrouped')]}>
        <Section
          footer={
            <Text modifiers={[font({ textStyle: 'footnote' }), foregroundStyle(SECONDARY)]}>
              Say how much each thing matters to you and the guide ranks the options for your situation — an answer, not a comparison table.
            </Text>
          }
          title="Decide with your own weighting"
        >
          {guides.map((guide, index) => {
            const unlocked = isDecisionGuideUnlocked(guide.slug, index, guides.length, learningUnlocked);

            return (
              <NativeNavRow
                caption={unlocked ? `${guide.optionCount} options compared` : 'Locked'}
                key={guide.guideId}
                label={getLearningNavigationAccessibility({ title: guide.title, destination: 'decision guide', locked: !unlocked })}
                onPress={() =>
                  unlocked
                    ? router.push({ pathname: '/decision-guides/[guideId]', params: { guideId: guide.guideId } })
                    : openPaywall('premium_decision_guides_list')
                }
                symbol={unlocked ? GUIDE_SYMBOL : 'lock.fill'}
                testID={`decision-guide-${index}`}
                tint={unlocked ? GUIDE_TINT : LOCKED}
                title={guide.title}
                trailingSymbol={unlocked ? undefined : 'lock.fill'}
              />
            );
          })}
        </Section>
      </List>
    </NativeScreen>
  );
}
