import { NavigationIndependentTree } from '@react-navigation/native';
import { type ComponentType } from 'react';

const OfficialVisionCameraExample = require('./source/official/App').default as ComponentType;

/** Hosts the official VisionCamera v5.2.0 simple-camera example. */
export function ReactNativeVisionCameraDemoHost() {
  return (
    <NavigationIndependentTree>
      <OfficialVisionCameraExample />
    </NavigationIndependentTree>
  );
}
