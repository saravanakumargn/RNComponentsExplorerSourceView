import type { ComponentType, PropsWithChildren } from 'react';
import { useState } from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { PortalProvider as TamaguiPortalProvider } from '@tamagui/portal';
import { PortalProvider } from 'react-native-teleport';

import { DemoBackButton } from '@/components/demo-back-button';
import { ViewSourceButton } from '@/features/source-viewer/view-source-button';

type UpstreamTamaguiScreens = {
  DemoScreen: ComponentType<{ demoName: string }>;
  HomeScreen: ComponentType<{ onSelect: (demoName: string) => void }>;
  Provider: ComponentType<PropsWithChildren>;
};

// The official source is compiled by Metro at runtime. Its own project does not
// type-check these demo files with this app's strict TypeScript configuration.
const { DemoScreen, HomeScreen, Provider } = require('./source/official/kitchen-sink-shared/src') as UpstreamTamaguiScreens;
const demoKeys = (require('./source/official/kitchen-sink-shared/src/demos').demos as { key: string }[])
  .map((demo) => demo.key);

export function TamaguiDemoScreen({ initialDemo }: { initialDemo?: string }) {
  // Selection is local state rather than a nested navigator, so `?demo=` seeds
  // the initial selection instead of a route. An unknown key falls through to
  // the list, matching how the deep link behaves everywhere else.
  const [activeDemo, setActiveDemo] = useState<string | undefined>(
    initialDemo && demoKeys.includes(initialDemo) ? initialDemo : undefined,
  );
  const sourcePath = activeDemo
    ? `features/tamagui/source/official/demos/src/${activeDemo}Demo.tsx`
    : 'features/tamagui/source/official/kitchen-sink-shared/src/HomeScreen.tsx';

  return (
    <PortalProvider>
      <Stack.Screen
        options={{
          // While a demo is open the header back control returns to the demo
          // list, so the demo itself does not need its own in-body back button.
          headerLeft: activeDemo
            ? ({ tintColor }) => (
                <DemoBackButton
                  tintColor={tintColor}
                  onPress={() => setActiveDemo(undefined)}
                />
              )
            : undefined,
          headerRight: () => (
            <ViewSourceButton
              demoId="tamagui"
              iconOnly
              title="Tamagui source"
              initialPath={sourcePath}
              onlyInitialPath
            />
          ),
        }}
      />
      <TamaguiPortalProvider>
        <Provider>
          {activeDemo ? (
            // The explorer's own header keeps the library title while a demo is
            // open, so this wrapper is what tells the smoke suite which demo
            // actually mounted.
            <View style={{ flex: 1 }} testID={`maestro-demo-tamagui-${activeDemo}-ready`}>
              <DemoScreen demoName={activeDemo} />
            </View>
          ) : (
            <HomeScreen onSelect={setActiveDemo} />
          )}
        </Provider>
      </TamaguiPortalProvider>
    </PortalProvider>
  );
}
