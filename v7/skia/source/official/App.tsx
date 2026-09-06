import type { LinkingOptions } from "@react-navigation/native";
import {
  NavigationContainer,
  NavigationIndependentTree,
  useNavigation,
} from "@react-navigation/native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";
import type { HeaderBackButtonProps } from "@react-navigation/elements";
import { FiberProvider } from "its-fine";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";

import { DemoBackButton } from "../../../../components/demo-back-button";
import { createDemoScreenLayout } from "../../../../components/demo-screen-layout";
import { nestedDemoInitialState } from "../../../../components/nested-demo-deep-link";
import { ViewSourceButton } from "../../../source-viewer/view-source-button";

import {
  ReanimatedExample,
  API,
  Aurora,
  Breathe,
  Filters,
  Gooey,
  GraphsScreen,
  Hue,
  Matrix,
  Glassmorphism,
  Neumorphism,
  PerformanceDrawingTest,
  Wallpaper,
  Vertices,
  Wallet,
  Severance,
  Transitions,
  Stickers,
  FrostedCard,
  SpeedTest,
  Video,
  Chat,
  LiquidGlass,
  Pictures,
  WebGPU,
} from "./Examples";
import { HomeScreen } from "./Home";
import type { StackParamList } from "./types";
import { Chess } from "./Examples/Chess";
import "./resolveAssetSourcePolyfill";

const linking: LinkingOptions<StackParamList> = {
  config: {
    screens: {
      Home: "",
      Vertices: "vertices",
      API: "api",
      LiquidGlass: "liquid-glass",
      Breathe: "breathe",
      Filters: "filters",
      Gooey: "gooey",
      Hue: "hue",
      Matrix: "matrix",
      Severance: "severance",
      Aurora: "aurora",
      Chess: "chess",
      Glassmorphism: "glassmorphism",
      Neumorphism: "neumorphism",
      Wallpaper: "wallpaper",
      Wallet: "wallet",
      Graphs: "graphs",
      Animation: "animation",
      Reanimated: "reanimated",
      Performance: "performance",
      Transitions: "transitions",
      Stickers: "stickers",
      FrostedCard: "frosted-card",
      SpeedTest: "speedtest",
      Video: "video",
      Chat: "chat",
      Pictures: "pictures",
      WebGPU: "webgpu",
    },
  },
  prefixes: ["rnskia://"],
};

const sourcePathByRoute: Record<string, string> = {
  Home: 'features/skia/source/official/Home/HomeScreen.tsx',
  Vertices: 'features/skia/source/official/Examples/Vertices/Vertices.tsx',
  API: 'features/skia/source/official/Examples/API/index.tsx',
  LiquidGlass: 'features/skia/source/official/Examples/LiquidGlass/index.tsx',
  Breathe: 'features/skia/source/official/Examples/Breathe/Breathe.tsx',
  Chess: 'features/skia/source/official/Examples/Chess/Chess.tsx',
  Filters: 'features/skia/source/official/Examples/Filters/index.tsx',
  Gooey: 'features/skia/source/official/Examples/Gooey/Gooey.tsx',
  Hue: 'features/skia/source/official/Examples/Transitions/Hue.tsx',
  Matrix: 'features/skia/source/official/Examples/Matrix/Matrix.tsx',
  Severance: 'features/skia/source/official/Examples/Severance/Severance.tsx',
  Aurora: 'features/skia/source/official/Examples/Aurora/Aurora.tsx',
  SpeedTest: 'features/skia/source/official/Examples/SpeedTest/SpeedTest.tsx',
  Glassmorphism: 'features/skia/source/official/Examples/Glassmorphism/Glassmorphism.tsx',
  FrostedCard: 'features/skia/source/official/Examples/FrostedCard/FrostedCard.tsx',
  Neumorphism: 'features/skia/source/official/Examples/Neumorphism/Neumorphism.tsx',
  Wallpaper: 'features/skia/source/official/Examples/Wallpaper/Wallpaper.tsx',
  Wallet: 'features/skia/source/official/Examples/Wallet/Wallet.tsx',
  Graphs: 'features/skia/source/official/Examples/Graphs/index.tsx',
  Reanimated: 'features/skia/source/official/Examples/Reanimated/index.tsx',
  Stickers: 'features/skia/source/official/Examples/Stickers/index.ts',
  Transitions: 'features/skia/source/official/Examples/Transitions/index.ts',
  Video: 'features/skia/source/official/Examples/Video/Video.tsx',
  Chat: 'features/skia/source/official/Examples/Chat/index.tsx',
  Performance: 'features/skia/source/official/Examples/Performance/index.ts',
  Pictures: 'features/skia/source/official/Examples/Pictures/index.ts',
  WebGPU: 'features/skia/source/official/Examples/WebGPU/index.tsx',
};

