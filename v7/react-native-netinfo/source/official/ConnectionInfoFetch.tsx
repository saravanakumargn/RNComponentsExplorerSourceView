/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import * as React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

interface State {
  connectionInfo: string;
}

export default class ConnectionInfoFetch extends React.Component<Record<string, never>, State> {
  state: State = {
    connectionInfo: 'Tap to get current state',
  };

  componentDidMount() {
    void this.fetchState();
  }

  private fetchState = async () => {
    const state = await NetInfo.fetch();
    this.setState({ connectionInfo: JSON.stringify(state) });
  };

  render() {
    return (
      <View>
        <TouchableOpacity onPress={this.fetchState}>
          <Text style={{ color: 'black' }}>{this.state.connectionInfo}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
