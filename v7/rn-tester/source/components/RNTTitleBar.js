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
import Ionicons from '@expo/vector-icons/Ionicons';
import {HeaderBackButton} from 'expo-router/react-navigation';
import * as React from 'react';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';

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

  if (Platform.OS === 'ios') {
    return (
      <HeaderBackButton
        accessibilityLabel="Back"
        onPress={onPress}
        tintColor={theme.LinkColor}
      />
    );
  }

  return (
    <Pressable
      accessibilityLabel="Back"
      accessibilityRole="button"
      hitSlop={12}
      onPress={onPress}
      style={styles.androidBackButton}>
      <Ionicons name="arrow-back" size={32} color={theme.LabelColor} />
    </Pressable>
  );
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
  return (
    <View
      style={[styles.header, {backgroundColor: theme.SystemBackgroundColor}]}>
      <View style={styles.headerCenter}>
        <Text style={{...styles.title, color: theme.LabelColor}}>{title}</Text>
        {documentationURL && (
          <RNTesterDocumentationURL documentationURL={documentationURL} />
        )}
      </View>
      <View style={styles.backButton}>
        <RNTesterBackButton onBack={onBack} onExit={onExit} theme={theme}>
          {children}
        </RNTesterBackButton>
      </View>
      <View style={styles.rightActions}>{rightChildren}</View>
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
  return (
    <View style={[styles.toolbar, {backgroundColor: theme.BackgroundColor}]}>
      <View style={styles.toolbarCenter}>
        <Text style={[styles.title, {color: theme.LabelColor}]}>{title}</Text>
        {documentationURL && (
          <RNTesterDocumentationURL documentationURL={documentationURL} />
        )}
      </View>
      <View style={styles.backButton}>
        <RNTesterBackButton onBack={onBack} onExit={onExit} theme={theme}>
          {children}
        </RNTesterBackButton>
      </View>
      <View style={styles.rightActions}>{rightChildren}</View>
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
    marginTop: Platform.OS === 'ios' && !Platform.isTV ? 50 : 0,
  },
  headerCenter: {
    flex: 1,
    position: 'absolute',
    top: 7,
    left: 0,
    right: 0,
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
    alignSelf: 'flex-start',
    marginLeft: 'auto',
  },
  androidBackButton: {
    padding: 4,
  },
  toolbar: {
    height: 56,
    flexDirection: 'row',
  },
  toolbarCenter: {
    flex: 1,
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
