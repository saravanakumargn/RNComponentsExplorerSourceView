import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import { HeaderBackButton } from '@react-navigation/elements';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HeroUINativeProvider } from 'heroui-native';
import { useCallback, useEffect, type ComponentType } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  KeyboardAvoidingView,
  KeyboardProvider,
} from 'react-native-keyboard-controller';
import { Uniwind } from 'uniwind';

import { ViewSourceButton } from '@/features/source-viewer/view-source-button';

import { HeroUINativeRouterProvider } from './expo-router-adapter';

type ScreenDefinition = {
  name: string;
  component: ComponentType;
  sourcePath?: string;
};

const AppThemeProvider = require('./source/official/src/contexts/app-theme-context')
  .AppThemeProvider as ComponentType<{ children: React.ReactNode }>;
const HomeScreen = require('./source/official/src/app/(home)/index')
  .default as ComponentType;
const ComponentsScreen =
  require('./source/official/src/app/(home)/components/index')
    .default as ComponentType;
const ThemesScreen = require('./source/official/src/app/(home)/themes/index')
  .default as ComponentType;
const ShowcasesScreen =
  require('./source/official/src/app/(home)/showcases/index')
    .default as ComponentType;

const componentScreens: ScreenDefinition[] = [
  {
    name: 'components/accordion',
    component: require('./source/official/src/app/(home)/components/accordion')
      .default,
  },
  {
    name: 'components/alert',
    component: require('./source/official/src/app/(home)/components/alert')
      .default,
  },
  {
    name: 'components/avatar',
    component: require('./source/official/src/app/(home)/components/avatar')
      .default,
  },
  {
    name: 'components/bottom-sheet',
    component:
      require('./source/official/src/app/(home)/components/bottom-sheet')
        .default,
  },
  {
    name: 'components/button',
    component: require('./source/official/src/app/(home)/components/button')
      .default,
  },
  {
    name: 'components/card',
    component: require('./source/official/src/app/(home)/components/card')
      .default,
  },
  {
    name: 'components/checkbox',
    component: require('./source/official/src/app/(home)/components/checkbox')
      .default,
  },
  {
    name: 'components/chip',
    component: require('./source/official/src/app/(home)/components/chip')
      .default,
  },
  {
    name: 'components/close-button',
    component:
      require('./source/official/src/app/(home)/components/close-button')
        .default,
  },
  {
    name: 'components/control-field',
    component:
      require('./source/official/src/app/(home)/components/control-field')
        .default,
  },
  {
    name: 'components/description',
    component:
      require('./source/official/src/app/(home)/components/description')
        .default,
  },
  {
    name: 'components/dialog',
    component: require('./source/official/src/app/(home)/components/dialog')
      .default,
  },
  {
    name: 'components/field-error',
    component:
      require('./source/official/src/app/(home)/components/field-error')
        .default,
  },
  {
    name: 'components/input',
    component: require('./source/official/src/app/(home)/components/input')
      .default,
  },
  {
    name: 'components/input-group',
    component:
      require('./source/official/src/app/(home)/components/input-group')
        .default,
  },
  {
    name: 'components/input-otp',
    component: require('./source/official/src/app/(home)/components/input-otp')
      .default,
  },
  {
    name: 'components/label',
    component: require('./source/official/src/app/(home)/components/label')
      .default,
  },
  {
    name: 'components/link-button',
    component:
      require('./source/official/src/app/(home)/components/link-button')
        .default,
  },
  {
    name: 'components/list-group',
    component: require('./source/official/src/app/(home)/components/list-group')
      .default,
  },
  {
    name: 'components/menu',
    component: require('./source/official/src/app/(home)/components/menu')
      .default,
  },
  {
    name: 'components/popover',
    component: require('./source/official/src/app/(home)/components/popover')
      .default,
  },
  {
    name: 'components/pressable-feedback',
    component:
      require('./source/official/src/app/(home)/components/pressable-feedback')
        .default,
  },
  {
    name: 'components/radio-group',
    component:
      require('./source/official/src/app/(home)/components/radio-group')
        .default,
  },
  {
    name: 'components/scroll-shadow',
    component:
      require('./source/official/src/app/(home)/components/scroll-shadow')
        .default,
  },
  {
    name: 'components/search-field',
    component:
      require('./source/official/src/app/(home)/components/search-field')
        .default,
  },
  {
    name: 'components/select',
    component: require('./source/official/src/app/(home)/components/select')
      .default,
  },
  {
    name: 'components/separator',
    component: require('./source/official/src/app/(home)/components/separator')
      .default,
  },
  {
    name: 'components/skeleton',
    component: require('./source/official/src/app/(home)/components/skeleton')
      .default,
  },
  {
    name: 'components/slider',
    component: require('./source/official/src/app/(home)/components/slider')
      .default,
  },
  {
    name: 'components/spinner',
    component: require('./source/official/src/app/(home)/components/spinner')
      .default,
  },
  {
    name: 'components/surface',
    component: require('./source/official/src/app/(home)/components/surface')
      .default,
  },
  {
    name: 'components/switch',
    component: require('./source/official/src/app/(home)/components/switch')
      .default,
  },
  {
    name: 'components/tabs',
    component: require('./source/official/src/app/(home)/components/tabs')
      .default,
  },
  {
    name: 'components/tag-group',
    component: require('./source/official/src/app/(home)/components/tag-group')
      .default,
  },
  {
    name: 'components/text-area',
    component: require('./source/official/src/app/(home)/components/text-area')
      .default,
  },
  {
    name: 'components/text-field',
    component: require('./source/official/src/app/(home)/components/text-field')
      .default,
  },
  {
    name: 'components/toast',
    component: require('./source/official/src/app/(home)/components/toast')
      .default,
  },
  {
    name: 'components/typography',
    component: require('./source/official/src/app/(home)/components/typography')
      .default,
  },
];

