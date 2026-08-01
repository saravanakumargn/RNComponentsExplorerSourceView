import { Formik } from 'formik';
import { View } from 'react-native';
import { Card, Switch, Text } from 'react-native-paper';

import { ScreenLayout } from '@/components/screen-layout';

import { FormikField } from '../components/formik-field';

type DependentFieldsValues = {
  hasPromoCode: boolean;
  itemPrice: string;
  promoCode: string;
  quantity: string;
};

export function DependentFieldsScreen() {
  return (
    <ScreenLayout testID="maestro-library-formik-dependent-fields-ready">
      <Text variant="bodyMedium">
        Formik has no separate watch() step — its context re-renders the whole form on every keystroke, so
        `values` is always current. That drives both the conditional field below and the live summary.
      </Text>

      <Formik<DependentFieldsValues>
        initialValues={{ hasPromoCode: false, itemPrice: '10', promoCode: '', quantity: '1' }}
        onSubmit={() => {}}
      >
        {({ setFieldValue, values }) => {
          const price = Number(values.itemPrice) || 0;
          const quantity = Number(values.quantity) || 0;
          const hasDiscount = values.hasPromoCode && values.promoCode.trim().length > 0;
          const subtotal = price * quantity;
          const total = hasDiscount ? subtotal * 0.9 : subtotal;

          return (
            <>
              <FormikField name="itemPrice" label="Item price" keyboardType="decimal-pad" />
              <FormikField name="quantity" label="Quantity" keyboardType="number-pad" />

              <View style={{ alignItems: 'center', flexDirection: 'row', gap: 12 }}>
                <Switch
                  value={values.hasPromoCode}
                  onValueChange={(next) => void setFieldValue('hasPromoCode', next)}
                />
                <Text>I have a promo code</Text>
              </View>

              {values.hasPromoCode ? (
                <FormikField name="promoCode" label="Promo code" autoCapitalize="characters" />
              ) : null}

              <Card mode="outlined">
                <Card.Content style={{ gap: 4 }}>
                  <Text variant="titleMedium">Live summary</Text>
                  <Text>Subtotal: ${subtotal.toFixed(2)}</Text>
                  <Text>Discount: {hasDiscount ? '10% (promo code applied)' : 'none'}</Text>
                  <Text variant="titleMedium">Total: ${total.toFixed(2)}</Text>
                </Card.Content>
              </Card>
            </>
          );
        }}
      </Formik>
    </ScreenLayout>
  );
}
