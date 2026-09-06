import { type ComponentType } from 'react';

const TinyBaseDemo = require('./source/official/App').default as ComponentType;

/** Hosts the untouched official Expo `with-tinybase` example. */
export function TinyBaseDemoHost() {
  return <TinyBaseDemo />;
}
