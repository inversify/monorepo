import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { type ConfigObject, InversifyConfigError } from '@inversifyjs/config';

import { yamlFile } from './yamlFile.js';

describe(yamlFile, () => {
  describe('having a YAML object file', () => {
    let directoryFixture: string;
    let yamlPathFixture: string;
    let result: ConfigObject;

    beforeAll(async () => {
      directoryFixture = await mkdtemp(join(tmpdir(), 'inversify-config-'));
      yamlPathFixture = join(directoryFixture, 'config.yaml');
      await writeFile(
        yamlPathFixture,
        ['http:', '  host: localhost', '  port: 3000', ''].join('\n'),
      );

      result = await yamlFile({ path: yamlPathFixture }).load();
    });

    afterAll(async () => {
      await rm(directoryFixture, { force: true, recursive: true });
    });

    it('should return the parsed object', () => {
      expect(result).toStrictEqual({
        http: {
          host: 'localhost',
          port: 3000,
        },
      });
    });
  });

  describe('having a YAML array file', () => {
    let directoryFixture: string;
    let yamlPathFixture: string;
    let result: unknown;

    beforeAll(async () => {
      directoryFixture = await mkdtemp(join(tmpdir(), 'inversify-config-'));
      yamlPathFixture = join(directoryFixture, 'config.yaml');
      await writeFile(yamlPathFixture, '- one\n- two\n');

      try {
        await yamlFile({ path: yamlPathFixture }).load();
      } catch (error: unknown) {
        result = error;
      }
    });

    afterAll(async () => {
      await rm(directoryFixture, { force: true, recursive: true });
    });

    it('should throw an InversifyConfigError', () => {
      expect(result).toBeInstanceOf(InversifyConfigError);
    });
  });
});
