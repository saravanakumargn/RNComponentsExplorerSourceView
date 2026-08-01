import { type ComponentType } from 'react';

const OfficialMarkdownTextScreen = require('./source/official/screens/text/TextScreen')
  .default as ComponentType;

/** Hosts the official React Native Enriched Markdown v0.7.4 text example. */
export function ReactNativeEnrichedMarkdownDemoHost() {
  return <OfficialMarkdownTextScreen />;
}
