import type { ComponentType, PropsWithChildren } from 'react';
import { useState } from 'react';
import { Stack } from 'expo-router';
import { PortalProvider as TamaguiPortalProvider } from '@tamagui/portal';
import { PortalProvider } from 'react-native-teleport';

import { ViewSourceButton } from '@/features/source-viewer/view-source-button';

type UpstreamTamaguiScreens = {
  DemoScreen: ComponentType<{ demoName: string; onBack: () => void }>;
  HomeScreen: ComponentType<{ onSelect: (demoName: string) => void }>;
  Provider: ComponentType<PropsWithChildren>;
};

// The official source is compiled by Metro at runtime. Its own project does not
// type-check these demo files with this app's strict TypeScript configuration.
const { DemoScreen, HomeScreen, Provider } = require('./source/official/kitchen-sink-shared/src') as UpstreamTamaguiScreens;

export function TamaguiDemoScreen() {
  const [activeDemo, setActiveDemo] = useState<string>();
  const sourcePath = activeDemo
    ? `features/tamagui/source/official/demos/src/${activeDemo}Demo.tsx`
    : 'features/tamagui/source/official/kitchen-sink-shared/src/HomeScreen.tsx';

  return (
    <PortalProvider>
      <Stack.Screen
        options={{
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
            <DemoScreen demoName={activeDemo} onBack={() => setActiveDemo(undefined)} />
          ) : (
            <HomeScreen onSelect={setActiveDemo} />
          )}
        </Provider>
      </TamaguiPortalProvider>
    </PortalProvider>
  );
}
