/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';

export function useTheme() {
  return (useAppTheme() as unknown as { theme: typeof Colors.light }).theme;
}
