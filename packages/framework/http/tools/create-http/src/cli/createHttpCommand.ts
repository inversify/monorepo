import { createRequire } from 'node:module';

import * as clack from '@clack/prompts';
import { type ArgsDef, type CommandDef, defineCommand } from 'citty';

import { isMissingGitIdentityError } from '../calculations/isMissingGitIdentityError.js';
import { HTTP_ADAPTERS, type HttpAdapter } from '../models/HttpAdapter.js';
import {
  PACKAGE_MANAGERS,
  type PackageManager,
} from '../models/PackageManager.js';
import { buildProject } from '../services/buildProject.js';
import { createHttpApp } from '../services/createHttpApp.js';
import {
  createInitialGitCommit,
  initializeGitRepository,
} from '../services/initializeGitRepository.js';
import { installProjectDependencies } from '../services/installProjectDependencies.js';

const packageJson: {
  description: string;
  version: string;
} = createRequire(import.meta.url)('../../package.json') as {
  description: string;
  version: string;
};

const createHttpArgs: ArgsDef = {
  adapter: {
    alias: 'a',
    description: 'HTTP adapter to install and configure',
    options: [...HTTP_ADAPTERS],
    type: 'enum',
  },
  packageManager: {
    alias: 'pm',
    description: 'Package manager to configure in the generated project',
    options: [...PACKAGE_MANAGERS],
    type: 'enum',
  },
  path: {
    description: 'Relative or absolute path for the new project',
    required: true,
    type: 'positional',
  },
};

function isPackageManager(value: unknown): value is PackageManager {
  return (
    typeof value === 'string' &&
    (PACKAGE_MANAGERS as readonly string[]).includes(value)
  );
}

function isHttpAdapter(value: unknown): value is HttpAdapter {
  return (
    typeof value === 'string' &&
    (HTTP_ADAPTERS as readonly string[]).includes(value)
  );
}

async function resolvePackageManager(
  packageManagerArg: string | undefined,
): Promise<PackageManager | undefined> {
  if (packageManagerArg !== undefined) {
    if (!isPackageManager(packageManagerArg)) {
      throw new Error(`Unsupported package manager: ${packageManagerArg}`);
    }

    return packageManagerArg;
  }

  const packageManagerSelection: PackageManager | symbol = await clack.select({
    message: 'Choose a package manager',
    options: PACKAGE_MANAGERS.map((packageManager: PackageManager) => ({
      label: packageManager,
      value: packageManager,
    })),
  });

  if (clack.isCancel(packageManagerSelection)) {
    clack.cancel('Scaffold cancelled.');
    return undefined;
  }

  if (!isPackageManager(packageManagerSelection)) {
    throw new Error(
      `Unsupported package manager: ${String(packageManagerSelection)}`,
    );
  }

  return packageManagerSelection;
}

async function resolveHttpAdapter(
  httpAdapterArg: string | undefined,
): Promise<HttpAdapter | undefined> {
  if (httpAdapterArg !== undefined) {
    if (!isHttpAdapter(httpAdapterArg)) {
      throw new Error(`Unsupported HTTP adapter: ${httpAdapterArg}`);
    }

    return httpAdapterArg;
  }

  const httpAdapterSelection: HttpAdapter | symbol = await clack.select({
    message: 'Choose an HTTP adapter',
    options: HTTP_ADAPTERS.map((httpAdapter: HttpAdapter) => ({
      label: httpAdapter,
      value: httpAdapter,
    })),
  });

  if (clack.isCancel(httpAdapterSelection)) {
    clack.cancel('Scaffold cancelled.');
    return undefined;
  }

  if (!isHttpAdapter(httpAdapterSelection)) {
    throw new Error(
      `Unsupported HTTP adapter: ${String(httpAdapterSelection)}`,
    );
  }

  return httpAdapterSelection;
}

export const createHttpCommand: CommandDef = defineCommand({
  args: createHttpArgs,
  meta: {
    description: packageJson.description,
    name: 'create-inversify-http',
    version: packageJson.version,
  },
  async run({ args }: { args: Record<string, unknown> }): Promise<void> {
    const pathArg: unknown = args['path'];

    if (typeof pathArg !== 'string') {
      throw new Error('Path argument is required.');
    }

    const packageManagerArg: unknown = args['packageManager'];
    const packageManager: PackageManager | undefined =
      await resolvePackageManager(
        typeof packageManagerArg === 'string' ? packageManagerArg : undefined,
      );

    if (packageManager === undefined) {
      return;
    }

    const httpAdapterArg: unknown = args['adapter'];
    const httpAdapter: HttpAdapter | undefined = await resolveHttpAdapter(
      typeof httpAdapterArg === 'string' ? httpAdapterArg : undefined,
    );

    if (httpAdapter === undefined) {
      return;
    }

    clack.intro('create-inversify-http');

    const spinner: ReturnType<typeof clack.spinner> = clack.spinner();
    let projectPath: string | undefined;

    spinner.start('Creating project files');

    try {
      projectPath = await createHttpApp({
        httpAdapter,
        packageManager,
        targetPath: pathArg,
      });
      spinner.stop('Project files created');
    } catch (error: unknown) {
      spinner.error('Failed to create project files');
      throw error;
    }

    spinner.start('Initializing git repository');

    try {
      await initializeGitRepository(projectPath);
      spinner.stop('Git repository initialized');
    } catch {
      spinner.cancel('Skipped git initialization');
    }

    spinner.start(`Installing dependencies with ${packageManager}`);

    try {
      await installProjectDependencies(projectPath, packageManager);
      spinner.stop('Dependencies installed');
    } catch (error: unknown) {
      spinner.error('Failed to install dependencies');
      throw error;
    }

    spinner.start('Building project');

    try {
      await buildProject(projectPath, packageManager);
      spinner.stop('Project built');
    } catch (error: unknown) {
      spinner.error('Failed to build project');
      throw error;
    }

    spinner.start('Creating initial commit');

    try {
      await createInitialGitCommit(projectPath);
      spinner.stop('Initial commit created');
    } catch (error: unknown) {
      if (isMissingGitIdentityError(error)) {
        spinner.cancel('Skipped initial commit');
      } else {
        spinner.error('Failed to create initial commit');
        throw error;
      }
    }

    clack.outro(`Ready at ${projectPath}`);
  },
});
