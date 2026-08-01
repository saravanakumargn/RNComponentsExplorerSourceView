import { type ComponentType } from 'react';

const DeviceInfoDemo = require('./source/official/App').default as ComponentType;

/** Hosts the untouched official Device Info v15.0.2 example. */
export function ReactNativeDeviceInfoDemoHost() {
  return <DeviceInfoDemo />;
}
