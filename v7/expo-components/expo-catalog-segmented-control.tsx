import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from 'ThemeProvider';

type ExpoCatalogSegmentedControlProps = {
  selected: 'apis' | 'components';
  onSelect: (section: 'apis' | 'components') => void;
};

export function ExpoCatalogSegmentedControl({
  selected,
  onSelect,
}: ExpoCatalogSegmentedControlProps) {
  const { theme } = useTheme();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.container,
        {
          backgroundColor: theme.background.subtle,
          borderBottomColor: theme.border.secondary,
        },
      ]}>
      {(['apis', 'components'] as const).map((section) => {
        const isSelected = selected === section;

        return (
          <Pressable
            key={section}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(section)}
            style={[
              styles.button,
              isSelected && { backgroundColor: theme.background.default },
            ]}>
            <Text
              style={{
                color: theme.text.default,
                fontWeight: isSelected ? '600' : '400',
                opacity: isSelected ? 1 : 0.65,
              }}>
              {section === 'apis' ? 'APIs' : 'Components'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 36,
  },
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 4,
    padding: 8,
  },
});
