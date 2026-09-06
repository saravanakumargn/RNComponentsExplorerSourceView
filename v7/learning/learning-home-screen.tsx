import { Button, ContentUnavailableView, Form, Gauge, HStack, Image, ProgressView, Section, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { accessibilityLabel, buttonStyle, contentShape, font, foregroundStyle, frame, gaugeStyle, padding, shapes, tint } from '@expo/ui/swift-ui/modifiers';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';

import { NativeNavRow } from '@/components/native-ui/native-row.ios';
import { NativeScreen } from '@/components/native-ui/native-screen';
import { getLearningAreaStyle, NATIVE_TINT } from '@/components/native-ui/native-tokens';
import { useLearningHome } from '@/features/learning/use-learning-home';

const SECONDARY = { type: 'hierarchical', style: 'secondary' } as const;
const TERTIARY = { type: 'hierarchical', style: 'tertiary' } as const;

/**
 * The Learning home, rebuilt as a grouped iOS list.
 *
 * What it replaces: a marketing headline and paragraph that a returning reader
 * scrolled past every visit, then nine outlined cards of identical weight —
 * same 44pt tinted circle, same title, same two-line description, same count —
 * each about 100pt tall to carry one word of meaning. Nine of those is three
 * screens of scrolling and no hierarchy, which is both why the tab looked
 * generic and why it looked empty.
 *
 * What replaces it: progress first, because progress is what a learner opens
 * this tab to see; then the one lesson they were reading; then the library as
 * compact rows carrying their own hue and count. The same nine destinations now
 * fit in roughly one screen.
 */
export function LearningHomeScreen() {
  const router = useRouter();
  const { data, error, refresh } = useLearningHome();
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  if (error) {
    return (
      <NativeScreen>
        <VStack spacing={16}>
          <ContentUnavailableView
            description={error.message}
            systemImage="exclamationmark.triangle"
            title="Learning content is unavailable"
          />
          <Button label="Try again" modifiers={[buttonStyle('borderedProminent')]} onPress={refresh} />
        </VStack>
      </NativeScreen>
    );
  }

  if (!data) {
    return (
      <NativeScreen>
        <VStack spacing={12}>
          <ProgressView />
          <Text modifiers={[foregroundStyle(SECONDARY)]}>Loading your progress…</Text>
        </VStack>
      </NativeScreen>
    );
  }

  return (
    <NativeScreen testID="maestro-learning-home-ready">
      <Form>
        {/*
          * Progress as a ring, not a bar.
          *
          * This was a headline, a percent, a 4pt linear `ProgressView` and a
          * footnote, stacked — accurate, and the flattest thing on the screen,
          * which matters because it is the first card a returning reader looks
          * at. A `circularCapacity` `Gauge` is what iOS puts on a card that
          * answers "how far am I": it carries the number inside itself, so the
          * percent stops being a second thing to read, and it gives the card a
          * shape instead of three left-aligned lines.
          *
          * `Gauge` was in this phase's plan from the start as one of the
          * primitives the redesign needed, and this is the first screen to use
          * one.
          */}
        <Section>
          <HStack modifiers={[padding({ vertical: 10 })]} spacing={16}>
            <Gauge
              currentValueLabel={
                <Text modifiers={[font({ textStyle: 'headline', design: 'rounded' })]}>
                  {`${data.progressPercent}%`}
                </Text>
              }
              modifiers={[gaugeStyle('circularCapacity'), frame({ width: 62 }), tint(NATIVE_TINT)]}
              value={data.progressPercent / 100}
            />
            <VStack alignment="leading" spacing={3}>
              <Text modifiers={[font({ textStyle: 'headline' })]}>Your progress</Text>
              <Text modifiers={[font({ textStyle: 'subheadline' }), foregroundStyle(SECONDARY)]}>
                {data.completedLessons.toLocaleString('en-US')} of {data.totalLessons.toLocaleString('en-US')} lessons completed
              </Text>
              <Text modifiers={[font({ textStyle: 'footnote' }), foregroundStyle(TERTIARY)]}>
                Saved on this device
              </Text>
            </VStack>
            <Spacer />
          </HStack>
        </Section>

        {data.resumeLesson ? (
          <Section title="Continue where you left off">
            <Button
              modifiers={[buttonStyle('plain'), accessibilityLabel('Resume your study')]}
              onPress={() => router.push({ pathname: '/learning-path/[topicId]', params: { topicId: data.resumeLesson!.topicId } })}
            >
              <HStack modifiers={[contentShape(shapes.rectangle())]} spacing={12}>
                <Image color={NATIVE_TINT} size={30} systemName="play.circle.fill" />
                <VStack alignment="leading" spacing={2}>
                  <Text modifiers={[font({ textStyle: 'headline' })]}>{data.resumeLesson.subtopicName}</Text>
                  <Text modifiers={[font({ textStyle: 'footnote' }), foregroundStyle(SECONDARY)]}>
                    {data.resumeLesson.topicName}
                  </Text>
                </VStack>
                <Spacer />
                <Image color="#C7C7CC" size={14} systemName="chevron.right" />
              </HStack>
            </Button>
          </Section>
        ) : (
          <Section title="Ready when you are">
            <NativeNavRow
              description={`${data.totalLessons.toLocaleString('en-US')} lessons, ready offline`}
              onPress={() => router.push('/learning-path')}
              symbol="flag.fill"
              tint={NATIVE_TINT}
              title="Browse Learning Path"
            />
          </Section>
        )}

        <Section>
          <NativeNavRow
            label="Search the library"
            onPress={() => router.push('/search')}
            symbol="magnifyingglass"
            tint={NATIVE_TINT}
            title="Search lessons, terms, questions"
          />
        </Section>

        <Section
          title="Explore your library"
          footer={
            <Text modifiers={[font({ textStyle: 'footnote' }), foregroundStyle(SECONDARY)]}>
              Content is curated for education and may not reflect the latest React Native or Expo changes.
            </Text>
          }
        >
          {data.areas.map((area) => {
            const { symbol, tint } = getLearningAreaStyle(area.id);

            return (
              <NativeNavRow
                key={area.id}
                onPress={() => router.push({ pathname: '/[area]', params: { area: area.id } })}
                symbol={symbol}
                testID={`maestro-learning-area-${area.id}`}
                tint={tint}
                title={area.title}
                trailing={data.areaCounts[area.countKey].toLocaleString('en-US')}
              />
            );
          })}
        </Section>
      </Form>
    </NativeScreen>
  );
}
