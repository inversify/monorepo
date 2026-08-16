import { type DbAdapter } from './DbAdapter.js';
import { type HttpAdapter } from './HttpAdapter.js';
import { type PackageManager } from './PackageManager.js';

export interface CreateHttpAppOptions {
  dbAdapter: DbAdapter;
  httpAdapter: HttpAdapter;
  packageManager: PackageManager;
  targetPath: string;
}
