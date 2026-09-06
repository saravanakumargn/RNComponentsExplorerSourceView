import { useCallback, type ComponentType } from 'react';
import { useRouter } from 'expo-router';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { PortalProvider } from '@gorhom/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { nestedDemoInitialState } from '@/components/nested-demo-deep-link';

const ReanimatedExampleApp = require('./source/official/apps/reanimated/App')
  .default as ComponentType<{ onExit: () => void }>;

// The upstream navigator names each screen after its EXAMPLES key, so the same
// record that builds the list is also the set of routes `?demo=` may address.
// Requiring it here only defines the lazy screen wrappers; no example module is
// evaluated until its route is actually rendered.
const exampleRouteNames = Object.keys(
  require('./source/official/apps/reanimated/examples').EXAMPLES as Record<string, unknown>,
);

export function ReanimatedDemoScreen({ initialDemo }: { initialDemo?: string }) {
  const router = useRouter();
  const handleExit = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  }, [router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationIndependentTree>
        <NavigationContainer
          initialState={nestedDemoInitialState('Examples', initialDemo, exampleRouteNames)}
        >
          <PortalProvider>
            <SafeAreaProvider>
              <ReanimatedExampleApp onExit={handleExit} />
            </SafeAreaProvider>
          </PortalProvider>
        </NavigationContainer>
      </NavigationIndependentTree>
    </GestureHandlerRootView>
  );
}
