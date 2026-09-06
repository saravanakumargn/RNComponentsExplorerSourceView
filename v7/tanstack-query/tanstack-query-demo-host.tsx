import { type ComponentType } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const TanStackQueryDemo = require('./source/official/App').default as ComponentType;

/**
 * Hosts the untouched official TanStack Query React Native example. The example
 * brings its own `NavigationContainer` + stack, so it runs as an independent
 * navigation tree inside the explorer's Expo Router tree.
 */
export function TanStackQueryDemoHost() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TanStackQueryDemo />
    </GestureHandlerRootView>
  );
}
