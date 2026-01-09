import { createContext, useState, ReactNode } from "react";

// Define all allowed theme values - Now 10 themes
export type ThemeType =
  | "light"
  | "dark"
  | "forest"
  | "ocean"
  | "sunset"
  | "lavender"
  | "mint"
  | "coral"
  | "midnight"
  | "golden";

// Theme colors mapping for background, buttons, and text
export const themeStyles: Record<
  ThemeType,
  { background: string; button: string; text: string }
> = {
  light: { background: "#ffffff", button: "#1976D2", text: "#000000" },
  dark: { background: "#121212", button: "#BB86FC", text: "#ffffff" },
  forest: { background: "#2E7D32", button: "#4CAF50", text: "#ffffff" },
  ocean: { background: "#0288D1", button: "#03A9F4", text: "#ffffff" },
  sunset: { background: "#FF7043", button: "#FF5722", text: "#ffffff" },
  lavender: { background: "#B39DDB", button: "#9575CD", text: "#ffffff" },
  mint: { background: "#4DB6AC", button: "#26A69A", text: "#ffffff" },
  // New themes with better contrast considerations
  coral: { background: "#FF6B6B", button: "#FF5252", text: "#ffffff" },
  midnight: { background: "#2C3E50", button: "#34495E", text: "#ffffff" },
  golden: { background: "#F39C12", button: "#E67E22", text: "#000000" },
};

// Context props
export interface ThemeContextProps {
  theme: ThemeType;
  setThemeGlobal: (theme: ThemeType) => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  setThemeGlobal: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>("light");

  const setThemeGlobal = (newTheme: ThemeType) => {
    setTheme(newTheme);
    // Optional: persist theme
    // AsyncStorage.setItem("appTheme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setThemeGlobal }}>
      {children}
    </ThemeContext.Provider>
  );
};