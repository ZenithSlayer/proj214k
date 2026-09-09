import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { Colors } from "../constants/theme";

const THEME_STORAGE_KEY = "app-theme-mode";
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme() === "dark" ? "dark" : "light";
  const [mode, setMode] = useState("system");

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((storedMode) => {
      if (storedMode === "light" || storedMode === "dark" || storedMode === "system") {
        setMode(storedMode);
      }
    });
  }, []);

  const scheme = mode === "system" ? systemScheme : mode;
  const theme = Colors[scheme];

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = scheme;
    }
  }, [scheme]);

  const value = useMemo(() => ({
    mode,
    scheme,
    theme,
    isDark: scheme === "dark",
    setMode: async (nextMode) => {
      setMode(nextMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
    },
    toggleTheme: async () => {
      const nextMode = scheme === "dark" ? "light" : "dark";
      setMode(nextMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
    },
  }), [mode, scheme, theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useAppTheme must be used inside ThemeProvider");
  return context;
}