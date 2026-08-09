import { type Options } from 'prettier';

/**
 * Must stay aligned with `templates/base/prettier.config.mjs.template`.
 */
export const SCAFFOLD_PRETTIER_OPTIONS: Options = {
  arrowParens: 'always',
  bracketSpacing: true,
  endOfLine: 'lf',
  parser: 'typescript',
  printWidth: 80,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false,
};
