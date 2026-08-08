import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { type ConfigObject, InversifyConfigError } from '@inversifyjs/config';

import { envFile } from './envFile.js';

describe(envFile, () => {
  describe('having an existing env file', () => {
    let directoryFixture: string;
    let envPathFixture: string;
    let result: ConfigObject;

    beforeAll(async () => {
      directoryFixture = await mkdtemp(join(tmpdir(), 'inversify-config-'));
      envPathFixture = join(directoryFixture, '.env');
      await writeFile(envPathFixture, 'PORT=3000\nHOST=localhost\n');

      result = await envFile({ path: envPathFixture }).load();
    });

    afterAll(async () => {
      await rm(directoryFixture, { force: true, recursive: true });
    });

    it('should return parsed environment variables', () => {
      expect(result).toStrictEqual({
        HOST: 'localhost',
        PORT: '3000',
      });
    });
  });

  describe('having multiple env files', () => {
    let directoryFixture: string;
    let firstEnvPathFixture: string;
    let secondEnvPathFixture: string;
    let result: ConfigObject;

    beforeAll(async () => {
      directoryFixture = await mkdtemp(join(tmpdir(), 'inversify-config-'));
      firstEnvPathFixture = join(directoryFixture, '.env');
      secondEnvPathFixture = join(directoryFixture, '.env.local');
      await writeFile(firstEnvPathFixture, 'PORT=3000\nHOST=localhost\n');
      await writeFile(secondEnvPathFixture, 'PORT=4000\n');

      result = await envFile({
        path: [firstEnvPathFixture, secondEnvPathFixture],
      }).load();
    });

    afterAll(async () => {
      await rm(directoryFixture, { force: true, recursive: true });
    });

    it('should let later files override earlier ones', () => {
      expect(result).toStrictEqual({
        HOST: 'localhost',
        PORT: '4000',
      });
    });
  });

  describe('having a missing env file', () => {
    describe('when called', () => {
      let result: ConfigObject;

      beforeAll(async () => {
        result = await envFile({
          path: join(tmpdir(), 'inversify-config-missing.env'),
        }).load();
      });

      it('should return an empty object', () => {
        expect(result).toStrictEqual({});
      });
    });
  });

  describe('having an unreadable env path', () => {
    let directoryFixture: string;
    let result: unknown;

    beforeAll(async () => {
      directoryFixture = await mkdtemp(join(tmpdir(), 'inversify-config-'));

      try {
        await envFile({ path: directoryFixture }).load();
      } catch (error: unknown) {
        result = error;
      }
    });

    afterAll(async () => {
      await rm(directoryFixture, { force: true, recursive: true });
    });

    it('should throw an InversifyConfigError', () => {
      expect(result).toBeInstanceOf(InversifyConfigError);
      expect((result as Error).cause).toBeDefined();
    });
  });
});
