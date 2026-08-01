import { Stack, useLocalSearchParams } from 'expo-router';
import { Card, Text } from 'react-native-paper';

import { CenteredEmptyState } from '@/components/screen-layout';
import { getLearningArea } from '@/features/learning/learning-areas';

export function LearningPlaceholderScreen() {
  const { area } = useLocalSearchParams<{ area: string }>();
  const selectedArea = getLearningArea(area);
  const title = selectedArea?.title ?? 'RN Learning';

  return (
    <CenteredEmptyState testID={`maestro-learning-area-${selectedArea?.id ?? area}-ready`}>
      <Stack.Screen options={{ title }} />
      <Text variant="headlineSmall">{title}</Text>
      <Card mode="outlined" style={{ maxWidth: 440 }}>
        <Card.Content style={{ gap: 8 }}>
          <Text variant="titleMedium">Coming back in a later migration</Text>
          <Text variant="bodyMedium">
            This route is preserved from the old app, but its database-backed
            content remains deferred until its SQLite-backed replacement is designed.
          </Text>
        </Card.Content>
      </Card>
    </CenteredEmptyState>
  );
}
