import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Card, Text } from 'react-native-paper';

import { ScreenLayout } from '@/components/screen-layout';

import { FormField } from '../components/form-field';

type ValidationRulesValues = {
  age: string;
  confirmPassword: string;
  password: string;
  username: string;
  website: string;
};

const URL_PATTERN = /^https?:\/\/.+\..+/;

export function ValidationRulesScreen() {
  const {
    control,
    formState: { isValid },
    getValues,
    handleSubmit,
  } = useForm<ValidationRulesValues>({
    defaultValues: { age: '', confirmPassword: '', password: '', username: '', website: '' },
    mode: 'onTouched',
  });
  const [submitted, setSubmitted] = useState<ValidationRulesValues | null>(null);

  const onSubmit = handleSubmit((values) => setSubmitted(values));

  return (
    <ScreenLayout testID="maestro-library-react-hook-form-validation-rules-ready">
      <Text variant="bodyMedium">
        Every field below is validated with a different built-in rule type — no schema resolver needed.
      </Text>

      <FormField
        control={control}
        name="username"
        label="Username (3-20 chars)"
        rules={{
          required: 'Username is required',
          minLength: { value: 3, message: 'At least 3 characters' },
          maxLength: { value: 20, message: 'At most 20 characters' },
        }}
      />
      <FormField
        control={control}
        name="age"
        label="Age (18-120)"
        keyboardType="number-pad"
        rules={{
          required: 'Age is required',
          min: { value: 18, message: 'Must be at least 18' },
          max: { value: 120, message: 'Must be 120 or under' },
          validate: (value) => !Number.isNaN(Number(value)) || 'Must be a number',
        }}
      />
      <FormField
        control={control}
        name="website"
        label="Website"
        autoCapitalize="none"
        keyboardType="url"
        rules={{
          pattern: { value: URL_PATTERN, message: 'Must be a valid http(s) URL' },
        }}
      />
      <FormField
        control={control}
        name="password"
        label="Password"
        secureTextEntry
        rules={{ required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } }}
      />
      <FormField
        control={control}
        name="confirmPassword"
        label="Confirm password"
        secureTextEntry
        rules={{
          required: 'Please confirm your password',
          validate: (value) => value === getValues('password') || 'Passwords do not match',
        }}
      />

      <Button mode="contained" onPress={() => void onSubmit()} disabled={!isValid}>
        Submit
      </Button>

      {submitted ? (
        <Card mode="outlined">
          <Card.Content style={{ gap: 4 }}>
            <Text variant="titleMedium">Valid — submitted values</Text>
            <Text selectable variant="bodySmall">
              {JSON.stringify(submitted, null, 2)}
            </Text>
          </Card.Content>
        </Card>
      ) : null}
    </ScreenLayout>
  );
}
