import { HeaderBackButton } from '@react-navigation/elements';
import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState, type ComponentType } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ScopedTheme } from 'uniwind';

import { ViewSourceButton } from '@/features/source-viewer/view-source-button';
import { ColorSchemeControlProvider } from '@/styles/nativewind-uniwind-adapter';

import IndexScreen, { DEMOS } from './screens/index-screen';

const Stack = createNativeStackNavigator();

const SCREENS: Record<string, ComponentType> = {
  'activity-indicator': require('./screens/activity-indicator').default,
  avatar: require('./screens/avatar').default,
  button: require('./screens/button').default,
  'date-picker': require('./screens/date-picker').default,
  icon: require('./screens/icon').default,
  picker: require('./screens/picker').default,
  'progress-indicator': require('./screens/progress-indicator').default,
  slider: require('./screens/slider').default,
  text: require('./screens/text').default,
  'theme-toggle': require('./screens/theme-toggle').default,
  toggle: require('./screens/toggle').default,
};

/**
 * Upstream selects its iOS or Android palette inside tailwind.config.js with
 * NativeWind's platformSelect(), which has no Tailwind v4 equivalent. The two
 * palettes are registered as separate Uniwind themes instead, and chosen here.
 */
function themeName(colorScheme: 'dark' | 'light') {
  const platform = Platform.OS === 'android' ? 'android-' : '';

  return `nativewindui-${platform}${colorScheme}`;
}

function sourcePathFor(name: string) {
  return `features/nativewind-ui/screens/${name}.tsx`;
}

export function NativeWindUIDemoHost({ onBackToCatalog }: { onBackToCatalog: () => void }) {
  const [colorScheme, setColorScheme] = useState<'dark' | 'light'>('light');

  const renderSourceButton = useCallback(
    (initialPath: string, title: string) => () => (
      <ViewSourceButton
        demoId="nativewind-ui"
        iconOnly
        title={title}
        initialPath={initialPath}
        onlyInitialPath
      />
    ),
    []
  );

  return (
    <ScopedTheme theme={themeName(colorScheme)}>
      {/* Lets the vendored ThemeToggle flip this demo's scoped theme instead of
          calling Uniwind.setTheme, which would restyle the whole app. */}
      <ColorSchemeControlProvider setColorScheme={setColorScheme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <NavigationIndependentTree>
            <NavigationContainer>
              <Stack.Navigator initialRouteName="index">
                <Stack.Screen
                  name="index"
                  options={{
                    title: 'NativeWindUI',
                    headerLeft: () => <HeaderBackButton onPress={onBackToCatalog} />,
                    headerRight: renderSourceButton(
                      'features/nativewind-ui/screens/index-screen.tsx',
                      'NativeWindUI source'
                    ),
                  }}
                >
                  {({ navigation }) => (
                    <IndexScreen onSelect={(name) => navigation.navigate(name)} />
                  )}
                </Stack.Screen>

                {DEMOS.map((demo) => (
                  <Stack.Screen
                    key={demo.name}
                    name={demo.name}
                    component={SCREENS[demo.name]!}
                    options={{
                      title: demo.title,
                      headerBackButtonDisplayMode: 'minimal',
                      headerRight: renderSourceButton(
                        sourcePathFor(demo.name),
                        `${demo.title} source`
                      ),
                    }}
                  />
                ))}
              </Stack.Navigator>
            </NavigationContainer>
          </NavigationIndependentTree>
        </GestureHandlerRootView>
      </ColorSchemeControlProvider>
    </ScopedTheme>
  );
}
