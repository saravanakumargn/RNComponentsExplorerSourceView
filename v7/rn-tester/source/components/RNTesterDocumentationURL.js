/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import {Image, StyleSheet, TouchableOpacity} from 'react-native';

type Props = Readonly<{
  documentationURL: string,
}>;

const RNTesterDocumentationURL = ({documentationURL}: Props): React.Node => (
  <TouchableOpacity
    style={styles.container}
    onPress={() => WebBrowser.openBrowserAsync(documentationURL)}>
    <Image
      source={require('../assets/documentation.png')}
      style={styles.icon}
    />
  </TouchableOpacity>
);

export default RNTesterDocumentationURL;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  icon: {
    height: 24,
    width: 24,
  },
});
