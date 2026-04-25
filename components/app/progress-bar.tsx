import { Radius } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { StyleSheet, View } from 'react-native';

interface ProgressBarProps {
  value: number;
}

export function ProgressBar({ value }: ProgressBarProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: colors.accent,
            width: `${Math.min(100, Math.max(0, value))}%`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: Radius.pill,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: Radius.pill,
    height: '100%',
  },
});
