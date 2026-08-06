import { useState } from 'react';
import { View } from 'react-native';

import { Picker, PickerItem, Text } from '../components';
import { DemoScreen, Example } from './demo-layout';

const FRAMEWORKS = ['Expo', 'React Native', 'Next.js', 'Remix'];

export default function PickerScreen() {
  const [framework, setFramework] = useState(FRAMEWORKS[0]);

  return (
    <DemoScreen>
      <Example title="Basic" description="Wraps the community picker with theme colors applied.">
        <View className="w-full">
          <Picker selectedValue={framework} onValueChange={setFramework}>
            {FRAMEWORKS.map((item) => (
              <PickerItem key={item} label={item} value={item} />
            ))}
          </Picker>
        </View>
        <Text variant="footnote" color="tertiary">
          Selected: {framework}
        </Text>
      </Example>
    </DemoScreen>
  );
}
