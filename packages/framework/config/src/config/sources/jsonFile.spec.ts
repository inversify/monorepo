import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { type ConfigObject } from '../models/ConfigObject.js';
import { InversifyConfigError } from '../models/InversifyConfigError.js';
import { jsonFile } from './jsonFile.js';

describe(jsonFile, () => {
  describe('having a JSON object file', () => {
    let directoryFixture: string;
    let jsonPathFixture: string;
    let result: ConfigObject;

    beforeAll(async () => {
      directoryFixture = await mkdtemp(join(tmpdir(), 'inversify-config-'));
      jsonPathFixture = join(directoryFixture, 'config.json');
      await writeFile(
        jsonPathFixture,
        JSON.stringify({ host: 'localhost', port: 3000 }),
      );

      result = await jsonFile({ path: jsonPathFixture }).load();
    });

    afterAll(async () => {
      await rm(directoryFixture, { force: true, recursive: true });
    });

    it('should return the parsed object', () => {
      expect(result).toStrictEqual({
        host: 'localhost',
        port: 3000,
      });
    });
  });

  describe('having a JSON array file', () => {
    let directoryFixture: string;
    let jsonPathFixture: string;
    let result: unknown;

    beforeAll(async () => {
      directoryFixture = await mkdtemp(join(tmpdir(), 'inversify-config-'));
      jsonPathFixture = join(directoryFixture, 'config.json');
      await writeFile(jsonPathFixture, JSON.stringify([1, 2, 3]));

      try {
        await jsonFile({ path: jsonPathFixture }).load();
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

  describe('having invalid JSON content', () => {
    let directoryFixture: string;
    let jsonPathFixture: string;
    let result: unknown;

    beforeAll(async () => {
      directoryFixture = await mkdtemp(join(tmpdir(), 'inversify-config-'));
      jsonPathFixture = join(directoryFixture, 'config.json');
      await writeFile(jsonPathFixture, '{ invalid json');

      try {
        await jsonFile({ path: jsonPathFixture }).load();
      } catch (error: unknown) {
        result = error;
      }
    });

    afterAll(async () => {
      await rm(directoryFixture, { force: true, recursive: true });
    });

    it('should throw an InversifyConfigError', () => {
      expect(result).toBeInstanceOf(InversifyConfigError);
      expect((result as Error).cause).toBeInstanceOf(SyntaxError);
    });
  });

  describe('having a missing JSON file', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(async () => {
        try {
          await jsonFile({
            path: join(tmpdir(), 'inversify-config-missing.json'),
          }).load();
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an InversifyConfigError', () => {
        expect(result).toBeInstanceOf(InversifyConfigError);
      });
    });
  });
});
