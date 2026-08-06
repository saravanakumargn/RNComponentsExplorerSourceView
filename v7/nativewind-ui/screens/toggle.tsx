import { useState } from 'react';
import { View } from 'react-native';

import { Text, Toggle } from '../components';
import { DemoScreen, Example } from './demo-layout';

export default function ToggleScreen() {
  const [enabled, setEnabled] = useState(true);
  const [notifications, setNotifications] = useState(false);

  return (
    <DemoScreen>
      <Example title="Basic" description="A platform switch tinted with the theme's primary color.">
        <Toggle value={enabled} onValueChange={setEnabled} />
        <Text variant="footnote" color="tertiary">
          {enabled ? 'On' : 'Off'}
        </Text>
      </Example>

      <Example title="In a row" description="The usual settings-row arrangement.">
        <View className="w-full flex-row items-center justify-between">
          <Text>Notifications</Text>
          <Toggle value={notifications} onValueChange={setNotifications} />
        </View>
      </Example>

      <Example title="Disabled">
        <View className="flex-row items-center gap-6">
          <Toggle value disabled />
          <Toggle value={false} disabled />
        </View>
      </Example>
    </DemoScreen>
  );
}
