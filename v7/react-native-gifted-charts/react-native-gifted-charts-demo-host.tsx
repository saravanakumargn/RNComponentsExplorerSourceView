import { type ComponentType } from 'react';
import { View } from 'react-native';

const GiftedChartsDemo = require('./source/official/App').default as ComponentType;

export function ReactNativeGiftedChartsDemoHost() {
  return (
    <View style={{ flex: 1 }}>
      <GiftedChartsDemo />
    </View>
  );
}
