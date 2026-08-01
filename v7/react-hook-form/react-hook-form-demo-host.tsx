import { useMemo, useState, type ComponentType } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ViewSourceButton } from '@/features/source-viewer/view-source-button';

import { REACT_HOOK_FORM_EXAMPLES, type ReactHookFormExampleSlug } from './catalog';
import { BasicFormScreen } from './screens/basic-form-screen';
import { FieldArraysScreen } from './screens/field-arrays-screen';
import { FocusErrorHandlingScreen } from './screens/focus-error-handling-screen';
import { SubmitResetScreen } from './screens/submit-reset-screen';
import { ValidationRulesScreen } from './screens/validation-rules-screen';
import { WatchDependentFieldsScreen } from './screens/watch-dependent-fields-screen';

const exampleComponents: Record<ReactHookFormExampleSlug, ComponentType> = {
  'basic-form': BasicFormScreen,
  'validation-rules': ValidationRulesScreen,
  'field-arrays': FieldArraysScreen,
  'watch-dependent-fields': WatchDependentFieldsScreen,
  'focus-error-handling': FocusErrorHandlingScreen,
  'submit-reset': SubmitResetScreen,
};

const exampleSourcePaths: Record<ReactHookFormExampleSlug, string> = {
  'basic-form': 'features/react-hook-form/screens/basic-form-screen.tsx',
  'validation-rules': 'features/react-hook-form/screens/validation-rules-screen.tsx',
  'field-arrays': 'features/react-hook-form/screens/field-arrays-screen.tsx',
  'watch-dependent-fields': 'features/react-hook-form/screens/watch-dependent-fields-screen.tsx',
  'focus-error-handling': 'features/react-hook-form/screens/focus-error-handling-screen.tsx',
  'submit-reset': 'features/react-hook-form/screens/submit-reset-screen.tsx',
};

type ReactHookFormDemoHostProps = {
  onBackToCatalog: () => void;
};

function DemoHeader({
  title,
  onBack,
  sourcePath,
}: {
  onBack: () => void;
  sourcePath?: string;
  title: string;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.outlineVariant },
      ]}
    >
      <IconButton icon="chevron-left" accessibilityLabel="Back" onPress={onBack} />
      <Text variant="titleMedium" style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <ViewSourceButton
        demoId="react-hook-form"
        title="Source"
        initialPath={sourcePath}
        onlyInitialPath={sourcePath !== undefined}
      />
    </View>
  );
}

export function ReactHookFormDemoHost({ onBackToCatalog }: ReactHookFormDemoHostProps) {
  const theme = useTheme();
  const [selectedSlug, setSelectedSlug] = useState<ReactHookFormExampleSlug | null>(null);
  const examples = useMemo(() => REACT_HOOK_FORM_EXAMPLES, []);

  if (selectedSlug) {
    const meta = examples.find((example) => example.slug === selectedSlug);
    const ExampleComponent = exampleComponents[selectedSlug];

    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.background }}>
          <DemoHeader
            title={meta?.title ?? selectedSlug}
            onBack={() => setSelectedSlug(null)}
            sourcePath={exampleSourcePaths[selectedSlug]}
          />
        </SafeAreaView>
        <ExampleComponent />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.background }}>
        <DemoHeader title="React Hook Form" onBack={onBackToCatalog} />
      </SafeAreaView>
      <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.list}>
        {examples.map((example) => (
          <Pressable
            key={example.slug}
            onPress={() => setSelectedSlug(example.slug)}
            style={[styles.card, { borderColor: theme.colors.outlineVariant }]}
            testID={example.title}
          >
            <Text variant="titleMedium">{example.title}</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {example.description}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingRight: 12,
  },
  headerTitle: {
    flex: 1,
  },
  list: {
    gap: 12,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
});
