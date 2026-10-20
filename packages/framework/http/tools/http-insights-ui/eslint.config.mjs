import { buildDefaultConfig } from '@inversifyjs/foundation-eslint-config';
import globals from 'globals';

export default [
  {
    ignores: ['coverage/**', 'dist/**', 'lib/**'],
  },
  ...buildDefaultConfig({
    '@typescript-eslint/naming-convention': [
      'error',
      {
        format: ['strictCamelCase', 'UPPER_CASE', 'snake_case'],
        leadingUnderscore: 'allow',
        selector: ['classProperty'],
      },
      {
        format: ['StrictPascalCase'],
        prefix: ['T'],
        selector: 'typeParameter',
      },
      {
        format: ['StrictPascalCase'],
        selector: ['typeLike'],
      },
      {
        format: ['strictCamelCase'],
        leadingUnderscore: 'allow',
        selector: ['classMethod'],
      },
      {
        format: ['strictCamelCase', 'StrictPascalCase'],
        leadingUnderscore: 'allow',
        selector: ['function'],
      },
      {
        format: ['strictCamelCase'],
        leadingUnderscore: 'allow',
        selector: ['parameter'],
      },
      {
        format: [
          'strictCamelCase',
          'StrictPascalCase',
          'UPPER_CASE',
          'snake_case',
        ],
        selector: ['variableLike'],
      },
    ],
  }),
  {
    files: ['src/app/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
  },
];
