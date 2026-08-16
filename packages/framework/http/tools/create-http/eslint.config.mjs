import { buildDefaultConfig } from '@inversifyjs/foundation-eslint-config';

import plugin from '@inversifyjs/eslint-plugin-require-extensions';

export default [
  {
    ignores: ['templates/**'],
  },
  ...buildDefaultConfig(
    {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          disallowTypeAnnotations: true,
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports',
        },
      ],
      'require-extensions/require-extensions': 'error',
      'require-extensions/require-index': 'error',
    },
    {
      'require-extensions': plugin,
    },
  ),
];
