import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import {
  ApiStyle,
  createHttpApp,
  DbAdapter,
  HttpAdapter,
  PackageManager,
} from '../../lib/index.js';

const execFileAsync = promisify(execFile);
const evalRoot = path.dirname(fileURLToPath(import.meta.url));
const workspacesRoot = path.join(evalRoot, 'workspaces');

const API_STYLES = [
  { directory: 'code-first', value: ApiStyle.codeFirst },
  { directory: 'schema-first', value: ApiStyle.schemaFirst },
];
const RESOURCES = ['product', 'order'];

if (path.dirname(workspacesRoot) !== evalRoot) {
  throw new Error(
    'Refusing to recreate workspaces outside the evaluation root.',
  );
}

await fs.rm(workspacesRoot, { force: true, recursive: true });
await fs.mkdir(workspacesRoot, { recursive: true });

for (const apiStyle of API_STYLES) {
  for (const name of RESOURCES) {
    const workspacePath = path.join(workspacesRoot, apiStyle.directory, name);

    await createHttpApp({
      apiStyle: apiStyle.value,
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
}
