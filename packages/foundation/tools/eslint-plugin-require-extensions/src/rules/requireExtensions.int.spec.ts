import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { Linter } from 'eslint';
import tseslint from 'typescript-eslint';

import { requireExtensions, requireIndex } from './requireExtensions.js';

interface TestCase {
  code: string;
  description: string;
  expectedErrors: number;
  expectedFix?: string;
  files?: string[];
  directories?: string[];
}

// eslint-disable-next-line vitest/prefer-describe-function-title
describe('requireExtensions', () => {
  let linter: Linter;
  let tempDir: string;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'eslint-require-extensions-'),
    );
    linter = new Linter({ cwd: tempDir });
  });

  afterAll(() => {
    fs.rmSync(tempDir, { force: true, recursive: true });
  });

  function setupTestFiles(files: string[], directories: string[]): void {
    for (const dir of directories) {
      fs.mkdirSync(path.join(tempDir, dir), { recursive: true });
    }
    for (const file of files) {
      const filePath: string = path.join(tempDir, file);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, '');
    }
  }

  function lint(code: string): Linter.LintMessage[] {
    const filename: string = path.join(tempDir, 'test.ts');
    return linter.verify(
      code,
      [
        {
          files: ['**/*.ts'],
          languageOptions: {
            ecmaVersion: 2022,
            parser: tseslint.parser,
            sourceType: 'module',
          },
          plugins: {
            'require-extensions': {
              rules: {
                'require-extensions': requireExtensions,
                'require-index': requireIndex,
              },
            },
          },
          rules: {
            'require-extensions/require-extensions': 'error',
            'require-extensions/require-index': 'error',
          },
        },
      ],
      { filename },
    );
  }

  function fix(code: string): string {
    const filename: string = path.join(tempDir, 'test.ts');
    const result: Linter.FixReport = linter.verifyAndFix(
      code,
      [
        {
          files: ['**/*.ts'],
          languageOptions: {
            ecmaVersion: 2022,
            parser: tseslint.parser,
            sourceType: 'module',
          },
          plugins: {
            'require-extensions': {
              rules: {
                'require-extensions': requireExtensions,
                'require-index': requireIndex,
              },
            },
          },
          rules: {
            'require-extensions/require-extensions': 'error',
            'require-extensions/require-index': 'error',
          },
        },
      ],
      { filename },
    );
    return result.output;
  }

  describe.each<TestCase>([
    {
      code: "import foo from 'lodash';",
      description: 'non-relative import (package)',
      expectedErrors: 0,
    },
    {
      code: "import foo from './foo.js';",
      description: 'relative import with .js extension',
      expectedErrors: 0,
      files: ['foo.ts'],
    },
    {
      code: "import foo from './foo.mjs';",
      description: 'relative import with .mjs extension',
      expectedErrors: 0,
      files: ['foo.mts'],
    },
    {
      code: "import foo from './foo.cjs';",
      description: 'relative import with .cjs extension',
      expectedErrors: 0,
      files: ['foo.cts'],
    },
    {
      code: "import foo from './foo.json';",
      description: 'relative import with .json extension',
      expectedErrors: 0,
      files: ['foo.json'],
    },
    {
      code: "import foo from './foo';",
      description: 'relative import missing .js extension (.ts file exists)',
      expectedErrors: 1,
      expectedFix: "import foo from './foo.js';",
      files: ['foo.ts'],
    },
    {
      code: "import foo from './foo';",
      description: 'relative import missing .mjs extension (.mts file exists)',
      expectedErrors: 1,
      expectedFix: "import foo from './foo.mjs';",
      files: ['foo.mts'],
    },
    {
      code: "import foo from './foo';",
      description: 'relative import missing .cjs extension (.cts file exists)',
      expectedErrors: 1,
      expectedFix: "import foo from './foo.cjs';",
      files: ['foo.cts'],
    },
    {
      code: "import foo from './foo';",
      description: 'relative import missing .js extension (.tsx file exists)',
      expectedErrors: 1,
      expectedFix: "import foo from './foo.js';",
      files: ['foo.tsx'],
    },
    {
      code: "import foo from './foo';",
      description: 'relative import missing .js extension (.jsx file exists)',
      expectedErrors: 1,
      expectedFix: "import foo from './foo.js';",
      files: ['foo.jsx'],
    },
    {
      code: "import foo from './foo';",
      description:
        'relative import missing .js extension (file does not exist)',
      expectedErrors: 1,
      expectedFix: "import foo from './foo.js';",
    },
    {
      code: "import { bar } from './foo';",
      description: 'named import missing extension',
      expectedErrors: 1,
      expectedFix: "import { bar } from './foo.js';",
      files: ['foo.ts'],
    },
    {
      code: "import { bar, baz } from './foo';",
      description: 'multiple named imports missing extension',
      expectedErrors: 1,
      expectedFix: "import { bar, baz } from './foo.js';",
      files: ['foo.ts'],
    },
    {
      code: "import { bar as renamed } from './foo';",
      description: 'renamed import missing extension',
      expectedErrors: 1,
      expectedFix: "import { bar as renamed } from './foo.js';",
      files: ['foo.ts'],
    },
    {
      code: "import * as foo from './foo';",
      description: 'namespace import missing extension',
      expectedErrors: 1,
      expectedFix: "import * as foo from './foo.js';",
      files: ['foo.ts'],
    },
    {
      code: "import './foo';",
      description: 'side-effect import missing extension',
      expectedErrors: 1,
      expectedFix: "import './foo.js';",
      files: ['foo.ts'],
    },
    {
      code: "import defaultExport, { named } from './foo';",
      description: 'default and named import missing extension',
      expectedErrors: 1,
      expectedFix: "import defaultExport, { named } from './foo.js';",
      files: ['foo.ts'],
    },
    {
      code: "export { foo } from './foo';",
      description: 'named re-export missing extension',
      expectedErrors: 1,
      expectedFix: "export { foo } from './foo.js';",
      files: ['foo.ts'],
    },
    {
      code: "export { foo as bar } from './foo';",
      description: 'renamed re-export missing extension',
      expectedErrors: 1,
      expectedFix: "export { foo as bar } from './foo.js';",
      files: ['foo.ts'],
    },
    {
      code: "export * from './foo';",
      description: 'export all missing extension',
      expectedErrors: 1,
      expectedFix: "export * from './foo.js';",
      files: ['foo.ts'],
    },
    {
      code: "export * as ns from './foo';",
      description: 'export namespace missing extension',
      expectedErrors: 1,
      expectedFix: "export * as ns from './foo.js';",
      files: ['foo.ts'],
    },
    {
      code: "const foo = import('./foo');",
      description: 'dynamic import missing extension',
      expectedErrors: 1,
      expectedFix: "const foo = import('./foo.js');",
      files: ['foo.ts'],
    },
    {
      code: "import foo from './nested/deep/module';",
      description: 'nested path missing extension',
      expectedErrors: 1,
      expectedFix: "import foo from './nested/deep/module.js';",
      files: ['nested/deep/module.ts'],
    },
    {
      code: "import foo from '../sibling';",
      description: 'parent directory import missing extension',
      expectedErrors: 1,
      expectedFix: "import foo from '../sibling.js';",
    },
    {
      code: "import { type Foo } from './foo';",
      description: 'per-specifier type import missing extension',
      expectedErrors: 1,
      expectedFix: "import { type Foo } from './foo.js';",
      files: ['foo.ts'],
    },
    {
      code: "import { type Foo, Bar } from './foo';",
      description: 'mixed type and value imports missing extension',
      expectedErrors: 1,
      expectedFix: "import { type Foo, Bar } from './foo.js';",
      files: ['foo.ts'],
    },
    {
      code: "import { type Foo as RenamedFoo } from './foo';",
      description: 'renamed per-specifier type import missing extension',
      expectedErrors: 1,
      expectedFix: "import { type Foo as RenamedFoo } from './foo.js';",
      files: ['foo.ts'],
    },
    {
      code: "export { type Foo } from './foo';",
      description: 'per-specifier type export missing extension',
      expectedErrors: 1,
      expectedFix: "export { type Foo } from './foo.js';",
      files: ['foo.ts'],
    },
    {
      code: "export { type Foo, Bar } from './foo';",
      description: 'mixed type and value exports missing extension',
      expectedErrors: 1,
      expectedFix: "export { type Foo, Bar } from './foo.js';",
      files: ['foo.ts'],
    },
    {
      code: "export { type Foo as RenamedFoo } from './foo';",
      description: 'renamed per-specifier type export missing extension',
      expectedErrors: 1,
      expectedFix: "export { type Foo as RenamedFoo } from './foo.js';",
      files: ['foo.ts'],
    },
  ])(
    'having $description',
    ({
      code,
      expectedErrors,
      expectedFix,
      files = [],
      directories = [],
    }: TestCase) => {
      beforeAll(() => {
        fs.rmSync(tempDir, { force: true, recursive: true });
        fs.mkdirSync(tempDir, { recursive: true });
        setupTestFiles(files, directories);
      });

      describe('when linting', () => {
        let errors: Linter.LintMessage[];

        beforeAll(() => {
          errors = lint(code);
        });

        it(`should report ${String(expectedErrors)} error(s)`, () => {
          expect(errors).toHaveLength(expectedErrors);
        });
      });

      describe('when fixing', () => {
        let fixedCode: string;

        beforeAll(() => {
          fixedCode = fix(code);
        });

        it('should produce expected output', () => {
          expect(fixedCode).toBe(expectedFix ?? code);
        });
      });
    },
  );
});

