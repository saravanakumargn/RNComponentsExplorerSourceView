import { useCallback, type ComponentType } from 'react';
import { useRouter } from 'expo-router';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { PortalProvider } from '@gorhom/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const ReanimatedExampleApp = require('./source/official/apps/reanimated/App')
  .default as ComponentType<{ onExit: () => void }>;

export function ReanimatedDemoScreen() {
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
        <NavigationContainer>
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
