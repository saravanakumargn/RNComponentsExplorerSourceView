import { View } from 'react-native';
import { Card, List, Text } from 'react-native-paper';

import { ScreenLayout } from '@/components/screen-layout';

export function MoreScreen() {
  return (
    <ScreenLayout testID="maestro-more-ready">
      <Card mode="outlined">
        <Card.Content style={{ gap: 8 }}>
          <Text variant="titleMedium">React Native Components Explorer</Text>
          <Text variant="bodyMedium">
            The original More tab is retained as the home for support and app
            information. Purchase, advertising, and review integrations will be
            reconsidered only when their supporting flows are migrated.
          </Text>
        </Card.Content>
      </Card>
      <View>
        <List.Item title="Support and subscription" description="Not migrated yet" />
        <List.Item title="Rate & review" description="Not migrated yet" />
        <List.Item title="Privacy policy" description="Not migrated yet" />
      </View>
      <Text variant="bodySmall">Expo SDK 54 migration baseline</Text>
    </ScreenLayout>
  );
}
