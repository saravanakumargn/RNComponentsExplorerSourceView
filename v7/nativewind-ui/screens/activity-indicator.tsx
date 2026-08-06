import { View } from 'react-native';

import { ActivityIndicator, Text } from '../components';
import { DemoScreen, Example } from './demo-layout';

export default function ActivityIndicatorScreen() {
  return (
    <DemoScreen>
      <Example
        title="Basic"
        description="Defaults to the theme's primary color rather than the platform grey."
      >
        <ActivityIndicator />
      </Example>

      <Example title="Sizes">
        <View className="flex-row items-center gap-8">
          <ActivityIndicator size="small" />
          <ActivityIndicator size="large" />
        </View>
      </Example>

      <Example title="Inline" description="Alongside text, as in a loading row.">
        <View className="flex-row items-center gap-3">
          <ActivityIndicator size="small" />
          <Text color="tertiary">Loading…</Text>
        </View>
      </Example>
    </DemoScreen>
  );
}
