import { beforeAll, describe, expect, it } from 'vitest';

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DB_ADAPTERS, type DbAdapter } from '../models/DbAdapter.js';
import { HTTP_ADAPTERS, type HttpAdapter } from '../models/HttpAdapter.js';
import {
  PACKAGE_MANAGERS,
  type PackageManager,
} from '../models/PackageManager.js';
import { createHttpApp } from './createHttpApp.js';

const packageRoot: string = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const integrationTestRoot: string = path.join(packageRoot, 'tmp', 'test');

interface CreateHttpAppIntegrationCase {
  dbAdapter: DbAdapter;
  httpAdapter: HttpAdapter;
  packageManager: PackageManager;
}

const createHttpAppIntegrationCases: CreateHttpAppIntegrationCase[] =
  PACKAGE_MANAGERS.flatMap(
    (packageManager: PackageManager): CreateHttpAppIntegrationCase[] =>
      HTTP_ADAPTERS.flatMap(
        (httpAdapter: HttpAdapter): CreateHttpAppIntegrationCase[] =>
          DB_ADAPTERS.map(
            (dbAdapter: DbAdapter): CreateHttpAppIntegrationCase => ({
              dbAdapter,
              httpAdapter,
              packageManager,
            }),
          ),
      ),
  );

function getCaseFolderName(testCase: CreateHttpAppIntegrationCase): string {
  return [
    testCase.packageManager,
    testCase.httpAdapter,
    testCase.dbAdapter.replaceAll('+', '-'),
  ].join('-');
}

describe(createHttpApp, () => {
  describe.each(createHttpAppIntegrationCases)(
    'having packageManager $packageManager, httpAdapter $httpAdapter, and dbAdapter $dbAdapter',
    (testCase: CreateHttpAppIntegrationCase) => {
      describe('when called', () => {
        let projectPath: string;
        let result: Promise<string>;

        beforeAll(async () => {
          projectPath = path.join(
            integrationTestRoot,
            getCaseFolderName(testCase),
          );

          await fs.rm(projectPath, { force: true, recursive: true });

          result = createHttpApp({
            dbAdapter: testCase.dbAdapter,
            httpAdapter: testCase.httpAdapter,
            packageManager: testCase.packageManager,
            targetPath: projectPath,
          });
        });

        it('should not throw', async () => {
          await expect(result).resolves.toBe(projectPath);
        });
      });
    },
  );
});
