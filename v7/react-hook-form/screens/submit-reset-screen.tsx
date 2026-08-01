import { useForm } from 'react-hook-form';
import { Button, Card, Switch, Text } from 'react-native-paper';
import { View } from 'react-native';
import { useState } from 'react';

import { ScreenLayout } from '@/components/screen-layout';

import { FormField } from '../components/form-field';

type SubmitResetValues = {
  title: string;
};

function fakeSubmit(values: SubmitResetValues, shouldFail: boolean): Promise<void> {
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
  const {
    control,
    formState: { isDirty, isSubmitSuccessful, isSubmitting, submitCount },
    handleSubmit,
    reset,
  } = useForm<SubmitResetValues>({ defaultValues: { title: '' } });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await fakeSubmit(values, simulateFailure);
    } catch (error) {
      setSubmitError((error as Error).message);
      throw error;
    }
  });

  return (
    <ScreenLayout testID="maestro-library-react-hook-form-submit-reset-ready">
      <Text variant="bodyMedium">
        handleSubmit awaits an async submit handler here, so isSubmitting reflects real network-like
        latency. isSubmitSuccessful only flips true after a submit that both validates and resolves.
      </Text>

      <FormField control={control} name="title" label="Post title" rules={{ required: 'Title is required' }} />

      <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
        <Switch value={simulateFailure} onValueChange={setSimulateFailure} />
        <Text>Simulate a failed submission</Text>
      </View>

      <Button mode="contained" loading={isSubmitting} disabled={isSubmitting} onPress={() => void onSubmit()}>
        {isSubmitting ? 'Submitting…' : 'Submit'}
      </Button>
      <Button mode="text" disabled={!isDirty && submitCount === 0} onPress={() => { reset(); setSubmitError(null); }}>
        Reset
      </Button>

      <Card mode="outlined">
        <Card.Content style={{ gap: 4 }}>
          <Text variant="titleMedium">Form state</Text>
          <Text>isDirty: {String(isDirty)}</Text>
          <Text>isSubmitting: {String(isSubmitting)}</Text>
          <Text>submitCount: {submitCount}</Text>
          <Text>isSubmitSuccessful: {String(isSubmitSuccessful)}</Text>
        </Card.Content>
      </Card>

      {submitError ? <Text style={{ color: 'red' }}>{submitError}</Text> : null}
      {isSubmitSuccessful && !submitError ? <Text style={{ color: 'green' }}>Submitted successfully.</Text> : null}
    </ScreenLayout>
  );
}
