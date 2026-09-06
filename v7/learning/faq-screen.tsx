import { ContentUnavailableView, List, ProgressView, Section, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, listStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { NativeNavRow } from '@/components/native-ui/native-row.ios';
import { NativeScreen } from '@/components/native-ui/native-screen';
import { NATIVE_TINT } from '@/components/native-ui/native-tokens';
import { createLearningContentRepository } from '@/features/learning/data/learning-content-repository';
import type { Faq, FaqTopic } from '@/features/learning/data/learning-types';
import { getFreeItemCount, isItemUnlocked } from '@/features/learning/learning-access-policy';
import { getLearningNavigationAccessibility } from '@/features/learning/learning-navigation-accessibility';
import { usePaywall } from '@/features/purchases/paywall-provider';
import { useSubscription } from '@/features/purchases/use-subscription';

const SECONDARY = { type: 'hierarchical', style: 'secondary' } as const;
const LOCKED = '#8E8E93';

export function FaqTopicsScreen() {
  const database = useSQLiteContext();
  const router = useRouter();
  const [items, setItems] = useState<FaqTopic[] | null>(null);

  useEffect(() => {
    void createLearningContentRepository(database).getFaqTopics().then(setItems);
  }, [database]);

  if (!items) {
    return (
      <NativeScreen>
        <VStack spacing={12}>
          <ProgressView />
          <Text modifiers={[foregroundStyle(SECONDARY)]}>Loading FAQ topics…</Text>
        </VStack>
      </NativeScreen>
    );
  }

  if (items.length === 0) {
    return (
      <NativeScreen testID="faq-topics-empty">
        <ContentUnavailableView
          description="The React Native FAQ is being rebuilt as a troubleshooting reference. Your lessons and interview prep are ready to use in the meantime."
          systemImage="questionmark.circle"
          title="No answers here yet"
        />
      </NativeScreen>
    );
  }

  return (
    <NativeScreen testID="faq-topics-ready">
      <List modifiers={[listStyle('insetGrouped')]}>
        <Section
          footer={
            <Text modifiers={[font({ textStyle: 'footnote' }), foregroundStyle(SECONDARY)]}>
              Practical React Native guidance, saved on your device.
            </Text>
          }
          title="Answers when you need them"
        >
          {items.map((topic, index) => (
            <NativeNavRow
              key={topic.faqTopicId}
              label={getLearningNavigationAccessibility({ title: topic.title, destination: 'FAQ questions' })}
              onPress={() => router.push({ pathname: '/faq/[topicId]', params: { topicId: topic.faqTopicId } })}
              symbol="questionmark.circle.fill"
              testID={`faq-topic-${index}`}
              tint="#5856D6"
              title={topic.title}
            />
          ))}
        </Section>
      </List>
    </NativeScreen>
  );
}

/**
 * The answers in one topic, with the free ones open and the rest behind the
 * one-time unlock.
 *
 * A locked row keeps the routing the Paper `LearningRowLink` established: it
 * does not navigate, it opens the single shared paywall, and it ends in a lock
 * rather than a chevron.
 */
export function FaqListScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const database = useSQLiteContext();
  const router = useRouter();
  const { openPaywall } = usePaywall();
  const { learningUnlocked } = useSubscription();
  const [items, setItems] = useState<Faq[] | null>(null);

  useEffect(() => {
    void createLearningContentRepository(database).getFaqsForTopic(Number(topicId)).then(setItems);
  }, [database, topicId]);

  if (!items) {
    return (
      <NativeScreen>
        <VStack spacing={12}>
          <ProgressView />
          <Text modifiers={[foregroundStyle(SECONDARY)]}>Loading FAQ answers…</Text>
        </VStack>
      </NativeScreen>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: 'FAQ' }} />
        <NativeScreen testID="faq-list-empty">
          <ContentUnavailableView
            description="This topic has no published answers yet. Try another topic, or come back after the next content update."
            systemImage="questionmark.circle"
            title="No answers in this topic"
          />
        </NativeScreen>
      </>
    );
  }

  const freeCount = getFreeItemCount(items.length);

  return (
    <>
      <Stack.Screen options={{ title: 'FAQ' }} />
      <NativeScreen testID="faq-list-ready">
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section
            footer={
              freeCount > 0 ? (
                <Text modifiers={[font({ textStyle: 'footnote' }), foregroundStyle(SECONDARY)]}>
                  {freeCount === 1 ? 'The first answer is open to read.' : `The first ${freeCount} answers are open to read.`} The one-time library unlock opens the rest.
                </Text>
              ) : undefined
            }
          >
            {items.map((faq, index) => {
              const unlocked = isItemUnlocked(index, items.length, learningUnlocked);
              const href = { pathname: '/faq/read/[faqId]', params: { faqId: faq.faqId } } as const;

              return (
                <NativeNavRow
                  caption={unlocked ? 'Available offline' : 'Locked'}
                  key={faq.faqId}
                  label={getLearningNavigationAccessibility({ title: faq.question, destination: 'FAQ answer', locked: !unlocked })}
                  onPress={() => (unlocked ? router.push(href) : openPaywall('premium_faq_list'))}
                  symbol={unlocked ? 'text.bubble.fill' : 'lock.fill'}
                  testID={`faq-item-${index}`}
                  tint={unlocked ? NATIVE_TINT : LOCKED}
                  title={faq.question}
                  trailingSymbol={unlocked ? undefined : 'lock.fill'}
                />
              );
            })}
          </Section>
        </List>
      </NativeScreen>
    </>
  );
}
