import { NavigationIndependentTree } from '@react-navigation/native';
import { type ComponentType } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BackToCatalogProvider } from './navigation-bridge';

const ReactNativeElementsDemo = require('./source/official/example/App').default as ComponentType;

type ReactNativeElementsDemoHostProps = {
  onBackToCatalog: () => void;
};

export function ReactNativeElementsDemoHost({ onBackToCatalog }: ReactNativeElementsDemoHostProps) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationIndependentTree>
        <BackToCatalogProvider value={onBackToCatalog}>
          <ReactNativeElementsDemo />
        </BackToCatalogProvider>
      </NavigationIndependentTree>
    </GestureHandlerRootView>
  );
}