type AppProps = {
  // Explorer addition: lets `/library/react-native-skia?demo=<route>` open one
  // example directly. Upstream reaches these through its own `rnskia://` linking
  // config, which cannot work here because Expo Router owns the URL scheme.
  initialDemo?: string;
  onExit?: () => void;
};

const screenLayout = createDemoScreenLayout("react-native-skia");
// Not `linking.config.screens`: that map still lists "Animation", a route with
// no Stack.Screen behind it, and seeding the navigator with it would produce a
// state pointing at nothing. `sourcePathByRoute` covers exactly the real screens.
const routeNames = Object.keys(sourcePathByRoute);

type HeaderLeftProps = HeaderBackButtonProps & {
  onExit?: () => void;
};

const HeaderLeft = ({ onExit, tintColor }: HeaderLeftProps) => {
  const navigation = useNavigation();
  return (
    <DemoBackButton
      tintColor={tintColor}
      onPress={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
          return;
        }

        onExit?.();
      }}
      testID="back"
    />
  );
};

enableScreens(true);

const App = ({ initialDemo, onExit }: AppProps) => {
  const Stack = createNativeStackNavigator<StackParamList>();
  return (
    <FiberProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar hidden />
        <NavigationIndependentTree>
          <NavigationContainer
            linking={linking}
            initialState={nestedDemoInitialState("Home", initialDemo, routeNames)}
          >
            <Stack.Navigator
              screenLayout={screenLayout}
              screenOptions={({ route }) => ({
                headerBackButtonDisplayMode: "minimal",
                headerLeft: (props) => <HeaderLeft {...props} onExit={onExit} />,
                headerRight: () => (
                  <ViewSourceButton
                    demoId="react-native-skia"
                    iconOnly
                    title="React Native Skia source"
                    initialPath={sourcePathByRoute[route.name]}
                    onlyInitialPath={sourcePathByRoute[route.name] !== undefined}
                  />
                ),
              })}
              initialRouteName="Home"
            >
            <Stack.Screen
              name="Home"
              key="Home"
              component={HomeScreen}
              options={{
                title: "🎨 Skia",
              }}
            />
            <Stack.Screen name="Vertices" component={Vertices} />
            <Stack.Screen name="API" component={API} />
            <Stack.Screen name="LiquidGlass" component={LiquidGlass} />
            <Stack.Screen name="Breathe" component={Breathe} />
            <Stack.Screen
              name="Chess"
              component={Chess}
              options={{
                title: "👸🏼's Gambit",
              }}
            />
            <Stack.Screen name="Filters" component={Filters} />
            <Stack.Screen name="Gooey" component={Gooey} />
            <Stack.Screen name="Hue" component={Hue} />
            <Stack.Screen name="Matrix" component={Matrix} />
            <Stack.Screen name="Severance" component={Severance} />
            <Stack.Screen name="Aurora" component={Aurora} />
            <Stack.Screen
              name="SpeedTest"
              component={SpeedTest}
            />
            <Stack.Screen name="Glassmorphism" component={Glassmorphism} />
            <Stack.Screen name="FrostedCard" component={FrostedCard} />
            <Stack.Screen name="Neumorphism" component={Neumorphism} />
            <Stack.Screen name="Wallpaper" component={Wallpaper} />
            <Stack.Screen
              name="Wallet"
              component={Wallet}
            />
            <Stack.Screen name="Graphs" component={GraphsScreen} />
            <Stack.Screen name="Reanimated" component={ReanimatedExample} />
            <Stack.Screen name="Stickers" component={Stickers} />
            <Stack.Screen name="Transitions" component={Transitions} />
            <Stack.Screen name="Video" component={Video} />
            <Stack.Screen name="Chat" component={Chat} />
            <Stack.Screen
              name="Performance"
              component={PerformanceDrawingTest}
            />
            <Stack.Screen name="Pictures" component={Pictures} />
            <Stack.Screen name="WebGPU" component={WebGPU} />
            </Stack.Navigator>
          </NavigationContainer>
        </NavigationIndependentTree>
      </GestureHandlerRootView>
    </FiberProvider>
  );
};

// eslint-disable-next-line import/no-default-export
export default App;
