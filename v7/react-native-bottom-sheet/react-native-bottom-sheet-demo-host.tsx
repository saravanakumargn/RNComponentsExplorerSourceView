import { type ComponentType } from "react";
import { useColorScheme } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  NavigationIndependentTree,
} from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

const OfficialViewExample =
  require("./source/official/screens/basic/BasicExamples")
    .ViewExampleScreen as ComponentType;

/** Hosts the official Bottom Sheet v5.2.14 basic View example. */
export function ReactNativeBottomSheetDemoHost() {
  const colorScheme = useColorScheme();
  const theme =
    colorScheme === "dark"
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            secondaryCard: "#222",
            secondaryText: "#8F8F8F",
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            secondaryCard: "#CCC",
            secondaryText: "#7A7A7A",
          },
        };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationIndependentTree>
          <NavigationContainer theme={theme}>
            <OfficialViewExample />
          </NavigationContainer>
        </NavigationIndependentTree>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
