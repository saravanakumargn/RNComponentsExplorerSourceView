import React from 'react';
import { NavigationContainer, useTheme as  useNavigationTheme } from '@react-navigation/native';

import { createDemoScreenLayout } from '../../../../../../../components/demo-screen-layout';
import { nestedDemoInitialRouteName } from '../../../../../../../components/nested-demo-deep-link';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Tab, useTheme } from '@rneui/themed';
import DrawerNavigator from './DrawerNavigator';
import Avatars from '../views/avatars';
import Cards from '../views/cards';
import Tiles from '../views/tiles';
import Buttons from '../views/buttons';
import Chips from '../views/chips';
import Lists from '../views/lists';
import Lists2 from '../views/lists2';
import Inputs from '../views/inputs';
import Image from '../views/image';
import LinearProgress from '../views/linearProgress';
import Login from '../views/login';
import Pricing from '../views/pricing';
import Ratings from '../views/ratings';
import Settings from '../views/settings';
import SpeedDial from '../views/speedDial';
import Sliders from '../views/sliders';
import Skeleton from '../views/skeleton';
import SocialIcons from '../views/social_icons';
import Fonts from '../views/fonts';
import BottomSheet from '../views/bottomsheet';
import Tooltip from '../views/tooltip';
import Dialogs from '../views/dialogs';
import Overlay from '../views/overlay';
import CheckBox from '../views/checkbox';
import FAB from '../views/fab';
import Theme from '../views/theme';
import Text from '../views/text';
import Tabs from '../views/tabs';
import Badge from '../views/badge';
import WhatsappClone from '../views/whatsappClone';
import Divider from '../views/Divider';
import { useNavigation } from 'expo-router';

const Drawer = createDrawerNavigator();

// Host integration: a readiness testID per screen, plus `?demo=<route>` support
// for the route smoke suite. A drawer has no back stack, so the deep link names
// the initial route rather than seeding history behind it.
const screenLayout = createDemoScreenLayout("react-native-elements");
const ROUTE_NAMES = [
  "Avatars",
  "Badge",
  "BottomSheet",
  "Buttons",
  "Cards",
  "Checkbox",
  "Chips",
  "Dialogs",
  "Divider",
  "FAB",
  "Fonts",
  "Image",
  "Inputs",
  "LinearProgress",
  "Lists",
  "Lists2",
  "Login",
  "Overlay",
  "Pricing",
  "Ratings",
  "Settings",
  "Slider",
  "Skeleton",
  "Social Icons",
  "Speed Dial",
  "Tabs",
  "Text",
  "Theme",
  "Tiles",
  "Tooltip",
  "Whatsapp Clone",
];

function RootNavigator({ initialDemo }: { initialDemo?: string }) {
  const { theme } = useTheme();
``
  return (
    <NavigationContainer
    >
      <Drawer.Navigator
        id={undefined}
        initialRouteName={nestedDemoInitialRouteName('Avatars', initialDemo, ROUTE_NAMES)}
        screenLayout={screenLayout}
        drawerContent={DrawerNavigator}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: theme?.colors?.white,
            width: '80%',
          },
          drawerActiveTintColor: theme?.colors?.secondary,
          drawerInactiveTintColor: theme?.colors?.grey0,
          drawerLabelStyle: {
            fontSize: 15,
            marginLeft: 0,
          },
          drawerItemStyle: {
            backgroundColor: 'transparent',
          },
          drawerType: 'front', //for android and ios consistency
        }}
      >
        <Drawer.Screen name="Avatars" component={Avatars} />
        <Drawer.Screen name="Badge" component={Badge} />
        <Drawer.Screen name="BottomSheet" component={BottomSheet} />
        <Drawer.Screen name="Buttons" component={Buttons} />
        <Drawer.Screen name="Cards" component={Cards} />
        <Drawer.Screen name="Checkbox" component={CheckBox} />
        <Drawer.Screen name="Chips" component={Chips} />
        <Drawer.Screen name="Dialogs" component={Dialogs} />
        <Drawer.Screen name="Divider" component={Divider} />
        <Drawer.Screen name="FAB" component={FAB} />
        <Drawer.Screen name="Fonts" component={Fonts} />
        <Drawer.Screen name="Image" component={Image} />
        <Drawer.Screen name="Inputs" component={Inputs} />
        <Drawer.Screen name="LinearProgress" component={LinearProgress} />
        <Drawer.Screen name="Lists" component={Lists} />
        <Drawer.Screen name="Lists2" component={Lists2} />
        <Drawer.Screen name="Login" component={Login} />
        <Drawer.Screen name="Overlay" component={Overlay} />
        <Drawer.Screen name="Pricing" component={Pricing} />
        <Drawer.Screen name="Ratings" component={Ratings} />
        <Drawer.Screen name="Settings" component={Settings} />
        <Drawer.Screen name="Slider" component={Sliders} />
        <Drawer.Screen name="Skeleton" component={Skeleton} />
        <Drawer.Screen name="Social Icons" component={SocialIcons} />
        <Drawer.Screen name="Speed Dial" component={SpeedDial} />
        <Drawer.Screen name="Tabs" component={Tabs} />
        <Drawer.Screen name="Text" component={Text} />
        <Drawer.Screen name="Theme" component={Theme} />
        <Drawer.Screen name="Tiles" component={Tiles} />
        <Drawer.Screen name="Tooltip" component={Tooltip} />
        <Drawer.Screen name="Whatsapp Clone" component={WhatsappClone} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