const modalScreens: ScreenDefinition[] = [
  {
    name: 'components/bottom-sheet-native-modal',
    component:
      require('./source/official/src/app/(home)/components/bottom-sheet-native-modal')
        .default,
  },
  {
    name: 'components/dialog-native-modal',
    component:
      require('./source/official/src/app/(home)/components/dialog-native-modal')
        .default,
  },
  {
    name: 'components/popover-native-modal',
    component:
      require('./source/official/src/app/(home)/components/popover-native-modal')
        .default,
  },
  {
    name: 'components/select-native-modal',
    component:
      require('./source/official/src/app/(home)/components/select-native-modal')
        .default,
  },
  {
    name: 'components/toast-native-modal',
    component:
      require('./source/official/src/app/(home)/components/toast-native-modal')
        .default,
  },
];

const showcaseScreens: ScreenDefinition[] = [
  {
    name: 'showcases/cooking-onboarding',
    component:
      require('./source/official/src/app/(home)/showcases/cooking-onboarding')
        .default,
  },
  {
    name: 'showcases/linear-task',
    component: require('./source/official/src/app/(home)/showcases/linear-task')
      .default,
  },
  {
    name: 'showcases/onboarding',
    component: require('./source/official/src/app/(home)/showcases/onboarding')
      .default,
  },
  {
    name: 'showcases/paywall',
    component: require('./source/official/src/app/(home)/showcases/paywall')
      .default,
  },
  {
    name: 'showcases/raycast',
    component: require('./source/official/src/app/(home)/showcases/raycast')
      .default,
  },
  {
    name: 'showcases/super-app-paywall',
    component:
      require('./source/official/src/app/(home)/showcases/super-app-paywall')
        .default,
  },
];

const Stack = createNativeStackNavigator();

