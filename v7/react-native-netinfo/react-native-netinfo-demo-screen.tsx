import type { ComponentType } from 'react';

const NetInfoExampleApp = require('./source/official').default as ComponentType;

export function ReactNativeNetInfoDemoScreen() {
  return <NetInfoExampleApp />;
}
