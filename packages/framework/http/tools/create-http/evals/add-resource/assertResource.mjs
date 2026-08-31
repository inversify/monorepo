import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const evalRoot = path.dirname(fileURLToPath(import.meta.url));

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function collectTypeScriptFiles(directoryPath) {
  const files = [];

  for (const entry of await fs.readdir(directoryPath, {
    withFileTypes: true,
  })) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectTypeScriptFiles(entryPath)));
    } else if (entry.name.endsWith('.ts')) {
      files.push(entryPath);
    }
  }

  return files;
}

async function runProjectCommand(workspacePath, command) {
  try {
    await execFileAsync(
      process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
      ['run', command],
      { cwd: workspacePath, timeout: 120_000 },
    );
    return { pass: true, score: 1, reason: `pnpm run ${command} passed` };
  } catch (error) {
    const detail =
      error?.stderr || error?.stdout || error?.message || String(error);
    return {
      pass: false,
      score: 0,
      reason: `pnpm run ${command} failed: ${String(detail).slice(-1200)}`,
    };
  }
}

export default async function assertResource(_output, context) {
  const workspacePath = path.resolve(evalRoot, context.vars.workspaceDir);
  const resourceRoot = path.join(
    workspacePath,
    'src',
    context.vars.resourceDirectory,
  );
  const prismaSchemaPath = path.join(workspacePath, 'prisma', 'schema.prisma');
  const bootstrapPath = path.join(
    workspacePath,
    'src',
    'app',
    'scripts',
    'bootstrap.ts',
  );
  const results = [];

  const requiredDirectories = [
    'domain',
    'application/ports',
    'api/controllers',
    'api/models',
    'adapter/prisma',
    'adapter/inversify',
  ];

  for (const relativeDirectory of requiredDirectories) {
    const exists = await pathExists(path.join(resourceRoot, relativeDirectory));
    results.push({
      pass: exists,
      score: exists ? 1 : 0,
      reason: exists
        ? `${relativeDirectory} exists`
        : `${relativeDirectory} is missing`,
    });
  }

  const schema = await fs.readFile(prismaSchemaPath, 'utf8');
  for (const modelName of context.vars.prismaModels.split(',')) {
    const modelPattern = new RegExp(`\\bmodel\\s+${modelName.trim()}\\s*\\{`);
    const exists = modelPattern.test(schema);
    results.push({
      pass: exists,
      score: exists ? 1 : 0,
      reason: exists
        ? `Prisma model ${modelName.trim()} exists`
        : `Prisma model ${modelName.trim()} is missing`,
    });
  }

  const bootstrap = await fs.readFile(bootstrapPath, 'utf8');
  const hasResourceWiring = bootstrap
    .toLowerCase()
    .includes(context.vars.resourceDirectory.toLowerCase());
  results.push({
    pass: hasResourceWiring,
    score: hasResourceWiring ? 1 : 0,
    reason: hasResourceWiring
      ? 'resource modules are referenced by bootstrap'
      : 'resource modules are not referenced by bootstrap',
  });

  if (await pathExists(resourceRoot)) {
    const sourceFiles = await collectTypeScriptFiles(resourceRoot);
    const boundaryViolations = [];

    for (const sourcePath of sourceFiles) {
      const relativePath = path.relative(resourceRoot, sourcePath);
      if (
        relativePath.startsWith(`domain${path.sep}`) ||
        relativePath.startsWith(`application${path.sep}`)
      ) {
        const source = await fs.readFile(sourcePath, 'utf8');
        if (
          source.includes('/generated/prisma/') ||
          source.includes('@inversifyjs/http')
        ) {
          boundaryViolations.push(relativePath);
        }
      }
    }

    results.push({
      pass: boundaryViolations.length === 0,
      score: boundaryViolations.length === 0 ? 1 : 0,
      reason:
        boundaryViolations.length === 0
          ? 'domain and application layers are independent of Prisma and HTTP'
          : `architecture boundary violations: ${boundaryViolations.join(', ')}`,
    });
  }

  if (await pathExists(path.join(workspacePath, 'node_modules'))) {
    results.push(await runProjectCommand(workspacePath, 'build'));
    results.push(await runProjectCommand(workspacePath, 'lint'));
  } else {
    results.push({
      pass: false,
      score: 0,
      reason:
        'dependencies are not installed; run the workspace preparation script',
    });
  }

  const passed = results.every((result) => result.pass);
  return {
    pass: passed,
    score: results.filter((result) => result.pass).length / results.length,
    reason: passed
      ? 'The resource satisfies all deterministic checks.'
      : results
          .filter((result) => !result.pass)
          .map((result) => result.reason)
          .join('\n'),
    componentResults: results,
  };
}
