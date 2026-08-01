import type { ComponentType } from 'react';

// The official showcase owns its own example selector and in-example Back
// action. Expo Router supplies the catalog-level navigation header.
const ReactNativeMapsExampleApp = require('./source/official/App').default as ComponentType;

export function ReactNativeMapsDemoScreen() {
  return <ReactNativeMapsExampleApp />;
}
