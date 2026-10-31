// @ts-check

import { defineConfig } from 'oxfmt';

export default defineConfig({
  arrowParens: 'always',
  bracketSpacing: true,
  endOfLine: 'lf',
  printWidth: 80,
  semi: true,
  singleQuote: true,
  sortImports: {
    customGroups: [
      {
        elementNamePattern: ['vitest'],
        groupName: 'vitest',
      },
    ],
    groups: [
      'vitest',
      'side_effect',
      'builtin',
      'external',
      ['internal', 'subpath', 'unknown'],
      ['parent', 'sibling', 'index'],
    ],
    ignoreCase: true,
    newlinesBetween: true,
  },
  sortPackageJson: false,
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false,
});
