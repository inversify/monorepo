import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { formatGeneratedProjectSources } from './formatGeneratedProjectSources.js';

describe(formatGeneratedProjectSources, () => {
  describe('having unformatted TypeScript sources and a prettier config', () => {
    let temporaryRoot: string;
    let projectPath: string;

    beforeAll(async () => {
      temporaryRoot = await fs.mkdtemp(
        path.join(os.tmpdir(), 'create-http-format-'),
      );
      projectPath = path.join(temporaryRoot, 'demo-app');

      await fs.mkdir(path.join(projectPath, 'src'), { recursive: true });
      await fs.writeFile(
        path.join(projectPath, 'prettier.config.mjs'),
        `export default {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  trailingComma: 'all',
};
`,
        'utf8',
      );
      await fs.writeFile(
        path.join(projectPath, 'src/example.ts'),
        `export const value={foo:"bar",baz:true}
`,
        'utf8',
      );

      await formatGeneratedProjectSources(projectPath);
    });

    afterAll(async () => {
      await fs.rm(temporaryRoot, { force: true, recursive: true });
    });

    describe('when called', () => {
      it('should rewrite sources using the project prettier config', async () => {
        const formattedSource: string = await fs.readFile(
          path.join(projectPath, 'src/example.ts'),
          'utf8',
        );

        expect(formattedSource).toBe(
          `export const value = { foo: 'bar', baz: true };
`,
        );
      });
    });
  });
});