// eslint-disable-next-line vitest/prefer-describe-function-title
describe('requireIndex', () => {
  let linter: Linter;
  let tempDir: string;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eslint-require-index-'));
    linter = new Linter({ cwd: tempDir });
  });

  afterAll(() => {
    fs.rmSync(tempDir, { force: true, recursive: true });
  });

  function setupTestFiles(files: string[], directories: string[]): void {
    for (const dir of directories) {
      fs.mkdirSync(path.join(tempDir, dir), { recursive: true });
    }
    for (const file of files) {
      const filePath: string = path.join(tempDir, file);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, '');
    }
  }

  function lint(code: string): Linter.LintMessage[] {
    const filename: string = path.join(tempDir, 'test.ts');
    return linter.verify(
      code,
      [
        {
          files: ['**/*.ts'],
          languageOptions: {
            ecmaVersion: 2022,
            parser: tseslint.parser,
            sourceType: 'module',
          },
          plugins: {
            'require-extensions': {
              rules: {
                'require-extensions': requireExtensions,
                'require-index': requireIndex,
              },
            },
          },
          rules: {
            'require-extensions/require-extensions': 'error',
            'require-extensions/require-index': 'error',
          },
        },
      ],
      { filename },
    );
  }

  function fix(code: string): string {
    const filename: string = path.join(tempDir, 'test.ts');
    const result: Linter.FixReport = linter.verifyAndFix(
      code,
      [
        {
          files: ['**/*.ts'],
          languageOptions: {
            ecmaVersion: 2022,
            parser: tseslint.parser,
            sourceType: 'module',
          },
          plugins: {
            'require-extensions': {
              rules: {
                'require-extensions': requireExtensions,
                'require-index': requireIndex,
              },
            },
          },
          rules: {
            'require-extensions/require-extensions': 'error',
            'require-extensions/require-index': 'error',
          },
        },
      ],
      { filename },
    );
    return result.output;
  }

  describe.each<TestCase>([
    {
      code: "import foo from './utils';",
      description: 'directory import without index (index.ts exists)',
      directories: ['utils'],
      expectedErrors: 1,
      expectedFix: "import foo from './utils/index.js';",
      files: ['utils/index.ts'],
    },
    {
      code: "import foo from './utils';",
      description: 'directory import without index (index.mts exists)',
      directories: ['utils'],
      expectedErrors: 1,
      expectedFix: "import foo from './utils/index.mjs';",
      files: ['utils/index.mts'],
    },
    {
      code: "import foo from './utils';",
      description: 'directory import without index (index.cts exists)',
      directories: ['utils'],
      expectedErrors: 1,
      expectedFix: "import foo from './utils/index.cjs';",
      files: ['utils/index.cts'],
    },
    {
      code: "import foo from './utils/';",
      description: 'directory import with trailing slash (index.ts exists)',
      directories: ['utils'],
      expectedErrors: 1,
      expectedFix: "import foo from './utils/index.js';",
      files: ['utils/index.ts'],
    },
    {
      code: "import foo from './utils/index.js';",
      description: 'directory import with explicit index.js',
      directories: ['utils'],
      expectedErrors: 0,
      files: ['utils/index.ts'],
    },
    {
      code: "export * from './utils';",
      description: 'export all from directory',
      directories: ['utils'],
      expectedErrors: 1,
      expectedFix: "export * from './utils/index.js';",
      files: ['utils/index.ts'],
    },
    {
      code: "export { foo } from './utils';",
      description: 'named export from directory',
      directories: ['utils'],
      expectedErrors: 1,
      expectedFix: "export { foo } from './utils/index.js';",
      files: ['utils/index.ts'],
    },
    {
      code: "const utils = import('./utils');",
      description: 'dynamic import of directory',
      directories: ['utils'],
      expectedErrors: 1,
      expectedFix: "const utils = import('./utils/index.js');",
      files: ['utils/index.ts'],
    },
    {
      code: "import foo from './nested/deep/utils';",
      description: 'nested directory import',
      directories: ['nested/deep/utils'],
      expectedErrors: 1,
      expectedFix: "import foo from './nested/deep/utils/index.js';",
      files: ['nested/deep/utils/index.ts'],
    },
  ])(
    'having $description',
    ({
      code,
      expectedErrors,
      expectedFix,
      files = [],
      directories = [],
    }: TestCase) => {
      beforeAll(() => {
        fs.rmSync(tempDir, { force: true, recursive: true });
        fs.mkdirSync(tempDir, { recursive: true });
        setupTestFiles(files, directories);
      });

      describe('when linting', () => {
        let errors: Linter.LintMessage[];

        beforeAll(() => {
          errors = lint(code);
        });

        it(`should report ${String(expectedErrors)} error(s)`, () => {
          expect(errors).toHaveLength(expectedErrors);
        });
      });

      describe('when fixing', () => {
        let fixedCode: string;

        beforeAll(() => {
          fixedCode = fix(code);
        });

        it('should produce expected output', () => {
          expect(fixedCode).toBe(expectedFix ?? code);
        });
      });
    },
  );
});
