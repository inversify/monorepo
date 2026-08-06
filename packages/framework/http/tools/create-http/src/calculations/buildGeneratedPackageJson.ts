import { type PackageManager } from '../models/PackageManager.js';

export interface PackageManagersVersions {
  npm: string;
  pnpm: string;
  yarn: string;
}

export interface ScaffoldPackageJson {
  description?: string;
  devDependencies: Record<string, string>;
  private?: boolean;
}

export function buildGeneratedPackageJson(
  packageName: string,
  packageManager: PackageManager,
  packageManagerVersion: string,
  scaffoldPackageJson: ScaffoldPackageJson,
): Record<string, unknown> {
  return {
    devDependencies: scaffoldPackageJson.devDependencies,
    name: packageName,
    packageManager: `${packageManager}@${packageManagerVersion}`,
    private: true,
    scripts: {
      build: 'tsc',
      format: 'prettier --write ./src',
      lint: 'eslint ./src',
    },
    type: 'module',
    version: '0.1.0',
  };
}
