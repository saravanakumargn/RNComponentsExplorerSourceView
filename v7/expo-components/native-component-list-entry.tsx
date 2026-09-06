import { NavigationIndependentTree } from '@react-navigation/native';
import { useEffect } from 'react';

import NativeComponentListApp from './source/official/native-component-list/App';
import { setCatalogBackHandler } from './catalog-navigation-bridge';
import { expoComponentsInitialState } from './demo-initial-state';

/**
 * Integration boundary: the upstream app owns its nested navigation tree while
 * the surrounding Expo Router stack keeps the catalog-level Back button.
 */
type NativeComponentListEntryProps = {
  initialDemo?: string;
  onBackToCatalog: () => void;
};

export function NativeComponentListEntry({
  initialDemo,
  onBackToCatalog,
}: NativeComponentListEntryProps) {
  useEffect(() => setCatalogBackHandler(onBackToCatalog), [onBackToCatalog]);

  return (
    <NavigationIndependentTree>
      <NativeComponentListApp initialState={expoComponentsInitialState(initialDemo)} />
    </NavigationIndependentTree>
  );
}
