import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

import { CenteredEmptyState, ScreenLayout } from '@/components/screen-layout';
import { getLibrary } from '@/data/libraries';
import { PaperExampleList } from '@/features/paper-example/paper-example-list';
import { PaperExampleProvider } from '@/features/paper-example/paper-example-provider';
import { ViewSourceButton } from '@/features/source-viewer/view-source-button';
import { openInAppBrowser } from '@/utils/open-in-app-browser';

function sourceHeaderRight(libraryId: string, title: string) {
  return () => <ViewSourceButton demoId={libraryId} iconOnly title={`${title} source`} />;
}

export function LibraryDetailScreen() {
  const { library } = useLocalSearchParams<{ library: string }>();
  const router = useRouter();
  const selectedLibrary = getLibrary(library);
  const goBackToCatalog = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  }, [router]);

  if (!selectedLibrary) {
    return (
      <CenteredEmptyState>
        <Stack.Screen options={{ title: 'Library not found' }} />
        <Text variant="headlineSmall">Library not found</Text>
        <Link href="/">Return to Components & API</Link>
      </CenteredEmptyState>
    );
  }

  if (selectedLibrary.id === 'react-native') {
    const { RNTesterDemoScreen } = require('@/features/rn-tester/rn-tester-demo-screen');
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1 }} testID="maestro-library-react-native-ready">
          <RNTesterDemoScreen />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'expo-components') {
    const { NativeComponentListEntry } = require('@/features/expo-components/native-component-list-entry');
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1 }} testID="maestro-library-expo-components-ready">
          <NativeComponentListEntry onBackToCatalog={goBackToCatalog} />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'tamagui') {
    const { TamaguiDemoScreen } = require('@/features/tamagui/tamagui-demo-screen');
    return (
      <>
        <Stack.Screen
          options={{
            title: selectedLibrary.title,
            headerRight: sourceHeaderRight(selectedLibrary.id, selectedLibrary.title),
          }}
        />
        <View style={{ flex: 1 }} testID="maestro-library-tamagui-ready">
          <TamaguiDemoScreen />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'react-native-skia') {
    const { SkiaDemoScreen } = require('@/features/skia/skia-demo-screen');
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1 }} testID="maestro-library-react-native-skia-ready">
          <SkiaDemoScreen />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'victory-native-xl') {
    const VictoryNativeXlLandingPage = require('@/features/victory-native-xl/source/official/app/index')
      .default as React.ComponentType;
    return (
      <>
        <Stack.Screen
          options={{
            title: selectedLibrary.title,
            headerRight: sourceHeaderRight(selectedLibrary.id, selectedLibrary.title),
          }}
        />
        <VictoryNativeXlLandingPage />
      </>
    );
  }

  if (selectedLibrary.id === 'react-native-reanimated') {
    const { ReanimatedDemoScreen } = require('@/features/reanimated/reanimated-demo-screen');
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1 }} testID="maestro-library-react-native-reanimated-ready">
          <ReanimatedDemoScreen />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'react-native-enriched-markdown') {
    const { ReactNativeEnrichedMarkdownDemoHost } = require('@/features/react-native-enriched-markdown/react-native-enriched-markdown-demo-host');
    return (
      <>
        <Stack.Screen
          options={{
            title: selectedLibrary.title,
            headerRight: sourceHeaderRight(selectedLibrary.id, selectedLibrary.title),
          }}
        />
        <View style={{ flex: 1 }} testID="maestro-library-react-native-enriched-markdown-ready">
          <ReactNativeEnrichedMarkdownDemoHost />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'react-native-enriched-html') {
    const { ReactNativeEnrichedHtmlDemoHost } = require('@/features/react-native-enriched-html/react-native-enriched-html-demo-host');
    return (
      <>
        <Stack.Screen
          options={{
            title: selectedLibrary.title,
            headerRight: sourceHeaderRight(selectedLibrary.id, selectedLibrary.title),
          }}
        />
        <View style={{ flex: 1 }} testID="maestro-library-react-native-enriched-html-ready">
          <ReactNativeEnrichedHtmlDemoHost />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'react-native-audio-api') {
    const { ReactNativeAudioApiDemoHost } = require('@/features/react-native-audio-api/react-native-audio-api-demo-host');
    return (
      <>
        <Stack.Screen
          options={{
            title: selectedLibrary.title,
            headerRight: sourceHeaderRight(selectedLibrary.id, selectedLibrary.title),
          }}
        />
        <View style={{ flex: 1 }} testID="maestro-library-react-native-audio-api-ready">
          <ReactNativeAudioApiDemoHost />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'react-native-vision-camera') {
    const { ReactNativeVisionCameraDemoHost } = require('@/features/react-native-vision-camera/react-native-vision-camera-demo-host');
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1 }} testID="maestro-library-react-native-vision-camera-ready">
          <ReactNativeVisionCameraDemoHost />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'react-native-bottom-sheet') {
    const { ReactNativeBottomSheetDemoHost } = require('@/features/react-native-bottom-sheet/react-native-bottom-sheet-demo-host');
    return (
      <>
        <Stack.Screen
          options={{
            title: selectedLibrary.title,
            headerRight: sourceHeaderRight(selectedLibrary.id, selectedLibrary.title),
          }}
        />
        <View style={{ flex: 1 }} testID="maestro-library-react-native-bottom-sheet-ready">
          <ReactNativeBottomSheetDemoHost />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'heroui-native') {
    const { HeroUINativeDemoScreen } = require('@/features/heroui-native/heroui-native-demo-screen');
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1 }} testID="maestro-library-heroui-native-ready">
          <HeroUINativeDemoScreen onBackToCatalog={goBackToCatalog} />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'gluestack-ui') {
    const { GluestackDemoHost } = require('@/features/gluestack/gluestack-demo-host');
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1 }} testID="maestro-library-gluestack-ui-ready">
          <GluestackDemoHost onBackToCatalog={goBackToCatalog} />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'react-native-reusables') {
    const { ReactNativeReusablesDemoHost } = require('@/features/react-native-reusables/react-native-reusables-demo-host');
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1 }} testID="maestro-library-react-native-reusables-ready">
          <ReactNativeReusablesDemoHost onBackToCatalog={goBackToCatalog} />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'react-native-actions-sheet') {
    const { ReactNativeActionSheetDemoHost } = require('@/features/react-native-actions-sheet/react-native-actions-sheet-demo-host');
    return (
      <>
        <Stack.Screen
          options={{
            title: selectedLibrary.title,
            headerBackButtonDisplayMode: 'minimal',
            headerRight: sourceHeaderRight(selectedLibrary.id, selectedLibrary.title),
          }}
        />
        <View style={{ flex: 1 }} testID="maestro-library-react-native-actions-sheet-ready">
          <ReactNativeActionSheetDemoHost />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'react-native-device-info') {
    const { ReactNativeDeviceInfoDemoHost } = require('@/features/react-native-device-info/react-native-device-info-demo-host');
    return (
      <>
        <Stack.Screen
          options={{
            title: selectedLibrary.title,
            headerRight: sourceHeaderRight(selectedLibrary.id, selectedLibrary.title),
          }}
        />
        <View style={{ flex: 1 }} testID="maestro-library-react-native-device-info-ready">
          <ReactNativeDeviceInfoDemoHost />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'react-native-gesture-handler') {
    const { ReactNativeGestureHandlerDemoHost } = require('@/features/react-native-gesture-handler/react-native-gesture-handler-demo-host');
    return (
      <>
        <Stack.Screen
          options={{
            title: selectedLibrary.title,
            headerBackButtonDisplayMode: 'minimal',
            headerRight: sourceHeaderRight(selectedLibrary.id, selectedLibrary.title),
          }}
        />
        <View style={{ flex: 1 }} testID="maestro-library-react-native-gesture-handler-ready">
          <ReactNativeGestureHandlerDemoHost />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'react-native-menu') {
    const { ReactNativeMenuDemoHost } = require('@/features/react-native-menu/react-native-menu-demo-host');
    return (
      <>
        <Stack.Screen
          options={{
            title: selectedLibrary.title,
            headerRight: sourceHeaderRight(selectedLibrary.id, selectedLibrary.title),
          }}
        />
        <View style={{ flex: 1 }} testID="maestro-library-react-native-menu-ready">
          <ReactNativeMenuDemoHost />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'react-native-calendars') {
    const { ReactNativeCalendarsDemoHost } = require('@/features/react-native-calendars/react-native-calendars-demo-host');
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1 }} testID="maestro-library-react-native-calendars-ready">
          <ReactNativeCalendarsDemoHost onBackToCatalog={goBackToCatalog} />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'react-native-elements') {
    const { ReactNativeElementsDemoHost } = require('@/features/react-native-elements/react-native-elements-demo-host');
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1 }} testID="maestro-library-react-native-elements-ready">
          <ReactNativeElementsDemoHost onBackToCatalog={goBackToCatalog} />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'flash-list') {
    const { ReactNativeFlashListDemoHost } = require('@/features/react-native-flash-list/react-native-flash-list-demo-host');
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1 }} testID="maestro-library-flash-list-ready">
          <ReactNativeFlashListDemoHost onBackToCatalog={goBackToCatalog} />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'legend-list') {
    const { LegendListDemoHost } = require('@/features/legend-list/legend-list-demo-host');
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1 }} testID="maestro-library-legend-list-ready">
          <LegendListDemoHost onBackToCatalog={goBackToCatalog} />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'react-hook-form') {
    const { ReactHookFormDemoHost } = require('@/features/react-hook-form/react-hook-form-demo-host');
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1 }} testID="maestro-library-react-hook-form-ready">
          <ReactHookFormDemoHost onBackToCatalog={goBackToCatalog} />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'formik') {
    const { FormikDemoHost } = require('@/features/formik/formik-demo-host');
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1 }} testID="maestro-library-formik-ready">
          <FormikDemoHost onBackToCatalog={goBackToCatalog} />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'lottie-react-native') {
    const { LottieReactNativeDemoHost } = require('@/features/lottie-react-native/lottie-react-native-demo-host');
    return (
      <>
        <Stack.Screen
          options={{
            title: selectedLibrary.title,
            headerRight: sourceHeaderRight(selectedLibrary.id, selectedLibrary.title),
          }}
        />
        <View style={{ flex: 1 }} testID="maestro-library-lottie-react-native-ready">
          <LottieReactNativeDemoHost />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'react-native-gifted-charts') {
    const { ReactNativeGiftedChartsDemoHost } = require('@/features/react-native-gifted-charts/react-native-gifted-charts-demo-host');
    return (
      <>
        <Stack.Screen
          options={{
            title: selectedLibrary.title,
            headerBackButtonDisplayMode: 'minimal',
            headerRight: sourceHeaderRight(selectedLibrary.id, selectedLibrary.title),
          }}
        />
        <View style={{ flex: 1 }} testID="maestro-library-react-native-gifted-charts-ready">
          <ReactNativeGiftedChartsDemoHost />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'react-native-maps') {
    const { ReactNativeMapsDemoScreen } = require('@/features/react-native-maps/react-native-maps-demo-screen');
    return (
      <>
        <Stack.Screen
          options={{
            title: selectedLibrary.title,
            headerRight: sourceHeaderRight(selectedLibrary.id, selectedLibrary.title),
          }}
        />
        <View style={{ flex: 1 }} testID="maestro-library-react-native-maps-ready">
          <ReactNativeMapsDemoScreen />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'react-native-netinfo') {
    const { ReactNativeNetInfoDemoScreen } = require('@/features/react-native-netinfo/react-native-netinfo-demo-screen');
    return (
      <>
        <Stack.Screen
          options={{
            title: selectedLibrary.title,
            headerRight: sourceHeaderRight(selectedLibrary.id, selectedLibrary.title),
          }}
        />
        <View style={{ flex: 1 }} testID="maestro-library-react-native-netinfo-ready">
          <ReactNativeNetInfoDemoScreen />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'notifee') {
    const { NotifeeDemoHost } = require('@/features/notifee/notifee-demo-host');
    return (
      <>
        <Stack.Screen
          options={{
            title: selectedLibrary.title,
            headerRight: sourceHeaderRight(selectedLibrary.id, selectedLibrary.title),
          }}
        />
        <View style={{ flex: 1 }} testID="maestro-library-notifee-ready">
          <NotifeeDemoHost />
        </View>
      </>
    );
  }

  if (selectedLibrary.id === 'react-native-ui-lib') {
    const { ReactNativeUiLibDemoHost } = require('@/features/react-native-ui-lib/react-native-ui-lib-demo-host');
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ flex: 1 }} testID="maestro-library-react-native-ui-lib-ready">
          <ReactNativeUiLibDemoHost onBackToCatalog={goBackToCatalog} />
        </View>
      </>
    );
  }

  if (selectedLibrary.id !== 'react-native-paper') {
    return (
      <ScreenLayout testID={`maestro-library-${selectedLibrary.id}-ready`}>
        <Stack.Screen
          options={{
            title: selectedLibrary.title,
            headerRight: sourceHeaderRight(selectedLibrary.id, selectedLibrary.title),
          }}
        />
        <View style={{ gap: 4 }}>
          <Text variant="headlineSmall">{selectedLibrary.title}</Text>
          <Text variant="bodyMedium">{selectedLibrary.shortDescription}</Text>
        </View>
        <Card mode="outlined">
          <Card.Content style={{ gap: 12 }}>
            <Text variant="titleMedium">Migration placeholder</Text>
            <Text variant="bodyMedium">
              This library remains in the explorer, but its demos have not been
              migrated yet. It will be evaluated for Expo and New Architecture
              compatibility before being added.
            </Text>
            <Button mode="outlined" onPress={() => void openInAppBrowser(selectedLibrary.website)}>
              Visit project site
            </Button>
          </Card.Content>
        </Card>
      </ScreenLayout>
    );
  }

  return (
    <PaperExampleProvider>
      <View style={{ flex: 1 }} testID="maestro-library-react-native-paper-ready">
        <Stack.Screen
          options={{
            title: selectedLibrary.title,
            headerRight: sourceHeaderRight(selectedLibrary.id, selectedLibrary.title),
          }}
        />
        <PaperExampleList />
      </View>
    </PaperExampleProvider>
  );
}
