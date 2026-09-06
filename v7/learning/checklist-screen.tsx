import { Button, ContentUnavailableView, HStack, Image, List, ProgressView, Section, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { accessibilityLabel, accessibilityValue, buttonStyle, contentShape, font, foregroundStyle, frame, listStyle, padding, shapes } from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { NativeNavRow } from '@/components/native-ui/native-row.ios';
import { NativeScreen } from '@/components/native-ui/native-screen';
import { NATIVE_TINT } from '@/components/native-ui/native-tokens';
import {
  formatChecklistBadge,
  formatChecklistProgress,
  getChecklistSeverityLabel,
  summarizeChecklist,
} from '@/features/learning/checklist-progress';
import type { ChecklistItem } from '@/features/learning/data/learning-types';
import { getLearningNavigationAccessibility } from '@/features/learning/learning-navigation-accessibility';
import { useChecklistDetail, useChecklistList } from '@/features/learning/use-checklists';

const SECONDARY = { type: 'hierarchical', style: 'secondary' } as const;

/** Kept from the Paper screen so severity reads the same in both. */
const SEVERITY_COLOURS: Record<ChecklistItem['severity'], string> = {
  required: '#B3261E',
  recommended: '#8A5000',
  optional: '#56657A',
};

export function ChecklistListScreen() {
  const router = useRouter();
  const { checked, checklists } = useChecklistList();

  if (!checklists) {
    return (
      <NativeScreen>
        <VStack spacing={12}>
          <ProgressView />
          <Text modifiers={[foregroundStyle(SECONDARY)]}>Loading checklists…</Text>
        </VStack>
      </NativeScreen>
    );
  }

  if (checklists.length === 0) {
    return (
      <NativeScreen testID="checklist-list-empty">
        <ContentUnavailableView
          description="No checklist is published in this release."
          systemImage="checklist"
          title="No checklists yet"
        />
      </NativeScreen>
    );
  }

  return (
    <NativeScreen testID="checklist-list-ready">
      <List modifiers={[listStyle('insetGrouped')]}>
        <Section
          footer={
            <Text modifiers={[font({ textStyle: 'footnote' }), foregroundStyle(SECONDARY)]}>
              Ticks are kept on this device, and you can reset a checklist for the next release.
            </Text>
          }
          title="Ship without forgetting"
        >
          {checklists.map((checklist, index) => {
            const badge = formatChecklistBadge(checked[checklist.checklistId] ?? 0, checklist.itemCount);

            return (
              <NativeNavRow
                caption={`${checklist.itemCount} items · ${checklist.requiredCount} required${badge ? ` · ${badge}` : ''}`}
                description={checklist.description}
                key={checklist.checklistId}
                label={getLearningNavigationAccessibility({
                  title: `${checklist.title}, ${checklist.itemCount} items${badge ? `, ${badge}` : ''}`,
                  destination: 'checklist',
                })}
                onPress={() => router.push({ pathname: '/checklists/[checklistId]', params: { checklistId: checklist.checklistId } })}
                symbol="checklist"
                testID={`checklist-item-${index}`}
                tint="#34C759"
                title={checklist.title}
              />
            );
          })}
        </Section>
      </List>
    </NativeScreen>
  );
}

/**
 * The run itself, as a grouped list you tick down.
 *
 * A `Toggle` was the obvious first choice and the wrong one twice over. Its
 * label is not part of its hit target, so tapping the text of an item did
 * nothing — only the switch itself answered. And a switch reads as a setting
 * that stays on, where a checklist item is something you tick off.
 *
 * A row-wide button with a leading checkmark is both the control iOS uses for
 * this and the one that answers a tap anywhere along the row. The Paper screen
 * drew its own checkbox for a related reason, noted there: an unticked native
 * checkbox renders as nothing at all on iOS, leaving the list looking like
 * prose rather than something to act on.
 */
export function ChecklistDetailScreen() {
  const { checklistId } = useLocalSearchParams<{ checklistId: string }>();
  const parsedChecklistId = Number(checklistId);
  const { checkedIds, checklist, items, reset, saveError, toggle } = useChecklistDetail(parsedChecklistId);

  if (checklist === undefined) {
    return (
      <NativeScreen>
        <VStack spacing={12}>
          <ProgressView />
          <Text modifiers={[foregroundStyle(SECONDARY)]}>Loading checklist…</Text>
        </VStack>
      </NativeScreen>
    );
  }

  if (!checklist) {
    return (
      <NativeScreen>
        <ContentUnavailableView
          description="This checklist is unavailable."
          systemImage="exclamationmark.triangle"
          title="Not available"
        />
      </NativeScreen>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: checklist.title }} />
        <NativeScreen testID="checklist-detail-ready">
          <ContentUnavailableView
            description="This checklist has no published items. Try another checklist, or come back after the next content update."
            systemImage="checklist"
            testID="checklist-empty"
            title="Nothing to tick yet"
          />
        </NativeScreen>
      </>
    );
  }

  const summary = summarizeChecklist(items, checkedIds);

  return (
    <>
      <Stack.Screen options={{ title: checklist.title }} />
      <NativeScreen testID="checklist-detail-ready">
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section>
            <VStack alignment="leading" spacing={8} modifiers={[padding({ vertical: 6 })]}>
              <Text
                modifiers={[
                  font({ textStyle: 'caption', weight: 'semibold' }),
                  foregroundStyle(summary.complete ? '#34C759' : NATIVE_TINT),
                ]}
              >
                {summary.complete ? 'READY' : 'IN PROGRESS'}
              </Text>
              <Text modifiers={[font({ textStyle: 'headline' })]}>{formatChecklistProgress(summary)}</Text>
              <Text modifiers={[font({ textStyle: 'footnote' }), foregroundStyle(SECONDARY)]}>
                {checklist.description}
              </Text>
              <ProgressView value={summary.percent / 100} />
              <Button
                modifiers={[buttonStyle('bordered')]}
                onPress={() => void reset()}
                testID="checklist-reset"
              >
                <HStack>
                  <Spacer />
                  <Text>Reset for the next run</Text>
                  <Spacer />
                </HStack>
              </Button>
            </VStack>
          </Section>

          {saveError ? (
            <Section>
              <Text modifiers={[font({ textStyle: 'footnote' }), foregroundStyle('#B3261E')]}>
                {saveError}
              </Text>
            </Section>
          ) : null}

          <Section>
            {items.map((item, index) => {
              const ticked = checkedIds.has(item.itemId);

              return (
                <Button
                  key={item.itemId}
                  modifiers={[
                    buttonStyle('plain'),
                    accessibilityLabel(`${item.label}. ${getChecklistSeverityLabel(item.severity)}.`),
                    accessibilityValue(ticked ? 'Ticked' : 'Not ticked'),
                  ]}
                  onPress={() => void toggle(item)}
                  testID={`checklist-row-${index}`}
                >
                  {/* Baseline-aligned so the circle sits with the title rather
                      than floating at the middle of a tall item. */}
                  <HStack alignment="firstTextBaseline" modifiers={[contentShape(shapes.rectangle())]} spacing={12}>
                    <Image
                      color={ticked ? '#34C759' : '#C7C7CC'}
                      modifiers={[frame({ width: 26 })]}
                      size={22}
                      systemName={ticked ? 'checkmark.circle.fill' : 'circle'}
                    />
                    <VStack alignment="leading" spacing={3}>
                      {/*
                        Markdown rather than the RN inline-code component the
                        Paper screen uses: checklist labels carry backticked
                        identifiers, and SwiftUI renders those itself.
                      */}
                      <Text markdownEnabled>{item.label}</Text>
                      <Text
                        markdownEnabled
                        modifiers={[font({ textStyle: 'footnote' }), foregroundStyle(SECONDARY)]}
                      >
                        {item.detail}
                      </Text>
                      <Text
                        modifiers={[
                          font({ textStyle: 'caption' }),
                          foregroundStyle(SEVERITY_COLOURS[item.severity]),
                        ]}
                      >
                        {getChecklistSeverityLabel(item.severity)}
                      </Text>
                    </VStack>
                    <Spacer />
                  </HStack>
                </Button>
              );
            })}
          </Section>
        </List>
      </NativeScreen>
    </>
  );
}
