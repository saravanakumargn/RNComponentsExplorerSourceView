import * as React from 'react';
import {
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBottomContentPadding } from '@/components/screen-layout';

import { useExampleTheme } from './hooks/useExampleTheme';

type Props = ScrollViewProps & {
  children: React.ReactNode;
  withScrollView?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export default function ScreenWrapper({
  children,
  withScrollView = true,
  style,
  contentContainerStyle,
  ...rest
}: Props) {
  const theme = useExampleTheme();

  const insets = useSafeAreaInsets();
  const bottomPadding = useBottomContentPadding(insets.bottom);

  const containerStyle = [
    styles.container,
    {
      backgroundColor: theme.colors.background,
      paddingLeft: insets.left,
      paddingRight: insets.left,
    },
  ];

  return (
    <>
      {withScrollView ? (
        <ScrollView
          {...rest}
          contentContainerStyle={[contentContainerStyle, { paddingBottom: bottomPadding }]}
          keyboardShouldPersistTaps="always"
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          style={[containerStyle, style]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[containerStyle, style]}>{children}</View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
