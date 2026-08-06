import { Pressable, ScrollView, View } from 'react-native';

import { Icon, Text } from '../components';

export type DemoEntry = {
  name: string;
  title: string;
  description: string;
};

export const DEMOS: DemoEntry[] = [
  { name: 'activity-indicator', title: 'Activity Indicator', description: 'Themed spinner' },
  { name: 'avatar', title: 'Avatar', description: 'Image with fallback' },
  { name: 'button', title: 'Button', description: 'Four variants and four sizes' },
  { name: 'date-picker', title: 'Date Picker', description: 'Date and time selection' },
  { name: 'icon', title: 'Icon', description: 'SF Symbols, mapped on Android' },
  { name: 'picker', title: 'Picker', description: 'Themed platform picker' },
  { name: 'progress-indicator', title: 'Progress Indicator', description: 'Animated progress bar' },
  { name: 'slider', title: 'Slider', description: 'Continuous and stepped' },
  { name: 'text', title: 'Text', description: 'iOS type scale and emphasis' },
  { name: 'theme-toggle', title: 'Theme Toggle', description: 'Light and dark switch' },
  { name: 'toggle', title: 'Toggle', description: 'Platform switch' },
];

export default function IndexScreen({ onSelect }: { onSelect: (name: string) => void }) {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-3 p-4 pb-16"
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text variant="footnote" color="tertiary">
        The {DEMOS.length} components published in NativeWindUI&apos;s open-source repository.
      </Text>

      {DEMOS.map((demo) => (
        <Pressable
          key={demo.name}
          onPress={() => onSelect(demo.name)}
          className="flex-row items-center gap-3 rounded-xl bg-card p-4 active:opacity-70"
        >
          <View className="flex-1 gap-1">
            <Text variant="heading">{demo.title}</Text>
            <Text variant="footnote" color="tertiary">
              {demo.description}
            </Text>
          </View>
          <Icon name="chevron.right" size={18} />
        </Pressable>
      ))}
    </ScrollView>
  );
}
