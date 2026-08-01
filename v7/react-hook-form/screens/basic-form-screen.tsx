import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Card, Text } from 'react-native-paper';

import { ScreenLayout } from '@/components/screen-layout';

import { FormField } from '../components/form-field';

type BasicFormValues = {
  email: string;
  message: string;
  name: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BasicFormScreen() {
  const {
    control,
    formState: { isValid },
    handleSubmit,
    reset,
  } = useForm<BasicFormValues>({
    defaultValues: { email: '', message: '', name: '' },
    mode: 'onTouched',
  });
  const [submitted, setSubmitted] = useState<BasicFormValues | null>(null);

  const onSubmit = handleSubmit((values) => {
    setSubmitted(values);
  });

  return (
    <ScreenLayout testID="maestro-library-react-hook-form-basic-form-ready">
      <Text variant="bodyMedium">
        Every input is wrapped in a <Text style={{ fontWeight: 'bold' }}>Controller</Text> — React Native
        inputs don&apos;t expose the ref API react-hook-form&apos;s uncontrolled `register` relies on.
      </Text>

      <FormField
        control={control}
        name="name"
        label="Name"
        rules={{ required: 'Name is required' }}
      />
      <FormField
        control={control}
        name="email"
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        rules={{
          required: 'Email is required',
          pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address' },
        }}
      />
      <FormField
        control={control}
        name="message"
        label="Message (optional)"
        multiline
        numberOfLines={3}
      />

      <Button mode="contained" onPress={() => void onSubmit()} disabled={!isValid}>
        Submit
      </Button>
      <Button
        mode="text"
        onPress={() => {
          reset();
          setSubmitted(null);
        }}
      >
        Reset
      </Button>

      {submitted ? (
        <Card mode="outlined">
          <Card.Content style={{ gap: 4 }}>
            <Text variant="titleMedium">Submitted values</Text>
            <Text selectable variant="bodySmall">
              {JSON.stringify(submitted, null, 2)}
            </Text>
          </Card.Content>
        </Card>
      ) : null}
    </ScreenLayout>
  );
}
