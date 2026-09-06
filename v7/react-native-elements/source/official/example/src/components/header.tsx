import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Header as HeaderRNE, Icon } from '@rneui/themed';
import { DemoBackButton } from '../../../../../../../components/demo-back-button';
import { useBackToCatalog } from '../../../../../navigation-bridge';
import { ViewSourceButton } from '../../../../../../source-viewer/view-source-button';

type HeaderComponentProps = {
  title: string;
  view?: string;
};

type ParamList = {
  Detail: {
    openDrawer: void;
  };
};

const sourcePathByTitle: Record<string, string> = {
  Avatars: 'features/react-native-elements/source/official/example/src/views/avatars.tsx',
  Badge: 'features/react-native-elements/source/official/example/src/views/badge.tsx',
  BottomSheet: 'features/react-native-elements/source/official/example/src/views/bottomsheet.tsx',
  Buttons: 'features/react-native-elements/source/official/example/src/views/buttons.tsx',
  Cards: 'features/react-native-elements/source/official/example/src/views/cards.tsx',
  Checkbox: 'features/react-native-elements/source/official/example/src/views/checkbox.tsx',
  Chips: 'features/react-native-elements/source/official/example/src/views/chips.tsx',
  Dialogs: 'features/react-native-elements/source/official/example/src/views/dialogs.tsx',
  Divider: 'features/react-native-elements/source/official/example/src/views/Divider.tsx',
  FAB: 'features/react-native-elements/source/official/example/src/views/fab.tsx',
  'Fonts Examples': 'features/react-native-elements/source/official/example/src/views/fonts.tsx',
  Image: 'features/react-native-elements/source/official/example/src/views/image.tsx',
  Inputs: 'features/react-native-elements/source/official/example/src/views/inputs.tsx',
  LinearProgress: 'features/react-native-elements/source/official/example/src/views/linearProgress.tsx',
  Lists: 'features/react-native-elements/source/official/example/src/views/lists/index.tsx',
  'Lists 2': 'features/react-native-elements/source/official/example/src/views/lists2.tsx',
  'Login Example': 'features/react-native-elements/source/official/example/src/views/login/index.tsx',
  Overlay: 'features/react-native-elements/source/official/example/src/views/overlay.tsx',
  Pricing: 'features/react-native-elements/source/official/example/src/views/pricing.tsx',
  Ratings: 'features/react-native-elements/source/official/example/src/views/ratings.tsx',
  'Settings Example': 'features/react-native-elements/source/official/example/src/views/settings.tsx',
  Slider: 'features/react-native-elements/source/official/example/src/views/sliders.tsx',
  Skeleton: 'features/react-native-elements/source/official/example/src/views/skeleton.tsx',
  'Social Icons': 'features/react-native-elements/source/official/example/src/views/social_icons.tsx',
  'Speed Dial': 'features/react-native-elements/source/official/example/src/views/speedDial.tsx',
  Tab: 'features/react-native-elements/source/official/example/src/views/tabs.tsx',
  Text: 'features/react-native-elements/source/official/example/src/views/text.tsx',
  Theme: 'features/react-native-elements/source/official/example/src/views/theme.tsx',
  Tiles: 'features/react-native-elements/source/official/example/src/views/tiles.tsx',
  Tooltip: 'features/react-native-elements/source/official/example/src/views/tooltip.tsx',
  'Whatsapp Clone': 'features/react-native-elements/source/official/example/src/views/whatsappClone.tsx',
};

const Header: React.FunctionComponent<HeaderComponentProps> = (props) => {
  const navigation = useNavigation<DrawerNavigationProp<ParamList, 'Detail'>>();
  const backToCatalog = useBackToCatalog();
  const sourcePath = sourcePathByTitle[props.title];

  return (
    <HeaderRNE
      leftComponent={<DemoBackButton onPress={backToCatalog} tintColor="#fff" />}
      rightComponent={
        <View style={styles.rightActions}>
          <ViewSourceButton
            demoId="react-native-elements"
            iconColor="#fff"
            iconOnly
            title="React Native Elements source"
            initialPath={sourcePath}
            onlyInitialPath={sourcePath !== undefined}
          />
          <Icon name="menu" color="#fff" onPress={navigation.openDrawer} />
        </View>
      }
      centerComponent={{ text: props.title, style: styles.heading }}
    />
  );
};

type SubHeaderProps = {
  title: string;
  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

const SubHeader = ({ title, containerStyle, textStyle }: SubHeaderProps) => {
  return (
    <View style={[styles.headerContainer, containerStyle]}>
      <Text style={[styles.heading, textStyle]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#397af8',
    marginBottom: 20,
    width: '100%',
    paddingVertical: 15,
  },
  heading: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  subheaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rightActions: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export { Header, SubHeader };
