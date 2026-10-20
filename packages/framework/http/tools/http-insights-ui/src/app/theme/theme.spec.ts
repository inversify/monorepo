import { beforeAll, describe, expect, it } from 'vitest';

import {
  applyTheme,
  isThemeName,
  readStoredTheme,
  resolveInitialTheme,
  storeTheme,
  THEME_STORAGE_KEY,
} from './theme.js';

describe(isThemeName, () => {
  describe('having "light"', () => {
    describe('when called', () => {
      it('should return true', () => {
        expect(isThemeName('light')).toBe(true);
      });
    });
  });

  describe('having an unknown value', () => {
    describe('when called', () => {
      it('should return false', () => {
        expect(isThemeName('dim')).toBe(false);
      });
    });
  });
});

describe(readStoredTheme, () => {
  describe('having a stored light theme', () => {
    describe('when called', () => {
      let result: string | undefined;

      beforeAll(() => {
        localStorage.setItem(THEME_STORAGE_KEY, 'light');
        result = readStoredTheme();
      });

      it('should return light', () => {
        expect(result).toBe('light');
      });
    });
  });
});

describe(resolveInitialTheme, () => {
  describe('having a theme already applied to the document', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        document.documentElement.dataset['theme'] = 'light';
        localStorage.setItem(THEME_STORAGE_KEY, 'dark');
        result = resolveInitialTheme();
      });

      it('should prefer the document theme', () => {
        expect(result).toBe('light');
      });
    });
  });
});

describe(storeTheme, () => {
  describe('having the dark theme', () => {
    describe('when called', () => {
      beforeAll(() => {
        storeTheme('dark');
      });

      it('should persist the theme', () => {
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
      });
    });
  });
});

describe(applyTheme, () => {
  describe('having the light theme', () => {
    describe('when called', () => {
      beforeAll(() => {
        document.head.innerHTML =
          '<meta name="theme-color" content="#070b12" />';
        applyTheme('light');
      });

      it('should apply the theme to the document', () => {
        expect(document.documentElement.dataset['theme']).toBe('light');
        expect(
          document
            .querySelector('meta[name="theme-color"]')
            ?.getAttribute('content'),
        ).toBe('#eef3f8');
      });
    });
  });
});
