import { beforeAll, describe, expect, it } from 'vitest';

import { readFile } from 'node:fs/promises';

describe('package.json', () => {
  describe('.exports', () => {
    let result: unknown;

    beforeAll(async () => {
      const packageJson: { exports: unknown } = JSON.parse(
        await readFile(new URL('../package.json', import.meta.url), 'utf8'),
      ) as { exports: unknown };

      result = packageJson.exports;
    });

    it('should only expose versioned entry points', () => {
      expect(result).toStrictEqual({
        './v1Dot0': './lib/amqp/v1Dot0/index.js',
      });
    });
  });
});
