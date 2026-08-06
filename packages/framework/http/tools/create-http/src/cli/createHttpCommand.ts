import { createRequire } from 'node:module';

import * as clack from '@clack/prompts';
import { type ArgsDef, type CommandDef, defineCommand } from 'citty';

import {
  PACKAGE_MANAGERS,
  type PackageManager,
} from '../models/PackageManager.js';
import { buildProject } from '../services/buildProject.js';
import { createHttpApp } from '../services/createHttpApp.js';
import { installProjectDependencies } from '../services/installProjectDependencies.js';

const packageJson: {
  description: string;
  version: string;
} = createRequire(import.meta.url)('../../package.json') as {
  description: string;
  version: string;
};

const createHttpArgs: ArgsDef = {
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

    clack.intro('create-inversify-http');

    const spinner: ReturnType<typeof clack.spinner> = clack.spinner();
    let projectPath: string | undefined;

    spinner.start('Creating project files');

    try {
      projectPath = await createHttpApp({
        packageManager,
        targetPath: pathArg,
      });
      spinner.stop('Project files created');
    } catch (error: unknown) {
      spinner.stop('Failed to create project files');
      throw error;
    }

    spinner.start(`Installing dependencies with ${packageManager}`);

    try {
      await installProjectDependencies(projectPath, packageManager);
      spinner.stop('Dependencies installed');
    } catch (error: unknown) {
      spinner.stop('Failed to install dependencies');
      throw error;
    }

    spinner.start('Building project');

    try {
      await buildProject(projectPath, packageManager);
      spinner.stop('Project built');
    } catch (error: unknown) {
      spinner.stop('Failed to build project');
      throw error;
    }

    clack.outro(`Ready at ${projectPath}`);
  },
});
