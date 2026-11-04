import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { formatGeneratedProjectSources } from './formatGeneratedProjectSources.js';

describe(formatGeneratedProjectSources, () => {
  describe('having unformatted TypeScript sources', () => {
    let temporaryRoot: string;
    let projectPath: string;

    beforeAll(async () => {
      temporaryRoot = await fs.mkdtemp(
        path.join(os.tmpdir(), 'create-http-format-'),
      );
      projectPath = path.join(temporaryRoot, 'demo-app');

      await fs.mkdir(path.join(projectPath, 'src'), { recursive: true });
      await fs.writeFile(
        path.join(projectPath, 'src/example.ts'),
        `import { readFile } from "node:fs/promises";
import { z } from "zod";

export const value={foo:"bar",baz:true}
`,
        'utf8',
      );

      await formatGeneratedProjectSources(projectPath);
    });

    afterAll(async () => {
      await fs.rm(temporaryRoot, { force: true, recursive: true });
    });

    describe('when called', () => {
      it('should rewrite sources with oxfmt import sorting and quotes', async () => {
        const formattedSource: string = await fs.readFile(
          path.join(projectPath, 'src/example.ts'),
          'utf8',
        );

        expect(formattedSource).toBe(
          `import { readFile } from 'node:fs/promises';

import { z } from 'zod';

export const value = { foo: 'bar', baz: true };
`,
        );
      });
    });
  });
});
