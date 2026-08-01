import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomNavigation, Text } from 'react-native-paper';

function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Home!</Text>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Settings!</Text>
    </View>
  );
}

const renderScene = BottomNavigation.SceneMap({
  home: HomeScreen,
  settings: SettingsScreen,
});

function ThemingWithReactNavigation() {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'home', title: 'Home', focusedIcon: 'home' },
    { key: 'settings', title: 'Settings', focusedIcon: 'cog' },
  ]);

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

ThemingWithReactNavigation.title = 'Theming With React Navigation';

export default ThemingWithReactNavigation;
