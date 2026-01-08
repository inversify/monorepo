// @ts-check

import process from 'node:process';

import { defineConfig } from '@eslint/config-helpers';
import eslint from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import tseslint from 'typescript-eslint';
import eslintPrettierConfig from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

/**
 * @returns {import('@eslint/config-helpers').ConfigWithExtends}
 */
function buildBaseConfig() {
  return {
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          overrides: {
            constructors: 'no-public',
          },
        },
      ],
      '@typescript-eslint/member-ordering': ['warn'],
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
          selector: ['function', 'classMethod'],
          format: ['strictCamelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: ['parameter'],
          format: ['strictCamelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: ['variableLike'],
          format: ['strictCamelCase', 'UPPER_CASE', 'snake_case'],
        },
      ],
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-duplicate-type-constituents': 'off',
      '@typescript-eslint/no-dynamic-delete': 'error',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': ['error'],
      'no-magic-numbers': 'off',
      '@typescript-eslint/no-magic-numbers': [
        'warn',
        {
          ignore: [-1, 0, 1],
          ignoreArrayIndexes: true,
          ignoreEnums: true,
          ignoreReadonlyClassProperties: true,
        },
      ],
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-unnecessary-type-arguments': 'off',
      '@typescript-eslint/no-unused-expressions': ['error'],
      '@typescript-eslint/no-useless-constructor': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': ['off'],
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/prefer-readonly': ['warn'],
      '@typescript-eslint/promise-function-async': ['error'],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/restrict-plus-operands': [
        'error',
        {
          skipCompoundAssignments: false,
        },
      ],
      '@typescript-eslint/typedef': [
        'error',
        {
          arrayDestructuring: true,
          arrowParameter: true,
          memberVariableDeclaration: true,
          objectDestructuring: true,
          parameter: true,
          propertyDeclaration: true,
          variableDeclaration: true,
        },
      ],
      '@typescript-eslint/unified-signatures': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        {
          considerDefaultExhaustiveForUnions: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['vitest'],
            ['^\\u0000'],
            ['^node:'],
            ['^@?\\w'],
            ['^'],
            ['^\\.'],
          ],
        },
      ],
      'sort-keys': [
        'error',
        'asc',
        {
          caseSensitive: false,
          natural: true,
        },
      ],
    },
  };
}

export function buildDefaultConfig() {
  const baseRules = buildBaseConfig();

  const vitestPlugin = /** @type {import('@eslint/config-helpers').Plugin} */ (
    /** @type {unknown} */ (vitest)
  );

  return defineConfig(
    {
      ...baseRules,
      files: ['**/*.{cjs,mts,ts,tsx}'],
      ignores: ['**/*.spec.{cjs,mts,ts,tsx}'],
    },
    {
      ...baseRules,
      extends: [...(baseRules.extends ?? [])],
      files: ['**/*.spec.{cjs,mts,ts,tsx}'],
      plugins: {
        ...(baseRules.plugins ?? {}),
      },
      rules: {
        ...(baseRules.rules ?? {}),
        '@typescript-eslint/no-confusing-void-expression': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-magic-numbers': 'off',
      },
    },
    {
      files: ['**/*.spec.ts', '**/*.spec-d.ts'],
      plugins: {
        vitest: vitestPlugin,
      },
      rules: {
        ...vitest.configs.recommended.rules,
        ...vitest.configs.all.rules,
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-confusing-void-expression': 'off',
        '@typescript-eslint/no-magic-numbers': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        'vitest/consistent-test-filename': 'off',
        'vitest/consistent-vitest-vi': [
          'error',
          {
            fn: 'vitest',
          },
        ],
        'vitest/expect-expect': [
          'error',
          {
            assertFunctionNames: ['assertType', 'expect', 'expectTypeOf'],
          },
        ],
        'vitest/max-expects': 'off',
        'vitest/max-nested-describe': 'off',
        'vitest/no-hooks': 'off',
        'vitest/no-importing-vitest-globals': 'off',
        'vitest/prefer-expect-assertions': 'off',
        'vitest/prefer-strict-equal': 'error',
        'vitest/valid-title': 'off',
        'vitest/prefer-lowercase-title': 'off',
        'vitest/prefer-to-be-falsy': 'off',
        'vitest/prefer-to-be-truthy': 'off',
        'vitest/require-mock-type-parameters': 'off',
      },
    },
    /** @type {import('@eslint/config-helpers').ConfigWithExtends} */ (
      eslintPrettierConfig
    ),
  );
}
