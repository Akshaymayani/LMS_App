import { useAppTheme } from '@/hooks/use-app-theme';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app/app-text';

export function AppLoader({ label = 'Loading your learning space...' }: { label?: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.accent} size="large" />
      <AppText tone="muted" style={styles.label}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    flex: 1,
  },
  label: {
    textAlign: 'center',
  },
});
