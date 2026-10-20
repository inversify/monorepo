export const THEME_STORAGE_KEY: string = 'http-insights-ui-theme';

export type ThemeName = 'dark' | 'light';

const THEME_COLOR: Readonly<Record<ThemeName, string>> = {
  dark: '#070b12',
  light: '#eef3f8',
};

export function isThemeName(value: string | undefined): value is ThemeName {
  return value === 'light' || value === 'dark';
}

export function readStoredTheme(): ThemeName | undefined {
  try {
    const stored: string | null = localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === null || !isThemeName(stored)) {
      return undefined;
    }

    return stored;
  } catch {
    return undefined;
  }
}

export function resolveInitialTheme(): ThemeName {
  const datasetTheme: string | undefined =
    document.documentElement.dataset['theme'];

  if (isThemeName(datasetTheme)) {
    return datasetTheme;
  }

  const storedTheme: ThemeName | undefined = readStoredTheme();

  if (storedTheme !== undefined) {
    return storedTheme;
  }

  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: light)').matches
  ) {
    return 'light';
  }

  return 'dark';
}

export function applyTheme(theme: ThemeName): void {
  document.documentElement.dataset['theme'] = theme;

  const themeColor: Element | null = document.querySelector(
    'meta[name="theme-color"]',
  );

  themeColor?.setAttribute('content', THEME_COLOR[theme]);
}

export function storeTheme(theme: ThemeName): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The selected theme still applies when storage is unavailable.
  }
}
