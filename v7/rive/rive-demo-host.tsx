import { useCallback, useState, type ComponentType } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Divider, List, Text, useTheme } from 'react-native-paper';

import { useBottomContentPadding } from '@/components/screen-layout';

/**
 * Hosts the official rive-react-native example screens with a local navigation
 * tree instead of upstream's Expo Router one.
 *
 * Upstream's `app/index.tsx` is a list of `<Link href="/(examples)/…">` and
 * `app/_layout.tsx` is an expo-router `Stack`. Both resolve against *this* app's
 * router once vendored, so neither is mounted. Every one of the 19 example
 * screens is mounted unmodified — none of them import expo-router, which is what
 * makes this arrangement possible without touching vendored source.
 *
 * The two router files are still vendored and listed in the source viewer,
 * because they are where upstream shows how the example is wired together.
 */

type Example = { key: string; title: string; load: () => ComponentType };

// Order and titles follow upstream's index.tsx.
const EXAMPLES: Example[] = [
  { key: 'QuickStart', title: 'Quick Start', load: () => require('./source/official/app/(examples)/QuickStart').default },
  { key: 'Simple', title: 'Simple', load: () => require('./source/official/app/(examples)/Simple').default },
  { key: 'DemoScripting', title: 'Demo Scripting', load: () => require('./source/official/app/(examples)/DemoScripting').default },
  { key: 'DataBinding', title: 'Data Binding', load: () => require('./source/official/app/(examples)/DataBinding').default },
  { key: 'Http', title: 'HTTP', load: () => require('./source/official/app/(examples)/Http').default },
  { key: 'MeshExample', title: 'Mesh Example', load: () => require('./source/official/app/(examples)/MeshExample').default },
  { key: 'Layout', title: 'Layout', load: () => require('./source/official/app/(examples)/Layout').default },
  { key: 'ResponsiveLayout', title: 'Responsive Layout', load: () => require('./source/official/app/(examples)/ResponsiveLayout').default },
  { key: 'SimpleControls', title: 'Simple Controls', load: () => require('./source/official/app/(examples)/SimpleControls').default },
  { key: 'MultipleArtboards', title: 'Multiple Artboards', load: () => require('./source/official/app/(examples)/MultipleArtboards').default },
  { key: 'StateMachine', title: 'State Machine', load: () => require('./source/official/app/(examples)/StateMachine').default },
  { key: 'Events', title: 'Events', load: () => require('./source/official/app/(examples)/Events').default },
  { key: 'DynamicText', title: 'Dynamic Text', load: () => require('./source/official/app/(examples)/DynamicText').default },
  { key: 'NestedDynamicText', title: 'Nested Dynamic Text', load: () => require('./source/official/app/(examples)/NestedDynamicText').default },
  { key: 'NestedInputs', title: 'Nested Inputs', load: () => require('./source/official/app/(examples)/NestedInputs').default },
  { key: 'OutOfBandAssets', title: 'Out of Band Assets', load: () => require('./source/official/app/(examples)/OutOfBandAssets').default },
  { key: 'SourceProp', title: 'Source Prop', load: () => require('./source/official/app/(examples)/SourceProp').default },
  { key: 'ErrorHandledManually', title: 'Error Handled Manually', load: () => require('./source/official/app/(examples)/ErrorHandledManually').default },
  { key: 'ErrorNotHandled', title: 'Error Not Handled', load: () => require('./source/official/app/(examples)/ErrorNotHandled').default },
];

export function RiveDemoHost({ initialDemo }: { initialDemo?: string }) {
  const theme = useTheme();
  const bottomPadding = useBottomContentPadding(32);
  // `?demo=` names an EXAMPLES key; an unknown one opens the list, as elsewhere.
  const [selected, setSelected] = useState<Example | null>(
    () => EXAMPLES.find((example) => example.key === initialDemo) ?? null,
  );

  const back = useCallback(() => setSelected(null), []);

  if (selected) {
    const Screen = selected.load();
    return (
      <View style={styles.flex}>
        <Appbar.Header mode="small" elevated>
          <Appbar.BackAction onPress={back} accessibilityLabel="Back to Rive examples" />
          <Appbar.Content title={selected.title} />
        </Appbar.Header>
        <View style={styles.flex} testID={`rive-example-${selected.key}`}>
          <Screen />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: bottomPadding }}
      testID="rive-example-list"
    >
      <Text variant="bodyMedium" style={[styles.intro, { color: theme.colors.onSurfaceVariant }]}>
        The official example&apos;s {EXAMPLES.length} screens, unmodified. Animations load either
        from a native bundled resource or over HTTP — the HTTP ones need a connection.
      </Text>
      <Divider />
      {EXAMPLES.map((example) => (
        <List.Item
          key={example.key}
          title={example.title}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => setSelected(example)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  intro: { padding: 16 },
});
