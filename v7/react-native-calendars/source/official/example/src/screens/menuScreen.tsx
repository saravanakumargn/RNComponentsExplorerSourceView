import React, {useState, useCallback} from 'react';
import {I18nManager, StyleSheet, Modal, FlatList, SafeAreaView, View, TouchableOpacity, Text, Image, Switch} from 'react-native';
import testIDs from '../testIDs';
import CalendarScreen from './calendarScreen';
import CalendarPlaygroundScreen from './calendarPlaygroundScreen';
import AgendaScreen from './agendaScreen';
import AgendaInfiniteListScreen from './agendaInfiniteListScreen';
import CalendarListScreen from './calendarListScreen';
import NewCalendarListScreen from './newCalendarListScreen';
import ExpandableCalendarScreen from './expandableCalendarScreen';
import TimelineCalendarScreen from './timelineCalendarScreen';
import PlaygroundScreen from './playgroundScreen';
import {useBackToCatalog} from '../../../../../navigation-bridge';
import {ViewSourceButton} from '../../../../../../source-viewer/view-source-button';

const settingsIcon = require('../img/settings.png');
const closeIcon = require('../img/close.png');

const screens = [
  {testID: testIDs.menu.CALENDARS, title: 'Calendar', screen: CalendarScreen, sourcePath: 'features/react-native-calendars/source/official/example/src/screens/calendarScreen.tsx'},
  {testID: testIDs.menu.CALENDARS, title: 'Calendar Playground', screen: CalendarPlaygroundScreen, sourcePath: 'features/react-native-calendars/source/official/example/src/screens/calendarPlaygroundScreen.tsx'},
  {testID: testIDs.menu.CALENDAR_LIST, title: 'Calendar List', screen: CalendarListScreen, sourcePath: 'features/react-native-calendars/source/official/example/src/screens/calendarListScreen.tsx'},
  {testID: testIDs.menu.HORIZONTAL_LIST, title: 'Horizontal Calendar List', screen: CalendarListScreen, props: {horizontalView: true}, sourcePath: 'features/react-native-calendars/source/official/example/src/screens/calendarListScreen.tsx'},
  {testID: testIDs.menu.HORIZONTAL_LIST, title: 'NEW Calendar List', screen: NewCalendarListScreen, sourcePath: 'features/react-native-calendars/source/official/example/src/screens/newCalendarListScreen.tsx'},
  {testID: testIDs.menu.AGENDA, title: 'Agenda', screen: AgendaScreen, sourcePath: 'features/react-native-calendars/source/official/example/src/screens/agendaScreen.tsx'},
  {testID: testIDs.menu.AGENDA_INFINITE, title: 'Agenda Infinite List', screen: AgendaInfiniteListScreen, sourcePath: 'features/react-native-calendars/source/official/example/src/screens/agendaInfiniteListScreen.tsx'},
  {testID: testIDs.menu.EXPANDABLE_CALENDAR, title: 'Expandable Calendar', screen: ExpandableCalendarScreen, sourcePath: 'features/react-native-calendars/source/official/example/src/screens/expandableCalendarScreen.tsx'},
  {testID: testIDs.menu.TIMELINE_CALENDAR, title: 'Timeline Calendar', screen: TimelineCalendarScreen, sourcePath: 'features/react-native-calendars/source/official/example/src/screens/timelineCalendarScreen.tsx'},
  {testID: testIDs.menu.WEEK_CALENDAR, title: 'Week Calendar', screen: ExpandableCalendarScreen, props: {weekView: true}, sourcePath: 'features/react-native-calendars/source/official/example/src/screens/expandableCalendarScreen.tsx'},
  {testID: testIDs.menu.PLAYGROUND, title: 'Playground', screen: PlaygroundScreen, sourcePath: 'features/react-native-calendars/source/official/example/src/screens/playgroundScreen.tsx'}
];

const MenuScreen = () => {
  const backToCatalog = useBackToCatalog();
  const [forceRTL, setForceRTL] = useState(I18nManager.isRTL);
  const [showSettings, setShowSettings] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [nextScreen, setNextScreen] = useState(screens[0]);

  const keyExtractor = (item: any) => `${item.title}-${item.testID}`;

  const toggleRTL = useCallback((value) => {
    I18nManager.forceRTL(value);
    setForceRTL(value);
  }, []);

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const onPress = useCallback(item => {
    setNextScreen(item);
    setShowModal(true);
  }, []);

  const renderSettings = () => {
    return (
      <View style={styles.settingsContainer}>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Force RTL</Text>
          <Switch value={forceRTL} onValueChange={toggleRTL}/>
        </View>
      </View>
    );
  };

  const renderModal = () => {
    const ScreenComponent = nextScreen.screen;

    return (
      <Modal visible={showModal} animationType="slide">
        <SafeAreaView style={styles.screenContainer}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.topBarButton} onPress={() => setShowModal(false)}><Image source={closeIcon}/></TouchableOpacity>
            <Text style={styles.topBarTitle}>{nextScreen.title}</Text>
            <View style={styles.topBarSource}>
              <ViewSourceButton
                demoId="react-native-calendars"
                iconOnly
                title="React Native Calendars source"
                initialPath={nextScreen.sourcePath}
                onlyInitialPath
              />
            </View>
          </View>
          <ScreenComponent {...nextScreen.props}/>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderItem = useCallback(({item}) => {
    return (
      <TouchableOpacity testID={item.testID} onPress={() => onPress(item)} style={styles.menu}>
        <Text style={styles.menuText}>{item.title}</Text>
      </TouchableOpacity>
    );
  }, []);

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={backToCatalog}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>React Native Calendars</Text>
        <View style={styles.headerActions}>
          <ViewSourceButton demoId="react-native-calendars" iconOnly title="React Native Calendars source" />
          <TouchableOpacity onPress={toggleSettings}><Image source={settingsIcon} style={styles.settingsButton}/></TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView>
      {renderHeader()}
      {showSettings && renderSettings()}
      <FlatList
        data={screens}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
      />
      {renderModal()}
    </SafeAreaView>
  );
};

export default MenuScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 24,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black'
  },
  backButton: {
    width: 30,
    alignItems: 'flex-start'
  },
  backIcon: {
    fontSize: 36,
    lineHeight: 30,
    color: 'black'
  },
  menu: {
    margin: 16,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  menuText: {
    fontSize: 18,
    color: 'black'
  },
  settingsButton: {
    tintColor: 'black'
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsContainer: {
    position: 'absolute',
    top: 38,
    right: 0,
    backgroundColor: 'lightgrey',
    margin: 16,
    padding: 16,
    borderRadius: 4,
    zIndex: 100
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {
    marginRight: 12,
    fontSize: 16
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    paddingTop: 20,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black'
  },
  topBarButton: {
    marginLeft: 16,
    marginRight: 6
  },
  topBarSource: {
    marginLeft: 'auto',
    marginRight: 8,
  }
});
