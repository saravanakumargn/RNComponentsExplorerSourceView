import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Button, Card, IconButton, Text } from 'react-native-paper';
import { View } from 'react-native';

import { ScreenLayout } from '@/components/screen-layout';

import { FormField } from '../components/form-field';

type Guest = { name: string };
type FieldArrayValues = { guests: Guest[] };

export function FieldArraysScreen() {
  const {
    control,
    formState: { errors, isValid },
    handleSubmit,
  } = useForm<FieldArrayValues>({
    defaultValues: { guests: [{ name: '' }, { name: '' }] },
    mode: 'onTouched',
  });
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'guests',
    rules: { minLength: { value: 2, message: 'Add at least 2 guests' } },
  });
  const [submitted, setSubmitted] = useState<Guest[] | null>(null);

  const onSubmit = handleSubmit((values) => setSubmitted(values.guests));

  return (
    <ScreenLayout testID="maestro-library-react-hook-form-field-arrays-ready">
      <Text variant="bodyMedium">
        useFieldArray manages a dynamic list of inputs — add, remove, and reorder guests below.
      </Text>

      {fields.map((field, index) => (
        <Card key={field.id} mode="outlined">
          <Card.Content style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 4 }}>
            <View style={{ flex: 1 }}>
              <FormField
                control={control}
                name={`guests.${index}.name`}
                label={`Guest ${index + 1}`}
                rules={{ required: 'Name is required' }}
              />
            </View>
            <IconButton
              icon="arrow-up"
              disabled={index === 0}
              accessibilityLabel={`Move guest ${index + 1} up`}
              onPress={() => move(index, index - 1)}
            />
            <IconButton
              icon="arrow-down"
              disabled={index === fields.length - 1}
              accessibilityLabel={`Move guest ${index + 1} down`}
              onPress={() => move(index, index + 1)}
            />
            <IconButton
              icon="delete"
              accessibilityLabel={`Remove guest ${index + 1}`}
              onPress={() => remove(index)}
            />
          </Card.Content>
        </Card>
      ))}

      {typeof errors.guests?.root?.message === 'string' ? (
        <Text style={{ color: 'red' }}>{errors.guests.root.message}</Text>
      ) : null}

      <Button mode="outlined" icon="plus" onPress={() => append({ name: '' })}>
        Add guest
      </Button>
      <Button mode="contained" onPress={() => void onSubmit()} disabled={!isValid}>
        Submit guest list
      </Button>

      {submitted ? (
        <Card mode="outlined">
          <Card.Content style={{ gap: 4 }}>
            <Text variant="titleMedium">Submitted guest list</Text>
            <Text selectable variant="bodySmall">
              {JSON.stringify(submitted, null, 2)}
            </Text>
          </Card.Content>
        </Card>
      ) : null}
    </ScreenLayout>
  );
}
