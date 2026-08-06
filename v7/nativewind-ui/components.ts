/**
 * Typed access to the vendored NativeWindUI components.
 *
 * `source/official/` is excluded from the explorer's TypeScript project, as
 * every vendored demo is — it uses upstream's own `@/…` paths and is pinned to
 * upstream's dependency versions, so type-checking it here reports errors that
 * are neither ours nor actionable. A plain `import` would defeat that exclusion
 * by pulling the files back into the program, so the components are loaded with
 * `require` and given the small prop surface the demo screens actually use.
 */
import type { ComponentProps, ComponentType, ReactNode } from 'react';
import type { PressableProps, ViewProps } from 'react-native';
import type { ActivityIndicator as RNActivityIndicator, Switch } from 'react-native';
import type DateTimePicker from '@react-native-community/datetimepicker';
import type RNSlider from '@react-native-community/slider';
import type { Picker as RNPicker } from '@react-native-picker/picker';

// Paths must be literals: Metro resolves requires statically and rejects a
// template literal here.
const AvatarModule = require('./source/official/components/nativewindui/Avatar');
const PickerModule = require('./source/official/components/nativewindui/Picker');

export type TextVariant =
  | 'largeTitle'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'heading'
  | 'body'
  | 'callout'
  | 'subhead'
  | 'footnote'
  | 'caption1'
  | 'caption2';

export type TextColor = 'primary' | 'secondary' | 'tertiary' | 'quarternary';

export const Text: ComponentType<{
  children?: ReactNode;
  className?: string;
  variant?: TextVariant;
  color?: TextColor;
}> = require('./source/official/components/nativewindui/Text').Text;

export const Button: ComponentType<
  PressableProps & {
    children?: ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary' | 'tonal' | 'plain';
    size?: 'none' | 'sm' | 'md' | 'lg' | 'icon';
  }
> = require('./source/official/components/nativewindui/Button').Button;

export const Icon: ComponentType<{
  name: string;
  size?: number;
  color?: string;
  className?: string;
}> = require('./source/official/components/nativewindui/Icon').Icon;

type AvatarRootProps = ViewProps & { alt: string; children?: ReactNode; className?: string };

export const Avatar: ComponentType<AvatarRootProps> = AvatarModule.Avatar;
export const AvatarImage: ComponentType<{
  source: { uri: string };
  className?: string;
}> = AvatarModule.AvatarImage;
export const AvatarFallback: ComponentType<{
  children?: ReactNode;
  className?: string;
}> = AvatarModule.AvatarFallback;

export const Toggle: ComponentType<ComponentProps<typeof Switch>> =
  require('./source/official/components/nativewindui/Toggle').Toggle;

export const Slider: ComponentType<ComponentProps<typeof RNSlider>> =
  require('./source/official/components/nativewindui/Slider').Slider;

export const ActivityIndicator: ComponentType<ComponentProps<typeof RNActivityIndicator>> =
  require('./source/official/components/nativewindui/ActivityIndicator').ActivityIndicator;

export const ProgressIndicator: ComponentType<
  ViewProps & { value?: number; max?: number; className?: string }
> = require('./source/official/components/nativewindui/ProgressIndicator').ProgressIndicator;

export const DatePicker: ComponentType<
  ComponentProps<typeof DateTimePicker> & { mode: 'date' | 'time' | 'datetime' }
> = require('./source/official/components/nativewindui/DatePicker').DatePicker;

export const Picker: ComponentType<
  ComponentProps<typeof RNPicker<string>> & { className?: string }
> = PickerModule.Picker;

export const PickerItem: ComponentType<{ label: string; value: string }> =
  PickerModule.PickerItem;

export const ThemeToggle: ComponentType<Record<string, never>> =
  require('./source/official/components/nativewindui/ThemeToggle').ThemeToggle;
