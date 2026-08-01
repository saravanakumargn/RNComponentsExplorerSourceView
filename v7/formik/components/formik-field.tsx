import { useField } from 'formik';
import { forwardRef } from 'react';
import { View } from 'react-native';
import { HelperText, TextInput, type TextInputProps } from 'react-native-paper';

/** react-native-paper's TextInput ref is a compound type that varies by mode;
 * `any` keeps this wrapper's ref forwarding usable without fighting that. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PaperTextInputRef = any;

type FormikFieldProps = Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur'> & {
  name: string;
};

/**
 * A useField-wrapped react-native-paper TextInput. Formik's `handleChange`/
 * `handleBlur` expect DOM synthetic events, which React Native inputs don't
 * produce, so this reads/writes the field via `useField`'s helpers instead.
 * Forwards its ref to the underlying TextInput so screens can call `.focus()`
 * — Formik has no `setFocus` equivalent of its own.
 */
export const FormikField = forwardRef<PaperTextInputRef, FormikFieldProps>(function FormikField(
  { name, ...textInputProps },
  ref
) {
  const [field, meta, helpers] = useField(name);
  const showError = meta.touched && Boolean(meta.error);

  return (
    <View style={{ gap: 2 }}>
      <TextInput
        ref={ref}
        mode="outlined"
        value={field.value ?? ''}
        onChangeText={(text) => helpers.setValue(text)}
        onBlur={() => helpers.setTouched(true)}
        error={showError}
        {...textInputProps}
      />
      <HelperText type={showError ? 'error' : 'info'} visible={showError || meta.touched}>
        {meta.error ?? ' '}
      </HelperText>
    </View>
  );
});
