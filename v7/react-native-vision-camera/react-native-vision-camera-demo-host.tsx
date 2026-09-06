import { NavigationIndependentTree } from '@react-navigation/native';
import { type ComponentType } from 'react';

type ReactNativeVisionCameraDemoHostProps = {
  onBackToCatalog: () => void;
};

const OfficialVisionCameraExample = require('./source/official/App').default as ComponentType<{
  onBackToCatalog: () => void;
}>;

/** Hosts the official VisionCamera v5.2.0 simple-camera example. */
export function ReactNativeVisionCameraDemoHost({
  onBackToCatalog,
}: ReactNativeVisionCameraDemoHostProps) {
  return (
    <NavigationIndependentTree>
      <OfficialVisionCameraExample onBackToCatalog={onBackToCatalog} />
    </NavigationIndependentTree>
  );
}
