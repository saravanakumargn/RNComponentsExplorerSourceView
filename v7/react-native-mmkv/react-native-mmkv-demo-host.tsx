import { type ComponentType } from 'react';

const MmkvDemo = require('./source/official/App').default as ComponentType;

/** Hosts the untouched official react-native-mmkv v4.3.0 example. */
export function ReactNativeMmkvDemoHost() {
  return <MmkvDemo />;
}
