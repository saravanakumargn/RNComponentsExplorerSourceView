import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button, ProgressIndicator, Text } from '../components';
import { DemoScreen, Example } from './demo-layout';

export default function ProgressIndicatorScreen() {
  const [value, setValue] = useState(35);
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimated((current) => (current >= 100 ? 0 : current + 5));
    }, 400);

    return () => clearInterval(timer);
  }, []);

  return (
    <DemoScreen>
      <Example title="Basic" description="Progress is animated between values.">
        <View className="w-full">
          <ProgressIndicator value={value} />
        </View>
        <View className="flex-row gap-3">
          <Button variant="tonal" size="sm" onPress={() => setValue((v) => Math.max(0, v - 20))}>
            <Text>−20</Text>
          </Button>
          <Button variant="tonal" size="sm" onPress={() => setValue((v) => Math.min(100, v + 20))}>
            <Text>+20</Text>
          </Button>
        </View>
        <Text variant="footnote" color="tertiary">
          {value}%
        </Text>
      </Example>

      <Example title="Running" description="Cycles automatically to show the transition.">
        <View className="w-full">
          <ProgressIndicator value={animated} />
        </View>
      </Example>

      <Example title="Custom max" description="A value of 30 against a max of 60.">
        <View className="w-full">
          <ProgressIndicator value={30} max={60} />
        </View>
      </Example>
    </DemoScreen>
  );
}
