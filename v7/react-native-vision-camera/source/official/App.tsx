import {
  createStaticNavigation,
  type StaticParamList,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { VisionCamera } from 'react-native-vision-camera'
import { CameraScreen } from './screens/CameraScreen'
import { PermissionsScreen } from './screens/PermissionsScreen'
import { PhotoScreen } from './screens/PhotoScreen'
import { VideoScreen } from './screens/VideoScreen'

import { ViewSourceButton } from '../../../source-viewer/view-source-button'

const RootStack = createNativeStackNavigator({
  initialRouteName:
    VisionCamera.cameraPermissionStatus === 'authorized'
      ? 'Camera'
      : 'Permissions',
  screens: {
    Permissions: {
      screen: PermissionsScreen,
      options: {
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

function App() {
  return (
    <GestureHandlerRootView>
      <Navigation />
    </GestureHandlerRootView>
  )
}

export default App
