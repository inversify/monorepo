import { beforeAll, describe, expect, it } from 'vitest';

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getBaseTemplateRoot } from '../calculations/getTemplatesRoot.js';
import { DB_ADAPTERS, type DbAdapter } from '../models/DbAdapter.js';
import { HTTP_ADAPTERS, type HttpAdapter } from '../models/HttpAdapter.js';
import {
  PACKAGE_MANAGERS,
  type PackageManager,
} from '../models/PackageManager.js';
import { type PackageManagersVersions } from '../models/PackageManagersVersions.js';
import { buildProject } from '../services/buildProject.js';
import { createHttpApp } from '../services/createHttpApp.js';
import { installProjectDependencies } from '../services/installProjectDependencies.js';

const packageRoot: string = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const integrationTestRoot: string = path.join(
  packageRoot,
  'tmp',
  'test',
  'createHttpCommand',
);

const CREATE_HTTP_COMMAND_INTEGRATION_TIMEOUT_MS: number = 10 * 60 * 1000;

interface CreateHttpCommandIntegrationCase {
  dbAdapter: DbAdapter;
  httpAdapter: HttpAdapter;
}

function getAdapterCases(): CreateHttpCommandIntegrationCase[] {
  return HTTP_ADAPTERS.flatMap(
    (httpAdapter: HttpAdapter): CreateHttpCommandIntegrationCase[] =>
      DB_ADAPTERS.map(
        (dbAdapter: DbAdapter): CreateHttpCommandIntegrationCase => ({
          dbAdapter,
          httpAdapter,
        }),
      ),
  );
}

function getCaseFolderName(testCase: CreateHttpCommandIntegrationCase): string {
  return `${testCase.httpAdapter}-${testCase.dbAdapter.replaceAll('+', '-')}`;
}

async function pathExists(absolutePath: string): Promise<boolean> {
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parent pnpm workspace for all adapter recipes. Includes uwebsockets
 * `blockExoticSubdeps: false` and Prisma allowBuilds so one install covers every
 * scaffolded member. Child scaffolds' own `pnpm-workspace.yaml` files are removed
 * after generation so this root owns the workspace.
 */
function buildIntegrationPnpmWorkspaceYaml(): string {
  return `# Integration monorepo covering all HTTP adapter recipes.
packages:
  - '*'

# Allow Prisma install scripts (pnpm 10+ blocks dependency build scripts by default).
allowBuilds:
  '@prisma/engines': true
  '@scarf/scarf': true
  prisma: true

# Allow git-hosted uWebSockets.js pulled in by @inversifyjs/http-uwebsockets.
blockExoticSubdeps: false
`;
}

async function readPackageManagersVersions(): Promise<PackageManagersVersions> {
  const packageManagersVersionsContents: string = await fs.readFile(
    path.join(getBaseTemplateRoot(), 'package-managers.json'),
    'utf8',
  );

  return JSON.parse(packageManagersVersionsContents) as PackageManagersVersions;
}

async function writePackageManagerMonorepoRoot(
  monorepoRoot: string,
  packageManager: PackageManager,
): Promise<void> {
  await fs.mkdir(monorepoRoot, { recursive: true });

  const packageManagersVersions: PackageManagersVersions =
    await readPackageManagersVersions();
  const packageManagerField: string = `${packageManager}@${packageManagersVersions[packageManager]}`;

  if (packageManager === 'pnpm') {
    await fs.writeFile(
      path.join(monorepoRoot, 'package.json'),
      `${JSON.stringify(
        {
          name: 'create-http-command-integration-pnpm',
          private: true,
        },
        undefined,
        2,
      )}\n`,
      'utf8',
    );
    await fs.writeFile(
      path.join(monorepoRoot, 'pnpm-workspace.yaml'),
      buildIntegrationPnpmWorkspaceYaml(),
      'utf8',
    );
    return;
  }

  await fs.writeFile(
    path.join(monorepoRoot, 'package.json'),
    `${JSON.stringify(
      {
        name: `create-http-command-integration-${packageManager}`,
        packageManager: packageManagerField,
        private: true,
        workspaces: ['*'],
      },
      undefined,
      2,
    )}\n`,
    'utf8',
  );
}

describe('createHttpCommand', { concurrent: false }, () => {
  describe.each(PACKAGE_MANAGERS)(
    'having packageManager %s',
    (packageManager: PackageManager) => {
      const adapterCases: CreateHttpCommandIntegrationCase[] =
        getAdapterCases();
      let monorepoRoot: string;

      beforeAll(async () => {
        monorepoRoot = path.join(integrationTestRoot, packageManager);

        await fs.rm(monorepoRoot, { force: true, recursive: true });
        await writePackageManagerMonorepoRoot(monorepoRoot, packageManager);

        for (const testCase of adapterCases) {
          const projectPath: string = path.join(
            monorepoRoot,
            getCaseFolderName(testCase),
          );

          await createHttpApp({
            dbAdapter: testCase.dbAdapter,
            httpAdapter: testCase.httpAdapter,
            packageManager,
            targetPath: projectPath,
          });

          // Standalone pnpm scaffolds write their own workspace file for
          // allowBuilds / blockExoticSubdeps. Remove it so this monorepo root
          // remains the only workspace and dependencies can be shared.
          if (packageManager === 'pnpm') {
            await fs.rm(path.join(projectPath, 'pnpm-workspace.yaml'), {
              force: true,
            });
          }
        }

        await installProjectDependencies(monorepoRoot, packageManager);
      }, CREATE_HTTP_COMMAND_INTEGRATION_TIMEOUT_MS);

      it(
        'should install dependencies once at the package-manager monorepo root',
        async () => {
          await expect(
            pathExists(path.join(monorepoRoot, 'node_modules')),
          ).resolves.toBe(true);
        },
        CREATE_HTTP_COMMAND_INTEGRATION_TIMEOUT_MS,
      );

      describe.each(adapterCases)(
        'having httpAdapter $httpAdapter and dbAdapter $dbAdapter',
        (testCase: CreateHttpCommandIntegrationCase) => {
          describe('when building the scaffolded app', () => {
            let projectPath: string;

            beforeAll(() => {
              projectPath = path.join(
                monorepoRoot,
                getCaseFolderName(testCase),
              );
            });

            it(
              'should compile the generated TypeScript sources',
              async () => {
                await expect(
                  buildProject(projectPath, packageManager),
                ).resolves.toBeUndefined();

                await expect(
                  pathExists(path.join(projectPath, 'dist', 'index.js')),
                ).resolves.toBe(true);
                await expect(
                  pathExists(
                    path.join(
                      projectPath,
                      'dist',
                      'app',
                      'scripts',
                      'bootstrap.js',
                    ),
                  ),
                ).resolves.toBe(true);
                await expect(
                  pathExists(
                    path.join(
                      projectPath,
                      'dist',
                      'todo',
                      'api',
                      'controllers',
                      'TodoController.js',
                    ),
                  ),
                ).resolves.toBe(true);
              },
              CREATE_HTTP_COMMAND_INTEGRATION_TIMEOUT_MS,
            );
          });
        },
      );
    },
  );
});
