import { DbAdapter } from '../models/DbAdapter.js';
import { type PackageManager } from '../models/PackageManager.js';

const BASE_SCRIPTS: Record<string, string> = {
  build: 'tsc',
  format: 'prettier --write ./src',
  lint: 'eslint ./src',
  serve: 'node ./dist/index.js',
};

const DB_ADAPTER_SCRIPTS: Record<DbAdapter, Record<string, string>> = {
  [DbAdapter.prismaPostgresql]: {
    build: 'prisma generate && tsc',
    'db:generate': 'prisma generate',
    'db:migrate': 'prisma migrate deploy',
  },
};

export function buildGeneratedPackageJson(
  packageName: string,
  packageManager: PackageManager,
  packageManagerVersion: string,
  dependencies: Record<string, string>,
  devDependencies: Record<string, string>,
  dbAdapter: DbAdapter,
  dependenciesMeta?: Readonly<Record<string, { built: true }>>,
): Record<string, unknown> {
  return {
    dependencies,
    ...(dependenciesMeta !== undefined &&
    Object.keys(dependenciesMeta).length > 0
      ? { dependenciesMeta }
      : {}),
    devDependencies,
    name: packageName,
    packageManager: `${packageManager}@${packageManagerVersion}`,
    private: true,
    scripts: {
      ...BASE_SCRIPTS,
      ...DB_ADAPTER_SCRIPTS[dbAdapter],
    },
    type: 'module',
    version: '0.1.0',
  };
}
