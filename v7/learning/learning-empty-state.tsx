import { SymbolView } from 'expo-symbols';
import { View } from 'react-native';

import { NativeCard } from '@/components/native-ui/native-card';
import { NativeText } from '@/components/native-ui/native-text';
import { NATIVE_COLORS } from '@/components/native-ui/native-tokens';

type LearningEmptyStateProps = {
  testID?: string;
  title: string;
  message: string;
};

/**
 * Shown when a content-backed list has no rows. Every learning list is fed by
 * the bundled content database, so a content type that has not been authored
 * yet would otherwise render as a heading above nothing — indistinguishable
 * from a failed query.
 *
 * The SwiftUI screens use `ContentUnavailableView` for this, which centres a
 * large glyph over a title and a message. This is that shape, for the screens
 * that stay React Native: the glyph is the message's own weight rather than a
 * 36pt tinted tile, because an empty state is not a row to be tapped.
 */
export function LearningEmptyState({ testID, title, message }: LearningEmptyStateProps) {
  return (
    <NativeCard padding={20} style={{ alignItems: 'center', gap: 6 }}>
      <View testID={testID} style={{ alignItems: 'center', gap: 6 }}>
        <SymbolView name="tray" size={38} tintColor={NATIVE_COLORS.tertiaryLabel} weight="regular" />
        <NativeText style={{ textAlign: 'center' }} textStyle="headline">
          {title}
        </NativeText>
        <NativeText selectable style={{ textAlign: 'center' }} textStyle="footnote" tone="secondary">
          {message}
        </NativeText>
      </View>
    </NativeCard>
  );
}
