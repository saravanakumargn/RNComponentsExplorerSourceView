import { NavigationIndependentTree } from '@react-navigation/native';
import { type ComponentType } from 'react';

const GestureHandlerDemo = require('./source/official/App').default as ComponentType;

/** Hosts the untouched official Gesture Handler v3.1.0 showcase. */
export function ReactNativeGestureHandlerDemoHost() {
  return (
    <NavigationIndependentTree>
      <GestureHandlerDemo />
    </NavigationIndependentTree>
  );
}
