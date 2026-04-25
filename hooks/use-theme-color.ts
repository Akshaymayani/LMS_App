import { useAppTheme } from '@/hooks/use-app-theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof import('@/constants/theme').Colors.light &
    keyof typeof import('@/constants/theme').Colors.dark
) {
  const { colors, scheme } = useAppTheme();
  const colorFromProps = props[scheme];

  return colorFromProps ?? colors[colorName];
}
