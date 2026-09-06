import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { memo, useCallback, useState } from 'react';

import { DemoBackButton } from '../../../../../../components/demo-back-button';
import { colors } from '@/theme';

type BackButtonProps = {
  onExit?: () => void;
};

function BackButton({ onExit }: BackButtonProps) {
  const navigation = useNavigation();
  const [prevRouteName, setPrevRouteName] = useState<string | undefined>(() => {
    const routes = navigation.getState()?.routes;
    return routes?.[routes.length - 2]?.name;
  });

  useFocusEffect(
    useCallback(() => {
      const routes = navigation.getState()?.routes;
      setPrevRouteName(routes?.[routes.length - 2]?.name);
    }, [navigation])
  );

  const canGoBack = Boolean(prevRouteName && navigation.canGoBack());

  if (!canGoBack && !onExit) {
    return null;
  }

  return (
    <DemoBackButton
      tintColor={colors.primary}
      onPress={() => {
        if (canGoBack) {
          navigation.goBack();
          return;
        }

        onExit?.();
      }}
    />
  );
}

export default memo(BackButton);
