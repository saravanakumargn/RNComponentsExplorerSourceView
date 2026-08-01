import type { ComponentType } from 'react';
import { useRouter } from 'expo-router';
import { FlatList } from 'react-native';
import { Divider, List } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ActivityIndicatorExample from './src/Examples/ActivityIndicatorExample';
import AnimatedFABExample from './src/Examples/AnimatedFABExample';
import AppbarExample from './src/Examples/AppbarExample';
import AvatarExample from './src/Examples/AvatarExample';
import BadgeExample from './src/Examples/BadgeExample';
import BannerExample from './src/Examples/BannerExample';
import BottomNavigationBarExample from './src/Examples/BottomNavigationBarExample';
import BottomNavigationExample from './src/Examples/BottomNavigationExample';
import ButtonExample from './src/Examples/ButtonExample';
import CardExample from './src/Examples/CardExample';
import CheckboxExample from './src/Examples/CheckboxExample';
import CheckboxItemExample from './src/Examples/CheckboxItemExample';
import ChipExample from './src/Examples/ChipExample';
import DataTableExample from './src/Examples/DataTableExample';
import DialogExample from './src/Examples/DialogExample';
import DividerExample from './src/Examples/DividerExample';
import FABExample from './src/Examples/FABExample';
import IconButtonExample from './src/Examples/IconButtonExample';
import IconExample from './src/Examples/IconExample';
import ListAccordionExample from './src/Examples/ListAccordionExample';
import ListAccordionExampleGroup from './src/Examples/ListAccordionGroupExample';
import ListItemExample from './src/Examples/ListItemExample';
import ListSectionExample from './src/Examples/ListSectionExample';
import MenuExample from './src/Examples/MenuExample';
import ProgressBarExample from './src/Examples/ProgressBarExample';
import RadioButtonExample from './src/Examples/RadioButtonExample';
import RadioButtonGroupExample from './src/Examples/RadioButtonGroupExample';
import RadioButtonItemExample from './src/Examples/RadioButtonItemExample';
import SearchbarExample from './src/Examples/SearchbarExample';
import SegmentedButtonMultiselectRealCase from './src/Examples/SegmentedButtons/SegmentedButtonMultiselectRealCase';
import SegmentedButtonRealCase from './src/Examples/SegmentedButtons/SegmentedButtonRealCase';
import SegmentedButtonExample from './src/Examples/SegmentedButtonsExample';
import SnackbarExample from './src/Examples/SnackbarExample';
import SurfaceExample from './src/Examples/SurfaceExample';
import SwitchExample from './src/Examples/SwitchExample';
import TeamDetails from './src/Examples/TeamDetails';
import TeamsList from './src/Examples/TeamsList';
import TextExample from './src/Examples/TextExample';
import TextInputExample from './src/Examples/TextInputExample';
import ThemeExample from './src/Examples/ThemeExample';
import ThemingWithReactNavigation from './src/Examples/ThemingWithReactNavigation';
import ToggleButtonExample from './src/Examples/ToggleButtonExample';
import TooltipExample from './src/Examples/TooltipExample';
import TouchableRippleExample from './src/Examples/TouchableRippleExample';
import { useExampleTheme } from './src/hooks/useExampleTheme';

type ExampleComponent = ComponentType<any> & {
  title: string;
};

