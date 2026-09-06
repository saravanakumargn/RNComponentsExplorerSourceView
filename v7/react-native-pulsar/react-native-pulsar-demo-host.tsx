import { type ComponentType } from 'react';

const PulsarDemo = require('./source/official/App').default as ComponentType<{
  initialDemo?: string;
}>;

/**
 * Hosts the official Pulsar v1.6.1 example app. The only change to the vendored
 * source is an `initialDemo` prop, so the route smoke suite can open one of its
 * tabs directly.
 */
export function ReactNativePulsarDemoHost({ initialDemo }: { initialDemo?: string }) {
  return <PulsarDemo initialDemo={initialDemo} />;
}
