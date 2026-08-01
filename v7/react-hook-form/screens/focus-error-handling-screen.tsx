import { useForm } from 'react-hook-form';
import { Button, Card, List, Text } from 'react-native-paper';

import { ScreenLayout } from '@/components/screen-layout';

import { FormField } from '../components/form-field';

type FocusFormValues = {
  city: string;
  fullName: string;
  postalCode: string;
};

const FIELD_LABELS: Record<keyof FocusFormValues, string> = {
  city: 'City',
  fullName: 'Full name',
  postalCode: 'Postal code',
};

export function FocusErrorHandlingScreen() {
  const {
    control,
    formState: { errors, touchedFields },
    handleSubmit,
    setFocus,
  } = useForm<FocusFormValues>({
    defaultValues: { city: '', fullName: '', postalCode: '' },
  });

  const onSubmit = handleSubmit(
    () => {
      // Valid — nothing to focus.
    },
    (invalidFields) => {
      // Auto-focus the first invalid field, in field order, on a failed submit.
      const firstInvalid = (Object.keys(FIELD_LABELS) as Array<keyof FocusFormValues>).find(
        (name) => invalidFields[name]
      );
      if (firstInvalid) setFocus(firstInvalid);
    }
  );

  const errorEntries = (Object.keys(FIELD_LABELS) as Array<keyof FocusFormValues>)
    .filter((name) => errors[name])
    .map((name) => ({ label: FIELD_LABELS[name], message: errors[name]?.message }));

  return (
    <ScreenLayout testID="maestro-library-react-hook-form-focus-error-handling-ready">
      <Text variant="bodyMedium">
        Submit this form empty: setFocus() jumps the keyboard to the first invalid field, and every current
        error is also listed below.
      </Text>

      <FormField control={control} name="fullName" label={FIELD_LABELS.fullName} rules={{ required: 'Required' }} />
      <FormField control={control} name="city" label={FIELD_LABELS.city} rules={{ required: 'Required' }} />
      <FormField
        control={control}
        name="postalCode"
        label={FIELD_LABELS.postalCode}
        keyboardType="number-pad"
        rules={{ required: 'Required', minLength: { value: 4, message: 'At least 4 digits' } }}
      />

      <Card mode="outlined">
        <Card.Content style={{ gap: 4 }}>
          <Text variant="titleMedium">Field state</Text>
          {(Object.keys(FIELD_LABELS) as Array<keyof FocusFormValues>).map((name) => (
            <Text key={name}>
              {FIELD_LABELS[name]}: {touchedFields[name] ? 'touched' : 'untouched'}
              {errors[name] ? ' · invalid' : ''}
            </Text>
          ))}
        </Card.Content>
      </Card>

      {errorEntries.length > 0 ? (
        <Card mode="outlined">
          <Card.Content>
            <Text variant="titleMedium">Errors</Text>
            {errorEntries.map((entry) => (
              <List.Item key={entry.label} title={entry.label} description={entry.message} />
            ))}
          </Card.Content>
        </Card>
      ) : null}

      <Button mode="contained" onPress={() => void onSubmit()}>
        Submit
      </Button>
    </ScreenLayout>
  );
}
