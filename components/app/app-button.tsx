import { Radius, makeShadow } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { AppText } from '@/components/app/app-text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface AppButtonProps extends PropsWithChildren {
  onPress?: () => void;
  disabled?: boolean;
  variant?: Variant;
  accessibilityLabel: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AppButton({
  children,
  onPress,
  disabled,
  variant = 'primary',
  accessibilityLabel,
}: AppButtonProps) {
  const { colors } = useAppTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const gradientColors =
    variant === 'primary'
      ? [colors.accent, colors.accentAlt]
      : variant === 'danger'
        ? [colors.danger, '#F08A7C']
        : [colors.surface, colors.surfaceRaised];

  const borderColor = variant === 'ghost' ? colors.borderStrong : 'transparent';

  return (
    <AnimatedPressable
      accessible
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 12, stiffness: 220 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 220 });
      }}
      style={[animatedStyle, styles.wrapper, disabled && styles.disabled]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.button,
          {
            borderColor,
            backgroundColor: variant === 'ghost' ? 'transparent' : colors.surface,
          },
          makeShadow(colors.shadow, variant === 'ghost' ? 0 : 10),
        ]}
      >
        <View style={styles.inner}>
          <AppText
            variant="button"
            tone={variant === 'primary' || variant === 'danger' ? 'inverse' : 'default'}
          >
            {children}
          </AppText>
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.lg,
  },
  button: {
    minHeight: 56,
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 18,
  },
  disabled: {
    opacity: 0.56,
  },
});
