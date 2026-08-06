import { type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { Text } from '../components';

/**
 * Shared scaffolding for the NativeWindUI demo screens.
 *
 * NativeWindUI's public repo ships a single scrolling gallery rather than a
 * screen per component, so the explorer supplies its own screens to match how
 * every other library demo here is organised. Only the surrounding layout is
 * ours — each `Example` renders the upstream components unmodified.
 */
export function DemoScreen({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-6 p-4 pb-16"
      contentInsetAdjustmentBehavior="automatic"
    >
      {children}
    </ScrollView>
  );
}

export function Example({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-3">
      <View className="gap-1">
        <Text variant="heading">{title}</Text>
        {description ? (
          <Text variant="footnote" color="tertiary">
            {description}
          </Text>
        ) : null}
      </View>
      <View className="items-center gap-4 rounded-xl bg-card p-4">{children}</View>
    </View>
  );
}
