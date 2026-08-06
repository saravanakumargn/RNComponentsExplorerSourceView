import { useState } from 'react';
import { View } from 'react-native';

import { Slider, Text } from '../components';
import { DemoScreen, Example } from './demo-layout';

export default function SliderScreen() {
  const [value, setValue] = useState(0.5);
  const [steps, setSteps] = useState(3);

  return (
    <DemoScreen>
      <Example title="Basic" description="Continuous value between 0 and 1.">
        <View className="w-full">
          <Slider value={value} onValueChange={setValue} minimumValue={0} maximumValue={1} />
        </View>
        <Text variant="footnote" color="tertiary">
          {value.toFixed(2)}
        </Text>
      </Example>

      <Example title="Stepped" description="Whole numbers from 0 to 10.">
        <View className="w-full">
          <Slider
            value={steps}
            onValueChange={setSteps}
            minimumValue={0}
            maximumValue={10}
            step={1}
          />
        </View>
        <Text variant="footnote" color="tertiary">
          {steps}
        </Text>
      </Example>

      <Example title="Disabled">
        <View className="w-full">
          <Slider value={0.4} minimumValue={0} maximumValue={1} disabled />
        </View>
      </Example>
    </DemoScreen>
  );
}
