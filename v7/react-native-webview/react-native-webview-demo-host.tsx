import { type ComponentType } from 'react';

const WebViewDemo = require('./source/official/App').default as ComponentType<{
  initialDemo?: string;
}>;

/**
 * Hosts the official react-native-webview v13.16.1 example. The only change to
 * the vendored source is an `initialDemo` prop, so the route smoke suite can
 * open one of its tests directly.
 */
export function ReactNativeWebViewDemoHost({ initialDemo }: { initialDemo?: string }) {
  return <WebViewDemo initialDemo={initialDemo} />;
}
