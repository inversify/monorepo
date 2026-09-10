import { buildDefaultConfig } from '@inversifyjs/foundation-eslint-config';

export default [
  ...buildDefaultConfig({
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: ['classProperty'],
        format: ['strictCamelCase', 'UPPER_CASE', 'snake_case'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'typeParameter',
        format: ['StrictPascalCase'],
        prefix: ['T'],
      },
      {
        selector: ['typeLike'],
        format: ['StrictPascalCase'],
      },
      {
        selector: ['classMethod'],
        format: ['strictCamelCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: ['function'],
        format: ['strictCamelCase', 'StrictPascalCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: ['parameter'],
        format: ['strictCamelCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: ['variableLike'],
        format: [
          'strictCamelCase',
          'StrictPascalCase',
          'UPPER_CASE',
          'snake_case',
        ],
      },
    ],
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/typedef': 'off',
  }),
];
