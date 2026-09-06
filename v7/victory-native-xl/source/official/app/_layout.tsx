import { Stack, useRouter, useSegments } from "expo-router";
import { HeaderBackButton } from "expo-router/react-navigation";
import * as React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useAssets } from "expo-asset";
import { Image, type ImageSource } from "expo-image";
import { useDarkMode } from "react-native-dark";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { appColors } from "../consts/colors";
import { ViewSourceButton } from "../../../../source-viewer/view-source-button";

function ChartSourceButton() {
  const segments = useSegments();
  // segments looks like ["victory-native-xl", "line-chart"] or
  // ["victory-native-xl", "guides", "getting-started"]; the chart route is
  // everything after the fixed "victory-native-xl" prefix, "index" at the root.
  const routeSegments = segments.slice(1);
  const route = routeSegments.length > 0 ? routeSegments.join("/") : "index";

  return (
    <ViewSourceButton
      demoId="victory-native-xl"
      iconOnly
      title="Victory Native XL source"
      initialPath={`features/victory-native-xl/source/official/app/${route}.tsx`}
      onlyInitialPath
    />
  );
}

const titleCaseName = (name: string) =>
  name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function Layout() {
  const isDark = useDarkMode();
  const router = useRouter();
  const [assets] = useAssets([
    require("../assets/victory.png"),
  ]) as ImageSource[][];

  return (
    <GestureHandlerRootView style={styles.layout}>
      <View style={styles.layout}>
        <Stack
          screenOptions={{
            headerTransparent: Boolean(Platform.OS === "ios"),
            headerBlurEffect: isDark ? "dark" : "light",
            headerStyle: {
              backgroundColor:
                Platform.OS === "android"
                  ? isDark
                    ? appColors.androidHeader.dark
                    : appColors.androidHeader.light
                  : undefined,
            },
            headerTitle: ({ children }) => {
              return (
                assets?.at(0) && (
                  <>
                    <Image
                      style={{ width: 24, height: 24 }}
                      source={assets.at(0)}
                    />
                    {
                      <Text
                        style={{
                          marginHorizontal: Platform.select({
                            ios: 5,
                            android: 8,
                          }),
                          fontSize: 16,
                          color: appColors.tint,
                        }}
                      >
                        {titleCaseName(children)}
                      </Text>
                    }
                  </>
                )
              );
            },
            headerTintColor: appColors.tint,
            headerBackButtonDisplayMode: "minimal",
            headerLeft: ({ tintColor }) => (
              <HeaderBackButton
                displayMode="minimal"
                onPress={() => {
                  if (router.canGoBack()) {
                    router.back();
                    return;
                  }

                  router.replace("/library/victory-native-xl");
                }}
                tintColor={tintColor}
              />
            ),
            headerRight: () => <ChartSourceButton />,
          }}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    backgroundColor: appColors.viewBackground.light,
    $dark: { backgroundColor: appColors.viewBackground.dark },
  },
});
