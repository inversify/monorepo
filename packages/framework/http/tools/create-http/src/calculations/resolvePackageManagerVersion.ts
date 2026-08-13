import { PackageManager } from '../models/PackageManager.js';
import { type PackageManagersVersions } from '../models/PackageManagersVersions.js';

export function resolvePackageManagerVersion(
  packageManager: PackageManager,
  packageManagersVersions: PackageManagersVersions,
  yarnBerryVersion: string,
): string {
  if (packageManager === PackageManager.yarn) {
    return yarnBerryVersion;
  }

  return packageManagersVersions[packageManager];
}
