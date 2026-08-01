import { Controller, useForm, useWatch } from 'react-hook-form';
import { Card, Switch, Text } from 'react-native-paper';
import { View } from 'react-native';

import { ScreenLayout } from '@/components/screen-layout';

import { FormField } from '../components/form-field';

type WatchFormValues = {
  hasPromoCode: boolean;
  itemPrice: string;
  promoCode: string;
  quantity: string;
};

function LiveSummary({ control }: { control: ReturnType<typeof useForm<WatchFormValues>>['control'] }) {
  // useWatch re-renders only this subtree on every keystroke, not the whole form.
  const values = useWatch({ control });
  const price = Number(values.itemPrice) || 0;
  const quantity = Number(values.quantity) || 0;
  const hasDiscount = Boolean(values.hasPromoCode && values.promoCode?.trim());
  const subtotal = price * quantity;
  const total = hasDiscount ? subtotal * 0.9 : subtotal;

  return (
    <Card mode="outlined">
      <Card.Content style={{ gap: 4 }}>
        <Text variant="titleMedium">Live summary</Text>
        <Text>Subtotal: ${subtotal.toFixed(2)}</Text>
        <Text>Discount: {hasDiscount ? '10% (promo code applied)' : 'none'}</Text>
        <Text variant="titleMedium">Total: ${total.toFixed(2)}</Text>
      </Card.Content>
    </Card>
  );
}

export function WatchDependentFieldsScreen() {
  const { control } = useForm<WatchFormValues>({
    defaultValues: { hasPromoCode: false, itemPrice: '10', promoCode: '', quantity: '1' },
  });
  const hasPromoCode = useWatch({ control, name: 'hasPromoCode' });

  return (
    <ScreenLayout testID="maestro-library-react-hook-form-watch-dependent-fields-ready">
      <Text variant="bodyMedium">
        watch() drives two things here: a field that only appears when a toggle is on, and a live summary
        that recomputes on every keystroke without needing a submit.
      </Text>

      <FormField control={control} name="itemPrice" label="Item price" keyboardType="decimal-pad" />
      <FormField control={control} name="quantity" label="Quantity" keyboardType="number-pad" />

      <Controller
        control={control}
        name="hasPromoCode"
        render={({ field: { onChange, value } }) => (
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
            <Switch value={value} onValueChange={onChange} />
            <Text>I have a promo code</Text>
          </View>
        )}
      />

      {hasPromoCode ? <FormField control={control} name="promoCode" label="Promo code" autoCapitalize="characters" /> : null}

      <LiveSummary control={control} />
    </ScreenLayout>
  );
}
