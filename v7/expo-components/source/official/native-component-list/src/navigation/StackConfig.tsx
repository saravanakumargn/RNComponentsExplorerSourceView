import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigatorProps } from '@react-navigation/native-stack';
import { ThemeType } from 'ThemeProvider';
import * as React from 'react';
import { View, Platform, TouchableOpacity } from 'react-native';

import { ViewSourceButton } from '../../../../../../source-viewer/view-source-button';

const expoComponentSourcePaths = require('./source-paths.json') as Record<string, string>;

export default function getStackConfig(
  navigation: BottomTabNavigationProp<any>,
  theme: ThemeType
): Partial<NativeStackNavigatorProps> {
  return {
    screenOptions: ({ route }) => ({
      contentStyle: { backgroundColor: theme.background.default },
      headerStyle: { backgroundColor: theme.background.default },
      headerTintColor: theme.icon.info,
      headerTitleStyle: { color: theme.text.default },
      headerRight: () => (
        <HeaderRightComponent
          navigation={navigation}
          theme={theme}
          sourcePath={
            expoComponentSourcePaths[route.name] ??
            (route.name === 'ExpoComponents'
              ? 'features/expo-components/source/official/native-component-list/src/screens/ExpoComponentsScreen.tsx'
              : route.name === 'ExpoApis'
                ? 'features/expo-components/source/official/native-component-list/src/screens/ExpoApisScreen.tsx'
                : undefined)
          }
        />
      ),
    }),
  };
}

const IS_NAV_PERSISTED = 'PERSIST_NAV_STATE';
const HeaderRightComponent = ({
  navigation,
  theme,
  sourcePath,
}: {
  navigation: BottomTabNavigationProp<any>;
  theme: ThemeType;
  sourcePath?: string;
}) => {
  const [isNavPersisted, setIsNavPersisted] = React.useState(false);
  React.useEffect(() => {
    AsyncStorage.getItem(IS_NAV_PERSISTED).then((value) => setIsNavPersisted(!!value));
  }, []);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginBottom: 4,
        marginTop: 4,
        gap: 20,
      }}>
      <TouchableOpacity
        onPress={() => {
          (isNavPersisted
            ? AsyncStorage.removeItem(IS_NAV_PERSISTED)
            : AsyncStorage.setItem(IS_NAV_PERSISTED, 'enabled')
          ).then(() => setIsNavPersisted(!isNavPersisted));
        }}>
        <Ionicons
          name={isNavPersisted ? 'lock-closed' : 'lock-open'}
          size={Platform.OS === 'ios' ? 22 : 25}
          color={isNavPersisted ? theme.icon.info : theme.icon.default}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('searchNavigator')}>
        <Ionicons name="search" size={Platform.OS === 'ios' ? 22 : 25} color={theme.icon.info} />
      </TouchableOpacity>
      <ViewSourceButton
        demoId="expo-components"
        iconOnly
        title="Expo Components source"
        initialPath={sourcePath}
        onlyInitialPath={sourcePath !== undefined}
      />
      {/* This toggler does not work properly, it only updates the navigation and not the body UI */}
      {/* <ThemeToggler /> */}
    </View>
  );
};
