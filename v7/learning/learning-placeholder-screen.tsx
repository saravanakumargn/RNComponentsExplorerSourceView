import { Stack, useLocalSearchParams } from 'expo-router';

import { NativeCard } from '@/components/native-ui/native-card';
import { NativeText } from '@/components/native-ui/native-text';
import { CenteredEmptyState } from '@/components/screen-layout';
import { getLearningArea } from '@/features/learning/learning-areas';

export function LearningPlaceholderScreen() {
  const { area } = useLocalSearchParams<{ area: string }>();
  const selectedArea = getLearningArea(area);
  const title = selectedArea?.title ?? 'RN Learning';

  return (
    <CenteredEmptyState testID={`maestro-learning-area-${selectedArea?.id ?? area}-ready`}>
      <Stack.Screen options={{ title }} />
      <NativeText textStyle="title2">{title}</NativeText>
      <NativeCard style={{ gap: 8, maxWidth: 440 }}>
        <NativeText textStyle="headline">Coming back in a later migration</NativeText>
        <NativeText textStyle="footnote" tone="secondary">
          This route is preserved from the old app, but its database-backed
          content remains deferred until its SQLite-backed replacement is designed.
        </NativeText>
      </NativeCard>
    </CenteredEmptyState>
  );
}
