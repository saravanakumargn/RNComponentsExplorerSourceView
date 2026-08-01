import React from 'react';
import { View, Image } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps
} from '@react-navigation/drawer';
import { Divider } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';

function CustomContentComponent(
  props: DrawerContentComponentProps
) {
  return (
    <View
      style={{
        flex: 1,
        height: '100%',
        // backgroundColor: theme?.colors?.grey5,
      }}
    >
      <View
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          source={require('../images/logo.png')}
          style={{ width: '70%', height: 100, tintColor: '#397af8' }}
          resizeMode="contain"
        />
      </View>

      <Divider style={{ marginTop: 15 }} />
      <View style={{ marginLeft: 10, width: '100%' }}>
        <DrawerItemList {...props} />
      </View>
    </View>
  );
}

function CustomDrawerContent(
  props: DrawerContentComponentProps
) {
  return (
    <DrawerContentScrollView {...props}>
      <CustomContentComponent {...props} />
    </DrawerContentScrollView>
  );
}

export default CustomDrawerContent;
