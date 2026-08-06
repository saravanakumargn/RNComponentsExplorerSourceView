import { View } from 'react-native';

import { Avatar, AvatarFallback, AvatarImage, Text } from '../components';
import { DemoScreen, Example } from './demo-layout';

const AVATAR_URI =
  'https://pbs.twimg.com/profile_images/1974205123250565122/6iayFtdc_400x400.jpg';

export default function AvatarScreen() {
  return (
    <DemoScreen>
      <Example title="With image">
        <Avatar alt="NativeWindUI avatar">
          <AvatarImage source={{ uri: AVATAR_URI }} />
          <AvatarFallback>
            <Text>NUI</Text>
          </AvatarFallback>
        </Avatar>
      </Example>

      <Example
        title="Fallback"
        description="Shown while the image loads, or when the source cannot be resolved."
      >
        <Avatar alt="Avatar with no image source">
          <AvatarFallback>
            <Text>RC</Text>
          </AvatarFallback>
        </Avatar>
      </Example>

      <Example title="Sizes" description="Sized with utility classes on the root.">
        <View className="flex-row items-center gap-4">
          <Avatar alt="Small avatar" className="h-8 w-8">
            <AvatarImage source={{ uri: AVATAR_URI }} />
            <AvatarFallback>
              <Text variant="caption2">S</Text>
            </AvatarFallback>
          </Avatar>
          <Avatar alt="Medium avatar">
            <AvatarImage source={{ uri: AVATAR_URI }} />
            <AvatarFallback>
              <Text>M</Text>
            </AvatarFallback>
          </Avatar>
          <Avatar alt="Large avatar" className="h-20 w-20">
            <AvatarImage source={{ uri: AVATAR_URI }} />
            <AvatarFallback>
              <Text variant="title3">L</Text>
            </AvatarFallback>
          </Avatar>
        </View>
      </Example>
    </DemoScreen>
  );
}
