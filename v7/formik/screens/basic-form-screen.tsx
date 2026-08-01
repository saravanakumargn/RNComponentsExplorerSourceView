import { Formik } from 'formik';
import { useState } from 'react';
import { Button, Card, Text } from 'react-native-paper';

import { ScreenLayout } from '@/components/screen-layout';

import { FormikField } from '../components/formik-field';

type BasicFormValues = {
  email: string;
  message: string;
  name: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: BasicFormValues) {
  const errors: Partial<Record<keyof BasicFormValues, string>> = {};
  if (!values.name.trim()) errors.name = 'Name is required';
  if (!values.email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_PATTERN.test(values.email)) errors.email = 'Enter a valid email address';
  return errors;
}

export function BasicFormScreen() {
  const [submitted, setSubmitted] = useState<BasicFormValues | null>(null);

  return (
    <ScreenLayout testID="maestro-library-formik-basic-form-ready">
      <Text variant="bodyMedium">
        Every input reads and writes through <Text style={{ fontWeight: 'bold' }}>useField</Text> — React
        Native inputs don&apos;t emit the DOM events Formik&apos;s handleChange/handleBlur expect.
      </Text>

      <Formik<BasicFormValues>
        initialValues={{ email: '', message: '', name: '' }}
        validate={validate}
        onSubmit={(values) => setSubmitted(values)}
      >
        {({ handleSubmit, isValid, dirty, resetForm }) => (
          <>
            <FormikField name="name" label="Name" />
            <FormikField name="email" label="Email" keyboardType="email-address" autoCapitalize="none" />
            <FormikField name="message" label="Message (optional)" multiline numberOfLines={3} />

            <Button mode="contained" onPress={() => handleSubmit()} disabled={!isValid && dirty}>
              Submit
            </Button>
            <Button
              mode="text"
              onPress={() => {
                resetForm();
                setSubmitted(null);
              }}
            >
              Reset
            </Button>
          </>
        )}
      </Formik>

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
