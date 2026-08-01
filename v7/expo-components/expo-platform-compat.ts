// Integration compatibility adapter for the Expo 56 main-branch source on the
// host app's Expo 57 runtime. It is applied by Metro only to vendored files.
import 'expo';

export * from 'expo';
export { Platform } from 'react-native';

declare module 'expo' {
  export const Platform: typeof import('react-native').Platform;
}
