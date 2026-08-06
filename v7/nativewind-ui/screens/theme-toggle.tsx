import { View } from 'react-native';

import { Text, ThemeToggle } from '../components';
import { DemoScreen, Example } from './demo-layout';

export default function ThemeToggleScreen() {
  return (
    <DemoScreen>
      <Example
        title="Theme toggle"
        description="Switches this demo between its light and dark palette, with a zoom-rotate transition."
      >
        <ThemeToggle />
      </Example>

      <Example title="Reacting to the theme" description="These surfaces follow the active palette.">
        <View className="w-full gap-3">
          <View className="rounded-lg bg-background p-3">
            <Text variant="footnote">bg-background</Text>
          </View>
          <View className="rounded-lg bg-primary p-3">
            <Text variant="footnote" className="text-primary-foreground">
              bg-primary
            </Text>
          </View>
          <View className="rounded-lg bg-muted/30 p-3">
            <Text variant="footnote" color="tertiary">
              bg-muted
            </Text>
          </View>
        </View>
      </Example>
    </DemoScreen>
  );
}
