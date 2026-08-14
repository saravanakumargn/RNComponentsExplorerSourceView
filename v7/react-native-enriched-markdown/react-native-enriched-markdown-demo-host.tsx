import { NavigationIndependentTree } from '@react-navigation/native';
import { type ComponentType } from 'react';

type ReactNativeEnrichedMarkdownDemoHostProps = {
  onBackToCatalog?: () => void;
};

const OfficialApp = require('./source/official/App')
  .default as ComponentType<ReactNativeEnrichedMarkdownDemoHostProps>;

/** Hosts the official React Native Enriched Markdown v1.0.1 example app. */
export function ReactNativeEnrichedMarkdownDemoHost({
  onBackToCatalog,
}: ReactNativeEnrichedMarkdownDemoHostProps) {
  return (
    <NavigationIndependentTree>
      <OfficialApp onBackToCatalog={onBackToCatalog} />
    </NavigationIndependentTree>
  );
}
