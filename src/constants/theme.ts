import { createContext, createElement, PropsWithChildren, useContext, useMemo } from 'react';
import { ThemeSetting } from '../types/models';

export const palette = {
  light: {
    bg: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    muted: '#475569',
    border: '#E2E8F0',
    primary: '#2563EB',
    accent: '#14B8A6',
    onPrimary: '#FFFFFF',
    link: '#1D4ED8',
  },
  dark: {
    bg: '#020617',
    card: '#0F172A',
    text: '#E2E8F0',
    muted: '#94A3B8',
    border: '#1E293B',
    primary: '#60A5FA',
    accent: '#2DD4BF',
    onPrimary: '#0F172A',
    link: '#93C5FD',
  },
} as const;

type ResolvedTheme = keyof typeof palette;
type ThemePalette = (typeof palette)[ResolvedTheme];

type ThemeContextValue = {
  theme: ThemeSetting;
  resolvedTheme: ResolvedTheme;
  colors: ThemePalette;
  changeTheme: (next: ThemeSetting) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({
  children,
  theme,
  resolvedTheme,
  changeTheme,
}: PropsWithChildren<{
  theme: ThemeSetting;
  resolvedTheme: ResolvedTheme;
  changeTheme: (next: ThemeSetting) => Promise<void>;
}>) => {
  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      colors: palette[resolvedTheme],
      changeTheme,
    }),
    [theme, resolvedTheme, changeTheme],
  );

  return createElement(ThemeContext.Provider, { value }, children);
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
