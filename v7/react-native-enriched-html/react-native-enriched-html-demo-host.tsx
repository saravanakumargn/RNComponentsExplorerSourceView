import { useFonts } from 'expo-font';
import { type ComponentType } from 'react';

const OfficialApp = require('./source/official/App').default as ComponentType;

/** Hosts the official React Native Enriched HTML v1.0.1 example app. */
export function ReactNativeEnrichedHtmlDemoHost() {
  const [fontsLoaded] = useFonts({
    FontAwesome: require('@react-native-vector-icons/fontawesome/fonts/FontAwesome.ttf'),
  });

  if (!fontsLoaded) return null;

  return <OfficialApp />;
}
