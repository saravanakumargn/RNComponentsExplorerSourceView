import { type ComponentType } from 'react';
import { View } from 'react-native';

const LottieExampleApp = require('./source/official/App').default as ComponentType;

/** Hosts the official Lottie React Native v7.3.8 example app unmodified. */
export function LottieReactNativeDemoHost() {
  return (
    <View style={{ flex: 1 }}>
      <LottieExampleApp />
    </View>
  );
}
