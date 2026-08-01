import { type ComponentType } from 'react';

const ReactNativeMenuDemo = require('./source/official/src/App').App as ComponentType;

/** Hosts the untouched official React Native Menu v2.0.0 example. */
export function ReactNativeMenuDemoHost() {
  return <ReactNativeMenuDemo />;
}
