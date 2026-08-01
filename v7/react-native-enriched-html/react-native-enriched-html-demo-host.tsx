import { type ComponentType } from 'react';

const OfficialEnrichedTextScreen = require('./source/official/screens/EnrichedTextScreen')
  .EnrichedTextScreen as ComponentType<{ onSwitch: () => void }>;

/** Hosts the official React Native Enriched HTML v1.0.1 display example. */
export function ReactNativeEnrichedHtmlDemoHost() {
  return <OfficialEnrichedTextScreen onSwitch={() => undefined} />;
}
