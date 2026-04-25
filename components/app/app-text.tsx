import { Fonts } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

type Variant = 'display' | 'title' | 'headline' | 'body' | 'caption' | 'eyebrow' | 'button';

const variantStyles: Record<Variant, TextStyle> = {
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  headline: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  button: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
};

type AppTextProps = TextProps & {
  variant?: Variant;
  tone?: 'default' | 'muted' | 'soft' | 'accent' | 'inverse' | 'success' | 'danger';
};

export function AppText({
  style,
  variant = 'body',
  tone = 'default',
  ...rest
}: AppTextProps) {
  const { colors } = useAppTheme();

  const color =
    tone === 'muted'
      ? colors.textMuted
      : tone === 'soft'
        ? colors.textSoft
        : tone === 'accent'
          ? colors.accent
          : tone === 'inverse'
            ? '#FFFFFF'
            : tone === 'success'
              ? colors.success
              : tone === 'danger'
                ? colors.danger
                : colors.text;

  return (
    <Text
      {...rest}
      style={[
        styles.base,
        { color },
        variantStyles[variant],
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: Fonts.sans,
  },
});
