import { type ReactElement } from 'react';

import { type ThemeName } from '../theme/theme.js';
import { useTheme } from '../theme/ThemeProvider.js';

const THEMES: readonly ThemeName[] = ['light', 'dark'];

export function ThemeSwitch(): ReactElement {
  const themeState: ReturnType<typeof useTheme> = useTheme();

  return (
    <div aria-label="Color theme" className="theme-switch" role="group">
      {THEMES.map((theme: ThemeName): ReactElement => (
        <button
          aria-pressed={themeState.theme === theme}
          key={theme}
          onClick={(): void => {
            themeState.setTheme(theme);
          }}
          type="button"
        >
          {theme}
        </button>
      ))}
    </div>
  );
}
