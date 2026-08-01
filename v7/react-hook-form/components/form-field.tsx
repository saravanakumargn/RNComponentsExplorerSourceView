import { Controller, type Control, type FieldValues, type Path, type RegisterOptions } from 'react-hook-form';
import { View } from 'react-native';
import { HelperText, TextInput, type TextInputProps } from 'react-native-paper';

type FormFieldProps<TFormValues extends FieldValues> = Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur'> & {
  control: Control<TFormValues>;
  name: Path<TFormValues>;
  rules?: RegisterOptions<TFormValues, Path<TFormValues>>;
};

/** A Controller-wrapped react-native-paper TextInput with inline error text. */
export function FormField<TFormValues extends FieldValues>({
  control,
  name,
  rules,
  ...textInputProps
}: FormFieldProps<TFormValues>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onBlur, onChange, value, ref }, fieldState: { error, isTouched } }) => (
        <View style={{ gap: 2 }}>
          <TextInput
            ref={ref}
            mode="outlined"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value ?? ''}
            error={Boolean(error)}
            {...textInputProps}
          />
          <HelperText type={error ? 'error' : 'info'} visible={Boolean(error) || isTouched}>
            {error?.message ?? ' '}
          </HelperText>
        </View>
      )}
    />
  );
}
