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

export default class ConnectionInfoRefresh extends React.Component<Record<string, never>, State> {
  state: State = {
    connectionInfo: 'Tap to refresh state',
  };

  componentDidMount() {
    void this.refreshState();
  }

  private refreshState = async () => {
    const state = await NetInfo.refresh();
    this.setState({ connectionInfo: JSON.stringify(state) });
  };

  private triggerMultipleRefreshes = () => {
    void this.refreshState();
    void this.refreshState();
    void this.refreshState();
    void this.refreshState();
  };

  render() {
    return (
      <View>
        <TouchableOpacity onPress={this.triggerMultipleRefreshes}>
          <Text>Tap to trigger multiple refreshes</Text>
        </TouchableOpacity>
        <Text style={{ color: 'black' }}>{this.state.connectionInfo}</Text>
      </View>
    );
  }
}
