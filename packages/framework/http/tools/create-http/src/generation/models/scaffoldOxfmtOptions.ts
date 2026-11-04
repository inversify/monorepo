import { type FormatConfig } from 'oxfmt';

/**
 * Must stay aligned with `@inversifyjs/foundation-oxfmt-config`.
 * Scaffolding formats sources before install, so it cannot load the generated
 * app's `oxfmt.config.ts` (that file imports the foundation config package).
 */
export const SCAFFOLD_OXFMT_OPTIONS: FormatConfig = {
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
};
