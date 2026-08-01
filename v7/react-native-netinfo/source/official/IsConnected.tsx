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
  isConnected: boolean | null;
}

export default class IsConnected extends React.Component<Record<string, never>, State> {
  private subscription: NetInfoSubscription | null = null;

  state: State = {
    isConnected: null,
  };

  componentDidMount() {
    this.subscription = NetInfo.addEventListener(this.handleConnectivityChange);
  }

  componentWillUnmount() {
    this.subscription?.();
  }

  private handleConnectivityChange = (state: NetInfoState) => {
    this.setState({ isConnected: state.isConnected });
  };

  render() {
    return <View><Text style={{ color: 'black' }}>{this.state.isConnected ? 'Online' : 'Offline'}</Text></View>;
  }
}
