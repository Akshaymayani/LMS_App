import { Radius, makeShadow } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app/app-text';

export function StatCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        makeShadow(colors.shadow, 8),
      ]}
    >
      <View style={[styles.iconShell, { backgroundColor: colors.surfaceRaised }]}>
        <MaterialIcons color={colors.accent} name={icon} size={20} />
      </View>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <AppText variant="headline">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: 10,
    minHeight: 118,
    padding: 16,
  },
  iconShell: {
    alignItems: 'center',
    borderRadius: Radius.md,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
});
