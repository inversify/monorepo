import { type HttpAdapter } from './HttpAdapter.js';
import { type PackageManager } from './PackageManager.js';

export interface CreateHttpAppOptions {
  httpAdapter: HttpAdapter;
  packageManager: PackageManager;
  targetPath: string;
}
