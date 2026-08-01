import { type ComponentType } from 'react';

const OfficialOscillatorExample = require('./source/official/examples/Oscillator').default as ComponentType;

/** Hosts the official React Native Audio API v0.13.2 oscillator example. */
export function ReactNativeAudioApiDemoHost() {
  return <OfficialOscillatorExample />;
}
