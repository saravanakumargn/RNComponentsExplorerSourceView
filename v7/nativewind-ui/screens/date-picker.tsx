import { useState } from 'react';

import { DatePicker, Text } from '../components';
import { DemoScreen, Example } from './demo-layout';

export default function DatePickerScreen() {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  return (
    <DemoScreen>
      <Example title="Date" description="Wraps the community date/time picker.">
        <DatePicker
          value={date}
          mode="date"
          onChange={(_, selected) => selected && setDate(selected)}
        />
        <Text variant="footnote" color="tertiary">
          {date.toDateString()}
        </Text>
      </Example>

      <Example title="Time">
        <DatePicker
          value={time}
          mode="time"
          onChange={(_, selected) => selected && setTime(selected)}
        />
        <Text variant="footnote" color="tertiary">
          {time.toLocaleTimeString()}
        </Text>
      </Example>
    </DemoScreen>
  );
}
