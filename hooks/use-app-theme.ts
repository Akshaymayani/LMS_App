import { buildNavigationTheme, Colors, type AppColorScheme } from '@/constants/theme';
import { useAppSelector } from '@/store/hooks';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export function useAppTheme() {
  const systemScheme = useSystemColorScheme();
  const preference = useAppSelector((state) => state.preferences.themePreference);

  const scheme: AppColorScheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  return {
    preference,
    scheme,
    colors: Colors[scheme],
    navigationTheme: buildNavigationTheme(scheme),
  };
}
