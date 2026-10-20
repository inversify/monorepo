import {
  createContext,
  type Dispatch,
  type ReactElement,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  applyTheme,
  resolveInitialTheme,
  storeTheme,
  type ThemeName,
} from './theme.js';

export interface ThemeContextValue {
  readonly setTheme: (theme: ThemeName) => void;
  readonly theme: ThemeName;
}

export interface ThemeProviderProps {
  readonly children: ReactNode;
}

const ThemeContext: React.Context<ThemeContextValue | undefined> =
  createContext<ThemeContextValue | undefined>(undefined);

export function useTheme(): ThemeContextValue {
  const value: ThemeContextValue | undefined = useContext(ThemeContext);

  if (value === undefined) {
    throw new Error('useTheme must be used within ThemeProvider.');
  }

  return value;
}

export function ThemeProvider(props: ThemeProviderProps): ReactElement {
  const themeState: [ThemeName, Dispatch<SetStateAction<ThemeName>>] =
    useState(resolveInitialTheme);
  const theme: ThemeName = themeState[0];
  const setThemeState: Dispatch<SetStateAction<ThemeName>> = themeState[1];

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme: (nextTheme: ThemeName) => void = useCallback(
    (nextTheme: ThemeName): void => {
      setThemeState(nextTheme);
      storeTheme(nextTheme);
    },
    [],
  );

  const value: ThemeContextValue = useMemo(
    (): ThemeContextValue => ({
      setTheme,
      theme,
    }),
    [setTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {props.children}
    </ThemeContext.Provider>
  );
}
