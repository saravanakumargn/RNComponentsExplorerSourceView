import { Formik } from 'formik';
import { useState } from 'react';
import { Button, Card, Text } from 'react-native-paper';

import { ScreenLayout } from '@/components/screen-layout';

import { FormikField } from '../components/formik-field';

type ValidationRulesValues = {
  age: string;
  confirmPassword: string;
  password: string;
  username: string;
  website: string;
};

const URL_PATTERN = /^https?:\/\/.+\..+/;

function validate(values: ValidationRulesValues) {
  const errors: Partial<Record<keyof ValidationRulesValues, string>> = {};

  if (!values.username.trim()) errors.username = 'Username is required';
  else if (values.username.length < 3) errors.username = 'At least 3 characters';
  else if (values.username.length > 20) errors.username = 'At most 20 characters';

  const age = Number(values.age);
  if (!values.age.trim()) errors.age = 'Age is required';
  else if (Number.isNaN(age)) errors.age = 'Must be a number';
  else if (age < 18) errors.age = 'Must be at least 18';
  else if (age > 120) errors.age = 'Must be 120 or under';

  if (values.website && !URL_PATTERN.test(values.website)) errors.website = 'Must be a valid http(s) URL';

  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length < 6) errors.password = 'At least 6 characters';

  if (!values.confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match';

  return errors;
}

export function ValidationRulesScreen() {
  const [submitted, setSubmitted] = useState<ValidationRulesValues | null>(null);

  return (
    <ScreenLayout testID="maestro-library-formik-validation-rules-ready">
      <Text variant="bodyMedium">
        Every field below is validated by a different check inside one `validate` function — no schema
        library needed.
      </Text>

      <Formik<ValidationRulesValues>
        initialValues={{ age: '', confirmPassword: '', password: '', username: '', website: '' }}
        validate={validate}
        onSubmit={(values) => setSubmitted(values)}
      >
        {({ handleSubmit, isValid, dirty }) => (
          <>
            <FormikField name="username" label="Username (3-20 chars)" />
            <FormikField name="age" label="Age (18-120)" keyboardType="number-pad" />
            <FormikField name="website" label="Website" autoCapitalize="none" keyboardType="url" />
            <FormikField name="password" label="Password" secureTextEntry />
            <FormikField name="confirmPassword" label="Confirm password" secureTextEntry />

            <Button mode="contained" onPress={() => handleSubmit()} disabled={!isValid && dirty}>
              Submit
            </Button>
          </>
        )}
      </Formik>

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
