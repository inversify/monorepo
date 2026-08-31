import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import {
  createHttpApp,
  DbAdapter,
  HttpAdapter,
  PackageManager,
} from '../../lib/index.js';

const execFileAsync = promisify(execFile);
const evalRoot = path.dirname(fileURLToPath(import.meta.url));
const workspacesRoot = path.join(evalRoot, 'workspaces');

if (path.dirname(workspacesRoot) !== evalRoot) {
  throw new Error(
    'Refusing to recreate workspaces outside the evaluation root.',
  );
}

await fs.rm(workspacesRoot, { force: true, recursive: true });
await fs.mkdir(workspacesRoot, { recursive: true });

for (const name of ['product', 'order']) {
  const workspacePath = path.join(workspacesRoot, name);

  await createHttpApp({
    dbAdapter: DbAdapter.prismaPostgresql,
    httpAdapter: HttpAdapter.express,
    packageManager: PackageManager.pnpm,
    targetPath: workspacePath,
  });

  await execFileAsync(
    process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
    ['install', '--ignore-scripts'],
    { cwd: workspacePath },
  );
}
