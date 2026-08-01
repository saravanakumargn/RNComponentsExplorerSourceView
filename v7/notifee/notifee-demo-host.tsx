import { type ComponentType } from 'react';

const NotifeeDemo = require('./source/official/App').default as ComponentType;

/** Hosts the untouched official Notifee v9.1.8 example. */
export function NotifeeDemoHost() {
  return <NotifeeDemo />;
}
