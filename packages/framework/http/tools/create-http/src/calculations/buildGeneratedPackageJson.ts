import { type PackageManager } from '../models/PackageManager.js';

export function buildGeneratedPackageJson(
  packageName: string,
  packageManager: PackageManager,
  packageManagerVersion: string,
  dependencies: Record<string, string>,
  devDependencies: Record<string, string>,
): Record<string, unknown> {
  return {
    dependencies,
    devDependencies,
    name: packageName,
    packageManager: `${packageManager}@${packageManagerVersion}`,
    private: true,
    scripts: {
      build: 'tsc',
      format: 'prettier --write ./src',
      lint: 'eslint ./src',
      serve: 'node ./dist/index.js',
    },
    type: 'module',
    version: '0.1.0',
  };
}
