import { makeShadow, Radius } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/app/app-text';

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function AppInput({ label, error, style, ...rest }: AppInputProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <AppText variant="caption" tone="muted" style={styles.label}>
        {label}
      </AppText>
      <View
        style={[
          styles.inputShell,
          {
            backgroundColor: colors.input,
            borderColor: error ? colors.danger : colors.border,
          },
          makeShadow(colors.shadow, 6),
        ]}
      >
        <TextInput
          accessible
          accessibilityLabel={label}
          placeholderTextColor={colors.textSoft}
          style={[styles.input, { color: colors.text }, style]}
          {...rest}
        />
      </View>
      {error ? (
        <AppText variant="caption" tone="danger" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    marginLeft: 4,
  },
  inputShell: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
  },
  input: {
    minHeight: 54,
    fontSize: 15,
    fontWeight: '500',
  },
  error: {
    marginLeft: 4,
  },
});
