import {
  NavigationContainer,
  NavigationIndependentTree,
  ThemeProvider,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HeaderBackButton } from '@react-navigation/elements';
import { StatusBar } from 'expo-status-bar';
import { type ComponentType } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { ViewSourceButton } from '@/features/source-viewer/view-source-button';

type ScreenDefinition = { name: string; title: string; component: ComponentType; sourcePath: string };

const Stack = createNativeStackNavigator();
const ComponentsScreen = require('./source/official/app/index').default as ComponentType;
const useGeistFont = require('./source/official/hooks/use-geist-font').useGeistFont as () => [boolean, Error | null];
const useColorScheme = require('../gluestack/nativewind-uniwind-adapter').useColorScheme as () => {
  colorScheme: 'dark' | 'light';
};
const NAV_THEME = require('./source/official/lib/theme').NAV_THEME;

const componentScreens: ScreenDefinition[] = [
  ['accordion', 'Accordion'], ['alert-dialog', 'Alert Dialog'], ['alert', 'Alert'],
  ['aspect-ratio', 'Aspect Ratio'], ['avatar', 'Avatar'], ['badge', 'Badge'], ['button', 'Button'],
  ['card', 'Card'], ['checkbox', 'Checkbox'], ['collapsible', 'Collapsible'],
  ['dialog', 'Dialog'], ['dropdown-menu', 'Dropdown Menu'], ['hover-card', 'Hover Card'], ['input', 'Input'],
  ['label', 'Label'], ['popover', 'Popover'], ['progress', 'Progress'],
  ['radio-group', 'Radio Group'], ['select', 'Select'], ['separator', 'Separator'], ['skeleton', 'Skeleton'],
  ['switch', 'Switch'], ['tabs', 'Tabs'], ['text', 'Text'], ['textarea', 'Textarea'],
  ['toggle-group', 'Toggle Group'], ['toggle', 'Toggle'], ['tooltip', 'Tooltip'],
].map(([name, title]) => ({
  name: `components/${name}`,
  title,
  component: componentFor(name),
  sourcePath: `features/react-native-reusables/source/official/app/components/${name}.tsx`,
}));

function componentFor(name: string): ComponentType {
  const components: Record<string, ComponentType> = {
    accordion: require('./source/official/app/components/accordion').default,
    'alert-dialog': require('./source/official/app/components/alert-dialog').default,
    alert: require('./source/official/app/components/alert').default,
    'aspect-ratio': require('./source/official/app/components/aspect-ratio').default,
    avatar: require('./source/official/app/components/avatar').default,
    badge: require('./source/official/app/components/badge').default,
    button: require('./source/official/app/components/button').default,
    card: require('./source/official/app/components/card').default,
    checkbox: require('./source/official/app/components/checkbox').default,
    collapsible: require('./source/official/app/components/collapsible').default,
    dialog: require('./source/official/app/components/dialog').default,
    'dropdown-menu': require('./source/official/app/components/dropdown-menu').default,
    'hover-card': require('./source/official/app/components/hover-card').default,
    input: require('./source/official/app/components/input').default,
    label: require('./source/official/app/components/label').default,
    popover: require('./source/official/app/components/popover').default,
    progress: require('./source/official/app/components/progress').default,
    'radio-group': require('./source/official/app/components/radio-group').default,
    select: require('./source/official/app/components/select').default,
    separator: require('./source/official/app/components/separator').default,
    skeleton: require('./source/official/app/components/skeleton').default,
    switch: require('./source/official/app/components/switch').default,
    tabs: require('./source/official/app/components/tabs').default,
    text: require('./source/official/app/components/text').default,
    textarea: require('./source/official/app/components/textarea').default,
    'toggle-group': require('./source/official/app/components/toggle-group').default,
    toggle: require('./source/official/app/components/toggle').default,
    tooltip: require('./source/official/app/components/tooltip').default,
  };
  return components[name]!;
}

type ReactNativeReusablesDemoHostProps = {
  onBackToCatalog: () => void;
};

function DemoNavigator({ onBackToCatalog }: ReactNativeReusablesDemoHostProps) {
  const [fontsLoaded, fontError] = useGeistFont();
  const { colorScheme } = useColorScheme();

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={NAV_THEME[colorScheme]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <NavigationIndependentTree>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="index"
              component={ComponentsScreen}
              options={{
                title: 'Showcase',
                headerLeft: () => <HeaderBackButton onPress={onBackToCatalog} />,
                headerRight: () => (
                  <ViewSourceButton
                    demoId="react-native-reusables"
                    iconOnly
                    title="React Native Reusables source"
                    initialPath="features/react-native-reusables/source/official/app/index.tsx"
                    onlyInitialPath
                  />
                ),
              }}
            />
            {componentScreens.map((screen) => (
              <Stack.Screen
                key={screen.name}
                name={screen.name}
                component={screen.component}
                options={{
                  title: screen.title,
                  headerRight: () => (
                    <ViewSourceButton
                      demoId="react-native-reusables"
                      iconOnly
                      title="React Native Reusables source"
                      initialPath={screen.sourcePath}
                      onlyInitialPath
                    />
                  ),
                }}
              />
            ))}
          </Stack.Navigator>
        </NavigationContainer>
      </NavigationIndependentTree>
    </ThemeProvider>
  );
}

export function ReactNativeReusablesDemoHost({ onBackToCatalog }: ReactNativeReusablesDemoHostProps) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <DemoNavigator onBackToCatalog={onBackToCatalog} />
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
