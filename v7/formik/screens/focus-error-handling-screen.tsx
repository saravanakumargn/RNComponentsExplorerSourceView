import { Formik, type FormikErrors, type FormikProps } from 'formik';
import { useRef } from 'react';
import { Button, Card, List, Text } from 'react-native-paper';

import { ScreenLayout } from '@/components/screen-layout';

import { FormikField } from '../components/formik-field';

type FocusFormValues = {
  city: string;
  fullName: string;
  postalCode: string;
};

const FIELD_ORDER: Array<keyof FocusFormValues> = ['fullName', 'city', 'postalCode'];
const FIELD_LABELS: Record<keyof FocusFormValues, string> = {
  city: 'City',
  fullName: 'Full name',
  postalCode: 'Postal code',
};

function validate(values: FocusFormValues) {
  const errors: FormikErrors<FocusFormValues> = {};
  if (!values.fullName.trim()) errors.fullName = 'Required';
  if (!values.city.trim()) errors.city = 'Required';
  if (!values.postalCode.trim()) errors.postalCode = 'Required';
  else if (values.postalCode.length < 4) errors.postalCode = 'At least 4 digits';
  return errors;
}

export function FocusErrorHandlingScreen() {
  const fieldRefs = useRef<Partial<Record<keyof FocusFormValues, { focus?: () => void } | null>>>({});

  async function submitAndFocusFirstError(formik: FormikProps<FocusFormValues>) {
    const errors = await formik.validateForm();
    formik.setTouched({ city: true, fullName: true, postalCode: true });

    // Formik has no setFocus() of its own — focus the first invalid ref in field order.
    const firstInvalid = FIELD_ORDER.find((name) => errors[name]);
    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus?.();
      return;
    }

    await formik.submitForm();
  }

  return (
    <ScreenLayout testID="maestro-library-formik-focus-error-handling-ready">
      <Text variant="bodyMedium">
        Submit this form empty: the first invalid field is focused manually via a ref, and every current
        error is also listed below.
      </Text>

      <Formik<FocusFormValues>
        initialValues={{ city: '', fullName: '', postalCode: '' }}
        validate={validate}
        onSubmit={() => {}}
      >
        {(formik) => (
          <>
            <FormikField
              ref={(instance) => {
                fieldRefs.current.fullName = instance;
              }}
              name="fullName"
              label={FIELD_LABELS.fullName}
            />
            <FormikField
              ref={(instance) => {
                fieldRefs.current.city = instance;
              }}
              name="city"
              label={FIELD_LABELS.city}
            />
            <FormikField
              ref={(instance) => {
                fieldRefs.current.postalCode = instance;
              }}
              name="postalCode"
              label={FIELD_LABELS.postalCode}
              keyboardType="number-pad"
            />

            <Card mode="outlined">
              <Card.Content style={{ gap: 4 }}>
                <Text variant="titleMedium">Field state</Text>
                {FIELD_ORDER.map((name) => (
                  <Text key={name}>
                    {FIELD_LABELS[name]}: {formik.touched[name] ? 'touched' : 'untouched'}
                    {formik.errors[name] ? ' · invalid' : ''}
                  </Text>
                ))}
              </Card.Content>
            </Card>

            {Object.keys(formik.errors).length > 0 ? (
              <Card mode="outlined">
                <Card.Content>
                  <Text variant="titleMedium">Errors</Text>
                  {FIELD_ORDER.filter((name) => formik.errors[name]).map((name) => (
                    <List.Item key={name} title={FIELD_LABELS[name]} description={formik.errors[name]} />
                  ))}
                </Card.Content>
              </Card>
            ) : null}

            <Button mode="contained" onPress={() => void submitAndFocusFirstError(formik)}>
              Submit
            </Button>
          </>
        )}
      </Formik>
    </ScreenLayout>
  );
}
