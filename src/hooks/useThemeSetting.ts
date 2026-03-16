import { useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import { getTheme, setTheme } from '../db/sqlite';
import { ThemeSetting } from '../types/models';

export const useThemeSetting = () => {
  const system = useColorScheme() ?? 'light';
  const [theme, setLocalTheme] = useState<ThemeSetting>('system');

  useEffect(() => {
    getTheme().then(setLocalTheme);
  }, []);

  const changeTheme = async (next: ThemeSetting) => {
    setLocalTheme(next);
    await setTheme(next);
  };

  const resolvedTheme = theme === 'system' ? system : theme;

  return { theme, resolvedTheme, changeTheme };
};
