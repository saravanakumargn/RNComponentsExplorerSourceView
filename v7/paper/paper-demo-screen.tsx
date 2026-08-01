import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

import { CenteredEmptyState } from '@/components/screen-layout';
import { getPaperExample, paperExampleSourcePaths } from '@/features/paper-example/paper-example-list';
import type { PaperDemoNavigation } from '@/features/paper-example/navigation-types';
import { PaperExampleProvider } from '@/features/paper-example/paper-example-provider';
import { ViewSourceButton } from '@/features/source-viewer/view-source-button';

export function PaperDemoScreen() {
  const { demo, library, sourceColor, headerTitle, darkMode } = useLocalSearchParams<{
    demo: string;
    library: string;
    sourceColor?: string;
    headerTitle?: string;
    darkMode?: string;
  }>();
  const router = useRouter();
  const Example = library === 'react-native-paper' ? getPaperExample(demo) : undefined;

  if (!Example) {
    return (
      <CenteredEmptyState>
        <Stack.Screen options={{ title: 'Demo not found' }} />
        <Text variant="headlineSmall">Demo not found</Text>
        <Text variant="bodyMedium">This demo has not been migrated yet.</Text>
      </CenteredEmptyState>
    );
  }

  const navigation: PaperDemoNavigation = {
    goBack: () => router.back(),
    navigate: (nextDemo: string, params?: Record<string, string | boolean>) =>
      router.push({
        pathname: '/library/[library]/[demo]',
        params: {
          library: 'react-native-paper',
          demo: nextDemo,
          ...params,
        },
      }),
    setOptions: () => undefined,
  };

  return (
    <PaperExampleProvider>
      <View style={{ flex: 1 }} testID={`maestro-paper-demo-${demo}-ready`}>
        <Stack.Screen
          options={{
            title: Example.title,
            headerRight: () => (
              <ViewSourceButton
                demoId="react-native-paper"
                iconOnly
                title="React Native Paper source"
                initialPath={paperExampleSourcePaths[demo]}
                onlyInitialPath={paperExampleSourcePaths[demo] !== undefined}
              />
            ),
          }}
        />
        <Example
          navigation={navigation}
          route={{
            key: demo,
            params: {
              darkMode: darkMode === 'true',
              headerTitle: headerTitle ?? 'Team Paper',
              sourceColor: sourceColor ?? 'paper',
            },
          }}
        />
      </View>
    </PaperExampleProvider>
  );
}
