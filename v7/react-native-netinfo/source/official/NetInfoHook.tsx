/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import { Text, View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';

export default function NetInfoHook() {
  const netInfo = useNetInfo();

  return <View><Text style={{ color: 'black' }}>{JSON.stringify(netInfo)}</Text></View>;
}
