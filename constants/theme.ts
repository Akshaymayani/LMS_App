import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#132238',
    background: '#F4EFE3',
    tint: '#0B8DFF',
    icon: '#5F6C80',
    tabIconDefault: '#7A8698',
    tabIconSelected: '#0B8DFF',
    accent: '#0B8DFF',
    accentAlt: '#FF7A45',
    accentSoft: '#DCEEFF',
    backgroundMuted: '#EDE5D6',
    backgroundCanvas: '#FFF9EE',
    surface: '#FFFFFF',
    surfaceRaised: '#FFF6DC',
    surfaceMuted: '#F6F2EA',
    textMuted: '#607089',
    textSoft: '#7D8CA3',
    border: '#D8D1C4',
    borderStrong: '#BBC4D4',
    success: '#1EAE74',
    warning: '#E5A227',
    danger: '#E14F57',
    shadow: 'rgba(19, 34, 56, 0.18)',
    glow: 'rgba(11, 141, 255, 0.22)',
    glass: 'rgba(255, 255, 255, 0.72)',
    input: '#F6F1E6',
    snackbar: '#17314E',
    snackbarText: '#F9FBFF',
    heroGradient: ['#0C86F7', '#44C5F2', '#F8C46A'],
    cardGradient: ['#FFFFFF', '#FFF1C6'],
  },
  dark: {
    text: '#F6F4EF',
    background: '#07111D',
    tint: '#49B1FF',
    icon: '#9AA8B8',
    tabIconDefault: '#7E8A9A',
    tabIconSelected: '#49B1FF',
    accent: '#49B1FF',
    accentAlt: '#FF9A62',
    accentSoft: '#15314B',
    backgroundMuted: '#0E1B2C',
    backgroundCanvas: '#0B1625',
    surface: '#102033',
    surfaceRaised: '#17314C',
    surfaceMuted: '#13263A',
    textMuted: '#B3C0D0',
    textSoft: '#8DA0B6',
    border: '#20364E',
    borderStrong: '#32516F',
    success: '#35D097',
    warning: '#F6B65D',
    danger: '#FF7B80',
    shadow: 'rgba(0, 0, 0, 0.42)',
    glow: 'rgba(73, 177, 255, 0.24)',
    glass: 'rgba(16, 32, 51, 0.82)',
    input: '#14263A',
    snackbar: '#f01717',
    snackbarText: '#07111D',
    heroGradient: ['#102B48', '#175B8A', '#F28B4B'],
    cardGradient: ['#17304A', '#0E2032'],
  },
} as const;

export type AppColorScheme = keyof typeof Colors;

export const Radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const Spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'Avenir Next',
    serif: 'Georgia',
    rounded: 'Avenir Next',
    mono: 'Menlo',
  },
  android: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif-medium',
    mono: 'monospace',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  web: {
    sans: '"Avenir Next", "Segoe UI", sans-serif',
    serif: 'Georgia, serif',
    rounded: '"Trebuchet MS", "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", Consolas, monospace',
  },
});

export function buildNavigationTheme(scheme: AppColorScheme): Theme {
  const palette = Colors[scheme];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.tint,
      background: palette.background,
      card: palette.surface,
      text: palette.text,
      border: palette.border,
      notification: palette.accentAlt,
    },
  };
}

export function makeShadow(color: string, elevation: number) {
  return {
    shadowColor: color,
    shadowOpacity: 0.2,
    shadowRadius: elevation * 1.4,
    shadowOffset: { width: 0, height: elevation },
    elevation,
  };
}
