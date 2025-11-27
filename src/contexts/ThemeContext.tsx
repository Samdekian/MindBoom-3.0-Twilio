
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

// Create the context with default values
export const ThemeContext = createContext<ThemeProviderState | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "system",
  storageKey = "theme",
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (savedTheme) {
      return savedTheme;
    }
    // If no saved theme, check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  // Apply theme changes to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    // Save theme to localStorage
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);
  
  // Handle system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme,
      toggleTheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Create a hook for convenient usage
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
