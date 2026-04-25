import { Radius } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setThemePreference } from '@/store/slices/preferencesSlice';
import type { ThemePreference } from '@/types';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app/app-text';

const options: ThemePreference[] = ['system', 'light', 'dark'];

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const selected = useAppSelector((state) => state.preferences.themePreference);
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
      {options.map((option) => {
        const active = option === selected;

        return (
          <Pressable
            key={option}
            accessible
            accessibilityLabel={`Switch theme to ${option}`}
            onPress={() => dispatch(setThemePreference(option))}
            style={[
              styles.option,
              active && {
                backgroundColor: colors.surface,
              },
            ]}
          >
            <AppText variant="caption" tone={active ? 'default' : 'muted'}>
              {option}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: Radius.pill,
    padding: 4,
    gap: 4,
  },
  option: {
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
