import { type ComponentType } from 'react';

const HapticFeedbackDemo = require('./source/official/App').default as ComponentType;

/** Hosts the official react-native-haptic-feedback 3.0.0 example. */
export function ReactNativeHapticFeedbackDemoHost() {
  return <HapticFeedbackDemo />;
}
