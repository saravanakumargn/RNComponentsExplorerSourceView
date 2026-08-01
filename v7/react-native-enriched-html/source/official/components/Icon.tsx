import { Text, type TextStyle } from 'react-native';
// The official demo's copied asset was omitted from the vendored source. Use
// the identical glyph map from the scoped FontAwesome package already shipped
// by the host application instead.
import glyphMap from '@react-native-vector-icons/fontawesome/glyphmaps/FontAwesome.json';
import { type FC, memo } from 'react';

export type IconName = keyof typeof glyphMap;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

const BaseIcon: FC<IconProps> = ({ name, size = 24, color = 'black' }) => {
  const glyphValue = glyphMap[name];
  const glyph = glyphValue ? String.fromCharCode(glyphValue) : '';

  const styleDefaults: TextStyle = {
    color,
    fontFamily: 'FontAwesome',
    fontSize: size,
    fontWeight: 'normal',
    fontStyle: 'normal',
  };

  return (
    <Text selectable={false} style={styleDefaults}>
      {glyph}
    </Text>
  );
};

export const Icon = memo(BaseIcon);
