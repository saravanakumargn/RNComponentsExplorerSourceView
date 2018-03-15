import React, {Component} from 'react';

import {CalendarList} from 'react-native-calendars';

export default class CalendarsList extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.header} - ${navigation.state.params.title}`,
  });

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <CalendarList current={'2012-05-16'} pastScrollRange={24} futureScrollRange={24} />
    );
  }
}
