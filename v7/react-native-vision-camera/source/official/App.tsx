import {
  createStaticNavigation,
  type StaticParamList,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createContext, useContext } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { VisionCamera } from 'react-native-vision-camera'
import { CameraScreen } from './screens/CameraScreen'
import { PermissionsScreen } from './screens/PermissionsScreen'
import { PhotoScreen } from './screens/PhotoScreen'
import { VideoScreen } from './screens/VideoScreen'

import { DemoBackButton } from '../../../../components/demo-back-button'
import { ViewSourceButton } from '../../../source-viewer/view-source-button'

const CatalogBackContext = createContext<(() => void) | null>(null)

function CatalogBackButton() {
  const onBackToCatalog = useContext(CatalogBackContext)

  return onBackToCatalog ? (
    <DemoBackButton
      accessibilityLabel="Back to libraries"
      onPress={onBackToCatalog}
    />
  ) : null
}

const RootStack = createNativeStackNavigator({
  screenOptions: {
    headerBackButtonDisplayMode: 'minimal',
  },
  initialRouteName:
    VisionCamera.cameraPermissionStatus === 'authorized'
      ? 'Camera'
      : 'Permissions',
  screens: {
    Permissions: {
      screen: PermissionsScreen,
      options: {
        headerLeft: () => <CatalogBackButton />,
        headerRight: () => (
          <ViewSourceButton
            demoId="react-native-vision-camera"
            iconOnly
            title="VisionCamera source"
            initialPath="features/react-native-vision-camera/source/official/screens/PermissionsScreen.tsx"
            onlyInitialPath
          />
        ),
      },
    },
    Camera: {
      screen: CameraScreen,
      options: {
        orientation: 'portrait_up',
        headerLeft: () => <CatalogBackButton />,
        headerRight: () => (
          <ViewSourceButton
            demoId="react-native-vision-camera"
            iconOnly
            title="VisionCamera source"
            initialPath="features/react-native-vision-camera/source/official/screens/CameraScreen.tsx"
            onlyInitialPath
          />
        ),
      },
    },
    Photo: {
      screen: PhotoScreen,
      options: {
        animation: 'none',
        presentation: 'transparentModal',
        headerRight: () => (
          <ViewSourceButton
            demoId="react-native-vision-camera"
            iconOnly
            title="VisionCamera source"
            initialPath="features/react-native-vision-camera/source/official/screens/PhotoScreen.tsx"
            onlyInitialPath
          />
        ),
      },
    },
    Video: {
      screen: VideoScreen,
      options: {
        animation: 'none',
        presentation: 'transparentModal',
        headerRight: () => (
          <ViewSourceButton
            demoId="react-native-vision-camera"
            iconOnly
            title="VisionCamera source"
            initialPath="features/react-native-vision-camera/source/official/screens/VideoScreen.tsx"
            onlyInitialPath
          />
        ),
      },
    },
  },
  screenOptions: {
    navigationBarHidden: true,
    contentStyle: {
      backgroundColor: 'black',
    },
  },
})

type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const Navigation = createStaticNavigation(RootStack)

function App({ onBackToCatalog }: { onBackToCatalog: () => void }) {
  return (
    <CatalogBackContext.Provider value={onBackToCatalog}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Navigation />
      </GestureHandlerRootView>
    </CatalogBackContext.Provider>
  )
}

export default App
