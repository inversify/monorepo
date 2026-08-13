import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { readYarnBerryVersion } from './readYarnBerryVersion.js';

describe(readYarnBerryVersion, () => {
  describe('having a yarn-berry catalog', () => {
    let temporaryRoot: string;

    beforeAll(async () => {
      temporaryRoot = await fs.mkdtemp(
        path.join(os.tmpdir(), 'yarn-berry-catalog-'),
      );
      await fs.writeFile(
        path.join(temporaryRoot, 'yarn-berry.json'),
        `${JSON.stringify({ version: '4.18.0' }, undefined, 2)}\n`,
        'utf8',
      );
    });

    afterAll(async () => {
      await fs.rm(temporaryRoot, { force: true, recursive: true });
    });

    describe('when called', () => {
      let result: string;

      beforeAll(async () => {
        result = await readYarnBerryVersion(temporaryRoot);
      });

      it('should return the catalog version', () => {
        expect(result).toBe('4.18.0');
      });
    });
  });
});
