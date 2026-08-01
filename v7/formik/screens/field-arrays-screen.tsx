import { FieldArray, Formik } from 'formik';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, IconButton, Text } from 'react-native-paper';

import { ScreenLayout } from '@/components/screen-layout';

import { FormikField } from '../components/formik-field';

type Guest = { name: string };
type FieldArrayValues = { guests: Guest[] };

function validate(values: FieldArrayValues) {
  const errors: { guests?: string } = {};
  if (values.guests.length < 2) errors.guests = 'Add at least 2 guests';
  return errors;
}

export function FieldArraysScreen() {
  const [submitted, setSubmitted] = useState<Guest[] | null>(null);

  return (
    <ScreenLayout testID="maestro-library-formik-field-arrays-ready">
      <Text variant="bodyMedium">
        FieldArray manages a dynamic list of inputs — add, remove, and reorder guests below.
      </Text>

      <Formik<FieldArrayValues>
        initialValues={{ guests: [{ name: '' }, { name: '' }] }}
        validate={validate}
        onSubmit={(values) => setSubmitted(values.guests)}
      >
        {({ errors, handleSubmit, values }) => (
          <FieldArray name="guests">
            {({ move, push, remove }) => (
              <>
                {values.guests.map((_guest, index) => (
                  <Card key={index} mode="outlined">
                    <Card.Content style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 4 }}>
                      <View style={{ flex: 1 }}>
                        <FormikField name={`guests.${index}.name`} label={`Guest ${index + 1}`} />
                      </View>
                      <IconButton
                        icon="arrow-up"
                        disabled={index === 0}
                        accessibilityLabel={`Move guest ${index + 1} up`}
                        onPress={() => move(index, index - 1)}
                      />
                      <IconButton
                        icon="arrow-down"
                        disabled={index === values.guests.length - 1}
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

                {typeof errors.guests === 'string' ? <Text style={{ color: 'red' }}>{errors.guests}</Text> : null}

                <Button mode="outlined" icon="plus" onPress={() => push({ name: '' })}>
                  Add guest
                </Button>
                <Button mode="contained" onPress={() => handleSubmit()}>
                  Submit guest list
                </Button>
              </>
            )}
          </FieldArray>
        )}
      </Formik>

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
