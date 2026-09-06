import { Button, ContentUnavailableView, HStack, Image, List, ProgressView, Section, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { accessibilityLabel, buttonStyle, contentShape, font, foregroundStyle, frame, listStyle, shapes } from '@expo/ui/swift-ui/modifiers';
import { useRouter } from 'expo-router';

import { NativeScreen } from '@/components/native-ui/native-screen';
import { NATIVE_TINT } from '@/components/native-ui/native-tokens';
import { useLearningPath, type TopicProgress } from '@/features/learning/use-learning-path';

const SECONDARY = { type: 'hierarchical', style: 'secondary' } as const;
const DONE = '#34C759';
const AHEAD = '#C7C7CC';

/**
 * The curriculum, drawn as a sequence rather than a stack of equal cards.
 *
 * Before, every track carried a status chip — including fifteen reading "not
 * started", which is the default and so says nothing. Those chips also stole
 * enough width that topic names wrapped to two lines. Here the state is the
 * leading symbol: a filled check for finished, a tinted half-circle for the
 * one in progress, a hollow circle for what is still ahead. Only a track with
 * real progress spends a second line on a bar.
 */
export function LearningPathScreen() {
  const router = useRouter();
  const { error, topics } = useLearningPath();

  if (error) {
    return (
      <NativeScreen>
        <ContentUnavailableView
          description={error.message}
          systemImage="exclamationmark.triangle"
          title="Learning Path is unavailable"
        />
      </NativeScreen>
    );
  }

  if (!topics) {
    return (
      <NativeScreen>
        <VStack spacing={12}>
          <ProgressView />
          <Text modifiers={[foregroundStyle(SECONDARY)]}>Loading Learning Path…</Text>
        </VStack>
      </NativeScreen>
    );
  }

  if (topics.length === 0) {
    return (
      <NativeScreen>
        <ContentUnavailableView
          description="No learning topics are available."
          systemImage="books.vertical"
          title="Nothing to learn yet"
        />
      </NativeScreen>
    );
  }

  return (
    <NativeScreen testID="learning-path-ready">
      <List modifiers={[listStyle('insetGrouped')]}>
        <Section
          footer={
            <Text modifiers={[font({ textStyle: 'footnote' }), foregroundStyle(SECONDARY)]}>
              Every lesson is saved on your device, so your path and progress are ready offline.
            </Text>
          }
          title="Your curriculum"
        >
          {topics.map((topic, index) => (
            <TopicRow
              index={index}
              key={topic.topicId}
              onPress={() => router.push({ pathname: '/learning-path/[topicId]', params: { topicId: topic.topicId } })}
              topic={topic}
            />
          ))}
        </Section>
      </List>
    </NativeScreen>
  );
}

function TopicRow({ index, onPress, topic }: { index: number; onPress: () => void; topic: TopicProgress }) {
  const isDone = topic.state === 'completed';
  const isActive = topic.state === 'in-progress';
  const symbol = isDone ? 'checkmark.circle.fill' : isActive ? 'circle.lefthalf.filled' : 'circle';
  const accent = isDone ? DONE : isActive ? NATIVE_TINT : AHEAD;

  return (
    <Button
      modifiers={[
        buttonStyle('plain'),
        // Kept verbatim from the Paper row: the flows and VoiceOver both
        // depend on state and counts being spoken, not just the name.
        accessibilityLabel(`${topic.topicName}, ${topic.state}, ${topic.completed} of ${topic.lessonCount} complete`),
      ]}
      onPress={onPress}
      testID={`topic-item-${index}`}
    >
      <HStack modifiers={[contentShape(shapes.rectangle())]} spacing={12}>
        <Image color={accent} modifiers={[frame({ width: 28 })]} size={22} systemName={symbol} />

        <VStack alignment="leading" spacing={4}>
          <HStack spacing={6}>
            <Text
              modifiers={[
                font({ textStyle: 'caption', design: 'rounded' }),
                foregroundStyle(SECONDARY),
              ]}
            >
              {String(index + 1).padStart(2, '0')}
            </Text>
            <Text modifiers={[font({ textStyle: 'body' })]}>{topic.topicName}</Text>
          </HStack>

          <Text modifiers={[font({ textStyle: 'footnote' }), foregroundStyle(SECONDARY)]}>
            {isDone
              ? `All ${topic.lessonCount} lessons complete`
              : `${topic.completed} of ${topic.lessonCount} lessons · ${topic.percent}%`}
          </Text>

          {isActive ? <ProgressView value={topic.percent / 100} /> : null}
        </VStack>

        <Spacer />
        <Image color={AHEAD} size={14} systemName="chevron.right" />
      </HStack>
    </Button>
  );
}
