import { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Theme colors mapping for background, buttons, text, card, and border
export const themeStyles: Record<
  ThemeType,
  { background: string; button: string; text: string; card: string; border: string }
> = {
  light: { 
    background: "#ffffff", 
    button: "#1976D2", 
    text: "#000000",
    card: "#f5f5f5",
    border: "#dddddd"
  },
  dark: { 
    background: "#121212", 
    button: "#BB86FC", 
    text: "#ffffff",
    card: "#2c2c2c",
    border: "#444444"
  },
  forest: { 
    background: "#2E7D32", 
    button: "#4CAF50", 
    text: "#ffffff",
    card: "#1B5E20",
    border: "#81C784"
  },
  ocean: { 
    background: "#0288D1", 
    button: "#03A9F4", 
    text: "#ffffff",
    card: "#01579B",
    border: "#80DEEA"
  },
  sunset: { 
    background: "#FF7043", 
    button: "#FF5722", 
    text: "#ffffff",
    card: "#F4511E",
    border: "#FFAB91"
  },
  lavender: { 
    background: "#B39DDB", 
    button: "#9575CD", 
    text: "#ffffff",
    card: "#7E57C2",
    border: "#D1C4E9"
  },
  mint: { 
    background: "#4DB6AC", 
    button: "#26A69A", 
    text: "#ffffff",
    card: "#00897B",
    border: "#B2DFDB"
  },
  coral: { 
    background: "#FF6B6B", 
    button: "#FF5252", 
    text: "#ffffff",
    card: "#E53935",
    border: "#FFCDD2"
  },
  midnight: { 
    background: "#2C3E50", 
    button: "#34495E", 
    text: "#ffffff",
    card: "#1a252f",
    border: "#546e7a"
  },
  golden: { 
    background: "#F39C12", 
    button: "#E67E22", 
    text: "#000000",
    card: "#D35400",
    border: "#FDE3A7"
  },
};

// Context props
export interface ThemeContextProps {
  theme: ThemeType;
  setThemeGlobal: (theme: ThemeType) => void;
  isLoading: boolean;
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  setThemeGlobal: () => {},
  isLoading: true,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>("light");
  const [isLoading, setIsLoading] = useState(true);

  // Helper to validate theme type
  const isValidTheme = (value: string): value is ThemeType => {
    return ["light", "dark", "forest", "ocean", "sunset", "lavender", "mint", "coral", "midnight", "golden"].includes(value);
  };

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("appTheme");
        if (savedTheme && isValidTheme(savedTheme)) {
          setTheme(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  const setThemeGlobal = async (newTheme: ThemeType) => {
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem("appTheme", newTheme);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setThemeGlobal, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};