/** The top-level file that renders each Paper example route. */
export const paperExampleSourcePaths: Record<string, string> = {
  animatedFab: 'features/paper-example/src/Examples/AnimatedFABExample/AnimatedFABExample.tsx',
  activityIndicator: 'features/paper-example/src/Examples/ActivityIndicatorExample.tsx',
  appbar: 'features/paper-example/src/Examples/AppbarExample.tsx',
  avatar: 'features/paper-example/src/Examples/AvatarExample.tsx',
  badge: 'features/paper-example/src/Examples/BadgeExample.tsx',
  banner: 'features/paper-example/src/Examples/BannerExample.tsx',
  bottomNavigationBarExample: 'features/paper-example/src/Examples/BottomNavigationBarExample.tsx',
  bottomNavigation: 'features/paper-example/src/Examples/BottomNavigationExample.tsx',
  button: 'features/paper-example/src/Examples/ButtonExample.tsx',
  card: 'features/paper-example/src/Examples/CardExample.tsx',
  checkbox: 'features/paper-example/src/Examples/CheckboxExample.tsx',
  checkboxItem: 'features/paper-example/src/Examples/CheckboxItemExample.tsx',
  chip: 'features/paper-example/src/Examples/ChipExample.tsx',
  dataTable: 'features/paper-example/src/Examples/DataTableExample.tsx',
  dialog: 'features/paper-example/src/Examples/DialogExample.tsx',
  divider: 'features/paper-example/src/Examples/DividerExample.tsx',
  fab: 'features/paper-example/src/Examples/FABExample.tsx',
  iconButton: 'features/paper-example/src/Examples/IconButtonExample.tsx',
  icon: 'features/paper-example/src/Examples/IconExample.tsx',
  listAccordion: 'features/paper-example/src/Examples/ListAccordionExample.tsx',
  listAccordionGroup: 'features/paper-example/src/Examples/ListAccordionGroupExample.tsx',
  listSection: 'features/paper-example/src/Examples/ListSectionExample.tsx',
  listItem: 'features/paper-example/src/Examples/ListItemExample.tsx',
  menu: 'features/paper-example/src/Examples/MenuExample.tsx',
  progressbar: 'features/paper-example/src/Examples/ProgressBarExample.tsx',
  radio: 'features/paper-example/src/Examples/RadioButtonExample.tsx',
  radioGroup: 'features/paper-example/src/Examples/RadioButtonGroupExample.tsx',
  radioItem: 'features/paper-example/src/Examples/RadioButtonItemExample.tsx',
  searchbar: 'features/paper-example/src/Examples/SearchbarExample.tsx',
  segmentedButton: 'features/paper-example/src/Examples/SegmentedButtonsExample.tsx',
  snackbar: 'features/paper-example/src/Examples/SnackbarExample.tsx',
  surface: 'features/paper-example/src/Examples/SurfaceExample.tsx',
  switch: 'features/paper-example/src/Examples/SwitchExample.tsx',
  text: 'features/paper-example/src/Examples/TextExample.tsx',
  textInput: 'features/paper-example/src/Examples/TextInputExample.tsx',
  toggleButton: 'features/paper-example/src/Examples/ToggleButtonExample.tsx',
  tooltipExample: 'features/paper-example/src/Examples/TooltipExample.tsx',
  touchableRipple: 'features/paper-example/src/Examples/TouchableRippleExample.tsx',
  theme: 'features/paper-example/src/Examples/ThemeExample.tsx',
  themingWithReactNavigation: 'features/paper-example/src/Examples/ThemingWithReactNavigation.tsx',
  teamDetails: 'features/paper-example/src/Examples/TeamDetails.tsx',
  teamsList: 'features/paper-example/src/Examples/TeamsList.tsx',
  segmentedButtonRealCase: 'features/paper-example/src/Examples/SegmentedButtons/SegmentedButtonRealCase.tsx',
  segmentedButtonMultiselectRealCase:
    'features/paper-example/src/Examples/SegmentedButtons/SegmentedButtonMultiselectRealCase.tsx',
};

export const mainPaperExamples: Record<string, ExampleComponent> = {
  animatedFab: AnimatedFABExample,
  activityIndicator: ActivityIndicatorExample,
  appbar: AppbarExample,
  avatar: AvatarExample,
  badge: BadgeExample,
  banner: BannerExample,
  bottomNavigationBarExample: BottomNavigationBarExample,
  bottomNavigation: BottomNavigationExample,
  button: ButtonExample,
  card: CardExample,
  checkbox: CheckboxExample,
  checkboxItem: CheckboxItemExample,
  chip: ChipExample,
  dataTable: DataTableExample,
  dialog: DialogExample,
  divider: DividerExample,
  fab: FABExample,
  iconButton: IconButtonExample,
  icon: IconExample,
  listAccordion: ListAccordionExample,
  listAccordionGroup: ListAccordionExampleGroup,
  listSection: ListSectionExample,
  listItem: ListItemExample,
  menu: MenuExample,
  progressbar: ProgressBarExample,
  radio: RadioButtonExample,
  radioGroup: RadioButtonGroupExample,
  radioItem: RadioButtonItemExample,
  searchbar: SearchbarExample,
  segmentedButton: SegmentedButtonExample,
  snackbar: SnackbarExample,
  surface: SurfaceExample,
  switch: SwitchExample,
  text: TextExample,
  textInput: TextInputExample,
  toggleButton: ToggleButtonExample,
  tooltipExample: TooltipExample,
  touchableRipple: TouchableRippleExample,
  theme: ThemeExample,
  themingWithReactNavigation: ThemingWithReactNavigation,
};

export const paperExamples: Record<string, ExampleComponent> = {
  ...mainPaperExamples,
  teamDetails: TeamDetails,
  teamsList: TeamsList,
  segmentedButtonRealCase: SegmentedButtonRealCase,
  segmentedButtonMultiselectRealCase: SegmentedButtonMultiselectRealCase,
};

export function getPaperExample(id: string | undefined) {
  return paperExamples[id ?? ''];
}

export function PaperExampleList() {
  const router = useRouter();
  const { colors } = useExampleTheme();
  const insets = useSafeAreaInsets();
  const data = Object.entries(mainPaperExamples);

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        backgroundColor: colors.background,
        paddingBottom: insets.bottom + 24,
      }}
      data={data}
      ItemSeparatorComponent={Divider}
      keyExtractor={([id]) => id}
      renderItem={({ item: [id, Example] }) => (
        <List.Item
          title={Example.title}
          onPress={() =>
            router.push({
              pathname: '/library/[library]/[demo]',
              params: { library: 'react-native-paper', demo: id },
            })
          }
        />
      )}
      style={{ backgroundColor: colors.background }}
    />
  );
}
