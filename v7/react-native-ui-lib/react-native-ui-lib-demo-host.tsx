import {
  createNavigationContainerRef,
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, type ComponentType } from 'react';

import { DemoBackButton } from '@/components/demo-back-button';

import { setReactNativeUiLibNavigationAdapter } from './react-native-navigation-bridge';

type SourceScreenProps = {
  componentId?: string;
  [key: string]: unknown;
};

type DemoStackParams = {
  main: undefined;
  source: {
    presentation?: 'modal';
    props?: Record<string, unknown>;
    screenName: string;
    title?: string;
  };
};

type RegisteredScreen = () => ComponentType<SourceScreenProps>;

const Stack = createNativeStackNavigator<DemoStackParams>();
const navigationRef = createNavigationContainerRef<DemoStackParams>();
const registeredScreens = new Map<string, RegisteredScreen>();
const { registerScreens } = require('./source/official/demo/src/screens') as {
  registerScreens: (registrar: (name: string, screen: RegisteredScreen) => void) => void;
};

registerScreens((name, screen) => registeredScreens.set(name, screen));

function componentFor(screenName: string) {
  return registeredScreens.get(screenName)?.();
}

function titleFor(screenName: string) {
  return screenName.split('.').at(-1)?.replace(/Screen$/, '') ?? 'RNUI Demo';
}

function MainScreen() {
  const SourceScreen = componentFor('unicorn.MainScreen');

  return SourceScreen ? <SourceScreen componentId="unicorn.MainScreen" /> : null;
}

function RoutedSourceScreen({ screenName, props }: DemoStackParams['source']) {
  const SourceScreen = componentFor(screenName);

  return SourceScreen ? <SourceScreen componentId={screenName} {...props} /> : null;
}

type ReactNativeUiLibDemoHostProps = {
  onBackToCatalog: () => void;
};

export function ReactNativeUiLibDemoHost({ onBackToCatalog }: ReactNativeUiLibDemoHostProps) {
  useEffect(() => {
    setReactNativeUiLibNavigationAdapter({
      dismissModal: () => navigationRef.goBack(),
      pop: () => navigationRef.goBack(),
      push: (component, presentation) => {
        if (!component.name || !componentFor(component.name) || !navigationRef.isReady()) return;

        navigationRef.navigate('source', {
          presentation,
          props: component.passProps,
          screenName: component.name,
          title: component.options?.topBar?.title?.text,
        });
      },
    });

    return () => setReactNativeUiLibNavigationAdapter();
  }, []);

  return (
    <NavigationIndependentTree>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName="main"
          screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}
        >
          <Stack.Screen
            name="main"
            component={MainScreen}
            options={{
              title: 'R N U I L I B',
              headerLeft: ({ tintColor }) => (
                <DemoBackButton tintColor={tintColor} onPress={onBackToCatalog} />
              ),
            }}
          />
          <Stack.Screen
            name="source"
            options={({ route }) => ({
              presentation: route.params.presentation ?? 'card',
              title: route.params.title ?? titleFor(route.params.screenName),
            })}
          >
            {({ route }) => <RoutedSourceScreen {...route.params} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
