import { View } from 'react-native';

import { Button, Icon, Text } from '../components';
import { DemoScreen, Example } from './demo-layout';

export default function ButtonScreen() {
  return (
    <DemoScreen>
      <Example title="Variants" description="primary, secondary, tonal and plain.">
        <Button>
          <Text>Primary</Text>
        </Button>
        <Button variant="secondary">
          <Text>Secondary</Text>
        </Button>
        <Button variant="tonal">
          <Text>Tonal</Text>
        </Button>
        <Button variant="plain">
          <Text>Plain</Text>
        </Button>
      </Example>

      <Example title="Sizes" description="sm, md and lg.">
        <Button size="sm">
          <Text>Small</Text>
        </Button>
        <Button size="md">
          <Text>Medium</Text>
        </Button>
        <Button size="lg">
          <Text>Large</Text>
        </Button>
      </Example>

      <Example title="With icons" description="Icon plus label, and an icon-only button.">
        <Button>
          <Icon name="play.fill" size={16} color="white" />
          <Text>Play</Text>
        </Button>
        <View className="flex-row gap-3">
          <Button variant="tonal" size="icon">
            <Icon name="heart.fill" size={20} />
          </Button>
          <Button variant="secondary" size="icon">
            <Icon name="star.fill" size={20} />
          </Button>
        </View>
      </Example>

      <Example title="Disabled">
        <Button disabled>
          <Text>Disabled</Text>
        </Button>
      </Example>
    </DemoScreen>
  );
}
