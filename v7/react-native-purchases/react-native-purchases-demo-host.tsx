import { type ComponentType } from 'react';

const MagicWeatherDemo = require('./source/official/App').default as ComponentType;

/** Hosts the untouched official RevenueCat Magic Weather 10.5.0 example. */
export function ReactNativePurchasesDemoHost() {
  return <MagicWeatherDemo />;
}
