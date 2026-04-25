import { Radius } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hideSnackbar } from '@/store/slices/uiSlice';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/app/app-text';

export function NetworkSnackbar() {
  const dispatch = useAppDispatch();
  const snackbar = useAppSelector((state) => state.ui.snackbar);
  const { colors } = useAppTheme();
  const progress = useSharedValue(snackbar.visible ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(snackbar.visible ? 1 : 0, { duration: 220 });
  }, [progress, snackbar.visible]);

  useEffect(() => {
    if (!snackbar.visible || snackbar.persistent) {
      return;
    }

    const timeout = setTimeout(() => {
      dispatch(hideSnackbar());
    }, 2800);

    return () => clearTimeout(timeout);
  }, [dispatch, snackbar.persistent, snackbar.visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 18 }],
  }));

  if (!snackbar.visible) {
    return null;
  }

  const backgroundColor =
    snackbar.tone === 'success'
      ? colors.success
      : snackbar.tone === 'error'
        ? colors.snackbar
        : colors.surfaceRaised;

  const textColor = snackbar.tone === 'success' || snackbar.tone === 'error' ? '#FFFFFF' : colors.text;

  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      exiting={FadeOutDown.duration(220)}
      style={[
        styles.container,
        animatedStyle,
        {
          backgroundColor,
        },
      ]}
    >
      <AppText variant="caption" style={{ color: textColor, textAlign: 'center' }}>
        {snackbar.message}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 24,
    borderRadius: Radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 14,
    zIndex: 80,
  },
});