function RoutedScreen({ component: Screen }: { component: ComponentType }) {
  return (
    <HeroUINativeRouterProvider>
      <Screen />
    </HeroUINativeRouterProvider>
  );
}

function screenTitle(name: string) {
  if (name === 'home') return 'HeroUI Native';
  if (name === 'components') return 'Components';
  if (name === 'themes') return 'Themes';
  if (name === 'showcases') return 'Showcases';

  return name
    .split('/')
    .at(-1)!
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function sourcePathFor(name: string) {
  if (name === 'home') return 'features/heroui-native/source/official/src/app/(home)/index.tsx';

  return `features/heroui-native/source/official/src/app/(home)/${name}.tsx`;
}

function HeroUINativeNavigator({ onBackToCatalog }: { onBackToCatalog: () => void }) {
  const screens: Required<ScreenDefinition>[] = [
    { name: 'home', component: HomeScreen, sourcePath: 'features/heroui-native/source/official/src/app/(home)/index.tsx' },
    { name: 'components', component: ComponentsScreen, sourcePath: 'features/heroui-native/source/official/src/app/(home)/components/index.tsx' },
    { name: 'themes', component: ThemesScreen, sourcePath: 'features/heroui-native/source/official/src/app/(home)/themes/index.tsx' },
    { name: 'showcases', component: ShowcasesScreen, sourcePath: 'features/heroui-native/source/official/src/app/(home)/showcases/index.tsx' },
    ...componentScreens,
    ...modalScreens,
    ...showcaseScreens,
  ].map((screen) => ({ ...screen, sourcePath: screen.sourcePath ?? sourcePathFor(screen.name) }));

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="home"
          screenOptions={({ route }) => ({
            title: screenTitle(route.name),
            // The vendored HeroUI screens add their own inset for the
            // transparent Expo Router header. Keep that contract in this
            // React Navigation host so content is not offset twice.
            headerTransparent: true,
            headerBlurEffect: 'light',
            headerRight: () => {
              const sourcePath = screens.find((screen) => screen.name === route.name)?.sourcePath;
              return (
                <ViewSourceButton
                  demoId="heroui-native"
                  iconOnly
                  title="HeroUI Native source"
                  initialPath={sourcePath}
                  onlyInitialPath={sourcePath !== undefined}
                />
              );
            },
            headerLeft:
              route.name === 'home'
                ? (props) => (
                    <HeaderBackButton
                      {...props}
                      label="Libraries"
                      onPress={onBackToCatalog}
                      testID="HeroUINativeExitButton"
                    />
                  )
                : undefined,
            headerShown: true,
            presentation: route.name.endsWith('-native-modal')
              ? 'modal'
              : 'card',
          })}
        >
          {screens.map(({ name, component }) => (
            <Stack.Screen key={name} name={name}>
              {() => <RoutedScreen component={component} />}
            </Stack.Screen>
          ))}
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}

type HeroUINativeDemoScreenProps = {
  onBackToCatalog: () => void;
};

export function HeroUINativeDemoScreen({
  onBackToCatalog,
}: HeroUINativeDemoScreenProps) {
  useEffect(() => {
    // Keep the hosted gallery in sync with the explorer's light-only policy,
    // regardless of the device appearance.
    Uniwind.setTheme('light');
  }, []);

  const contentWrapper = useCallback(
    (children: React.ReactNode) => (
      <KeyboardAvoidingView
        pointerEvents="box-none"
        behavior="padding"
        keyboardVerticalOffset={12}
        style={{ flex: 1 }}>
        {children}
      </KeyboardAvoidingView>
    ),
    []
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <AppThemeProvider>
          <HeroUINativeProvider
            config={{
              textProps: { maxFontSizeMultiplier: 2 },
              toast: { contentWrapper },
              devInfo: { stylingPrinciples: false },
            }}>
            <HeroUINativeNavigator onBackToCatalog={onBackToCatalog} />
          </HeroUINativeProvider>
        </AppThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
