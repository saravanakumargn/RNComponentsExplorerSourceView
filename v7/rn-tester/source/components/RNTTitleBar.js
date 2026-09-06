/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import RNTesterDocumentationURL from './RNTesterDocumentationURL';
import {type RNTesterTheme} from './RNTesterTheme';
import {DemoBackButton} from '../../../../components/demo-back-button';
import * as React from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const RNTesterBackButton = ({
  children,
  onBack,
  onExit,
  theme,
}: {
  children?: React.Node,
  onBack?: () => void,
  onExit?: () => void,
  theme: RNTesterTheme,
}): React.Node => {
  if (children != null) {
    return children;
  }

  const onPress = onBack ?? onExit;
  if (onPress == null) {
    return null;
  }

  return <DemoBackButton onPress={onPress} tintColor={theme.LinkColor} />;
};

const HeaderIOS = ({
  children,
  rightChildren,
  title,
  documentationURL,
  onBack,
  onExit,
  theme,
}: {
  children?: React.Node,
  rightChildren?: React.Node,
  title: string,
  documentationURL?: string,
  onBack?: () => void,
  onExit?: () => void,
  theme: RNTesterTheme,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.header,
        {
          marginTop: Platform.isTV ? 0 : insets.top,
          backgroundColor: theme.SystemBackgroundColor,
        },
      ]}>
      <View style={styles.headerCenter}>
        <Text numberOfLines={1} style={{...styles.title, color: theme.LabelColor}}>
          {title}
        </Text>
      </View>
      <View style={styles.backButton}>
        <RNTesterBackButton onBack={onBack} onExit={onExit} theme={theme}>
          {children}
        </RNTesterBackButton>
      </View>
      <View style={styles.rightActions}>
        {documentationURL && (
          <RNTesterDocumentationURL documentationURL={documentationURL} />
        )}
        {rightChildren}
      </View>
    </View>
  );
};

const HeaderAndroid = ({
  children,
  rightChildren,
  title,
  documentationURL,
  onBack,
  onExit,
  theme,
}: {
  children?: React.Node,
  rightChildren?: React.Node,
  title: string,
  documentationURL?: string,
  onBack?: () => void,
  onExit?: () => void,
  theme: RNTesterTheme,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.toolbar,
        {marginTop: insets.top, backgroundColor: theme.BackgroundColor},
      ]}>
      <View style={styles.toolbarCenter}>
        <Text numberOfLines={1} style={[styles.title, {color: theme.LabelColor}]}>
          {title}
        </Text>
      </View>
      <View style={styles.backButton}>
        <RNTesterBackButton onBack={onBack} onExit={onExit} theme={theme}>
          {children}
        </RNTesterBackButton>
      </View>
      <View style={styles.rightActions}>
        {documentationURL && (
          <RNTesterDocumentationURL documentationURL={documentationURL} />
        )}
        {rightChildren}
      </View>
    </View>
  );
};

export default function RNTTitleBar({
  children,
  rightChildren,
  title,
  documentationURL,
  onBack,
  onExit,
  theme,
}: {
  children?: React.Node,
  rightChildren?: React.Node,
  title: string,
  documentationURL?: string,
  onBack?: () => void,
  onExit?: () => void,
  theme: RNTesterTheme,
  ...
}): React.Node {
  return Platform.OS === 'ios' ? (
    <HeaderIOS
      documentationURL={documentationURL}
      title={title}
      children={children}
      rightChildren={rightChildren}
      onBack={onBack}
      onExit={onExit}
      theme={theme}
    />
  ) : (
    <HeaderAndroid
      documentationURL={documentationURL}
      title={title}
      children={children}
      rightChildren={rightChildren}
      onBack={onBack}
      onExit={onExit}
      theme={theme}
    />
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  header: {
    height: 40,
    flexDirection: 'row',
  },
  headerCenter: {
    flex: 1,
    position: 'absolute',
    top: 7,
    left: 48,
    right: 96,
    alignItems: 'center',
  },
  title: {
    fontSize: 19,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  rightActions: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    flexShrink: 0,
    gap: 4,
    marginLeft: 'auto',
    paddingRight: 4,
  },
  toolbar: {
    height: 56,
    flexDirection: 'row',
  },
  toolbarCenter: {
    flex: 1,
    position: 'absolute',
    top: 12,
    left: 48,
    right: 96,
    alignItems: 'center',
  },
});
