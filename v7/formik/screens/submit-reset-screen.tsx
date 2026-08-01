import { Formik } from 'formik';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Switch, Text } from 'react-native-paper';

import { ScreenLayout } from '@/components/screen-layout';

import { FormikField } from '../components/formik-field';

type SubmitResetValues = {
  title: string;
};

function fakeSubmit(shouldFail: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error('The server rejected this submission.'));
      else resolve();
    }, 900);
  });
}

export function SubmitResetScreen() {
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<'success' | null>(null);

  return (
    <ScreenLayout testID="maestro-library-formik-submit-reset-ready">
      <Text variant="bodyMedium">
        onSubmit here is async, so isSubmitting reflects real network-like latency. resetForm() restores
        initialValues and clears touched/error state in one call.
      </Text>

      <Formik<SubmitResetValues>
        initialValues={{ title: '' }}
        validate={(values) => (values.title.trim() ? {} : { title: 'Title is required' })}
        onSubmit={async (_values, { setSubmitting }) => {
          setSubmitError(null);
          setLastResult(null);
          try {
            await fakeSubmit(simulateFailure);
            setLastResult('success');
          } catch (error) {
            setSubmitError((error as Error).message);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ dirty, handleSubmit, isSubmitting, resetForm, submitCount }) => (
          <>
            <FormikField name="title" label="Post title" />

            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
              <Switch value={simulateFailure} onValueChange={setSimulateFailure} />
              <Text>Simulate a failed submission</Text>
            </View>

            <Button mode="contained" loading={isSubmitting} disabled={isSubmitting} onPress={() => handleSubmit()}>
              {isSubmitting ? 'Submitting…' : 'Submit'}
            </Button>
            <Button
              mode="text"
              disabled={!dirty && submitCount === 0}
              onPress={() => {
                resetForm();
                setSubmitError(null);
                setLastResult(null);
              }}
            >
              Reset
            </Button>

            <Card mode="outlined">
              <Card.Content style={{ gap: 4 }}>
                <Text variant="titleMedium">Form state</Text>
                <Text>dirty: {String(dirty)}</Text>
                <Text>isSubmitting: {String(isSubmitting)}</Text>
                <Text>submitCount: {submitCount}</Text>
              </Card.Content>
            </Card>

            {submitError ? <Text style={{ color: 'red' }}>{submitError}</Text> : null}
            {lastResult === 'success' ? <Text style={{ color: 'green' }}>Submitted successfully.</Text> : null}
          </>
        )}
      </Formik>
    </ScreenLayout>
  );
}
