import { ApiStyle } from '../models/ApiStyle.js';
import { DbAdapter } from '../models/DbAdapter.js';
import { type PackageManager } from '../models/PackageManager.js';

const BASE_SCRIPTS: Record<string, string> = {
  format: 'prettier --write ./src',
  lint: 'eslint ./src',
  serve: 'node ./dist/index.js',
};

const DB_ADAPTER_SCRIPTS: Record<DbAdapter, Record<string, string>> = {
  [DbAdapter.prismaPostgresql]: {
    'db:generate': 'prisma generate',
    'db:migrate': 'prisma migrate deploy',
  },
};

const API_STYLE_SCRIPTS: Record<ApiStyle, Record<string, string>> = {
  [ApiStyle.codeFirst]: {},
  [ApiStyle.schemaFirst]: {
    'generate:api': 'tsx src/app/scripts/generateApiTypes.ts',
  },
};

const DB_ADAPTER_BUILD_STEPS: Record<DbAdapter, readonly string[]> = {
  [DbAdapter.prismaPostgresql]: ['prisma generate'],
};

const API_STYLE_BUILD_STEPS: Record<ApiStyle, readonly string[]> = {
  [ApiStyle.codeFirst]: [],
  [ApiStyle.schemaFirst]: ['tsx src/app/scripts/generateApiTypes.ts'],
};

function composeBuildScript(dbAdapter: DbAdapter, apiStyle: ApiStyle): string {
  return [
    ...DB_ADAPTER_BUILD_STEPS[dbAdapter],
    ...API_STYLE_BUILD_STEPS[apiStyle],
    'tsc',
  ].join(' && ');
}

export function buildGeneratedPackageJson(
  packageName: string,
  packageManager: PackageManager,
  packageManagerVersion: string,
  dependencies: Record<string, string>,
  devDependencies: Record<string, string>,
  dbAdapter: DbAdapter,
  apiStyle: ApiStyle,
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
      ...API_STYLE_SCRIPTS[apiStyle],
      build: composeBuildScript(dbAdapter, apiStyle),
    },
    type: 'module',
    version: '0.1.0',
  };
}
