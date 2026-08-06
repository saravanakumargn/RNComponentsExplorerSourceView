import { View } from 'react-native';

import { Text } from '../components';
import { DemoScreen, Example } from './demo-layout';

const VARIANTS = [
  'largeTitle',
  'title1',
  'title2',
  'title3',
  'heading',
  'body',
  'callout',
  'subhead',
  'footnote',
  'caption1',
  'caption2',
] as const;

const COLORS = ['primary', 'secondary', 'tertiary', 'quarternary'] as const;

export default function TextScreen() {
  return (
    <DemoScreen>
      <Example title="Variants" description="The iOS type scale, from largeTitle to caption2.">
        <View className="w-full gap-2">
          {VARIANTS.map((variant) => (
            <Text key={variant} variant={variant}>
              {variant}
            </Text>
          ))}
        </View>
      </Example>

      <Example title="Colors" description="Emphasis levels applied on top of any variant.">
        <View className="w-full gap-2">
          {COLORS.map((color) => (
            <Text key={color} color={color}>
              {color}
            </Text>
          ))}
        </View>
      </Example>
    </DemoScreen>
  );
}
