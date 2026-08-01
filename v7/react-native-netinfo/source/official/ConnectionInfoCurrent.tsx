/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import * as React from 'react';
import { Text, View } from 'react-native';
import NetInfo, { type NetInfoState, type NetInfoSubscription } from '@react-native-community/netinfo';

interface State {
  connectionInfo: NetInfoState | null;
}

export default class ConnectionInfoCurrent extends React.Component<Record<string, never>, State> {
  private subscription: NetInfoSubscription | null = null;

  state: State = {
    connectionInfo: null,
  };

  componentDidMount() {
    this.subscription = NetInfo.addEventListener(this.handleConnectionInfoChange);
  }

  componentWillUnmount() {
    this.subscription?.();
  }

  private handleConnectionInfoChange = (connectionInfo: NetInfoState) => {
    this.setState({ connectionInfo });
  };

  render() {
    return (
      <View>
        <Text style={{ color: 'black' }}>{JSON.stringify(this.state.connectionInfo)}</Text>
      </View>
    );
  }
}
