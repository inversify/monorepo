import { type PackageManager } from './PackageManager.js';

export interface CreateHttpAppOptions {
  packageManager: PackageManager;
  targetPath: string;
}
