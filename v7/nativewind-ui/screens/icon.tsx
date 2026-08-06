import { View } from 'react-native';

import { Icon, Text } from '../components';
import { DemoScreen, Example } from './demo-layout';

// Icon takes SF Symbol names and maps them to Material icons on Android via
// rn-icon-mapper, so the same name works on both platforms.
const ICONS = [
  'heart.fill',
  'star.fill',
  'bell.fill',
  'gearshape.fill',
  'trash.fill',
  'square.and.arrow.up',
] as const;

export default function IconScreen() {
  return (
    <DemoScreen>
      <Example
        title="SF Symbols"
        description="Names are SF Symbols, mapped to Material icons on Android."
      >
        <View className="flex-row flex-wrap items-center justify-center gap-6">
          {ICONS.map((name) => (
            <View key={name} className="items-center gap-2">
              <Icon name={name} size={26} />
              <Text variant="caption2" color="tertiary">
                {name}
              </Text>
            </View>
          ))}
        </View>
      </Example>

      <Example title="Sizes">
        <View className="flex-row items-center gap-6">
          <Icon name="bell.fill" size={16} />
          <Icon name="bell.fill" size={24} />
          <Icon name="bell.fill" size={36} />
        </View>
      </Example>

      <Example title="Colors" description="Tinted through the color prop.">
        <View className="flex-row items-center gap-6">
          <Icon name="heart.fill" size={28} color="#ff385f" />
          <Icon name="checkmark.circle.fill" size={28} color="#34c759" />
          <Icon name="exclamationmark" size={28} color="#ff9500" />
        </View>
      </Example>
    </DemoScreen>
  );
}
