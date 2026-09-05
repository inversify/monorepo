import fs from 'node:fs/promises';
import path from 'node:path';

import { buildGeneratedPackageJson } from '../calculations/buildGeneratedPackageJson.js';
import { getBaseTemplateRoot } from '../calculations/getTemplatesRoot.js';
import { readYarnBerryVersion } from '../calculations/readYarnBerryVersion.js';
import { resolvePackageManagerVersion } from '../calculations/resolvePackageManagerVersion.js';
import {
  resolvePackageName,
  resolveProjectPath,
} from '../calculations/resolveProjectPath.js';
import {
  type ComposedScaffoldDependencies,
  composeScaffoldDependencies,
} from '../dependencies/calculations/composeScaffoldDependencies.js';
import { type DependencyCatalog } from '../dependencies/models/DependencyCatalog.js';
import { createBootstrapSourceModel } from '../generation/calculations/createBootstrapSourceModel.js';
import { createPnpmWorkspaceSourceModel } from '../generation/calculations/createPnpmWorkspaceSourceModel.js';
import { createTodoControllerSourceModel } from '../generation/calculations/createTodoControllerSourceModel.js';
import { createYarnRcSourceModel } from '../generation/calculations/createYarnRcSourceModel.js';
import { generateIndexSource } from '../generation/calculations/generateIndexSource.js';
import { generatePnpmWorkspaceSource } from '../generation/calculations/generatePnpmWorkspaceSource.js';
import { generateYarnRcSource } from '../generation/calculations/generateYarnRcSource.js';
import { type YarnRcSourceModel } from '../generation/models/YarnRcSourceModel.js';
import { type CreateHttpAppOptions } from '../models/CreateHttpAppOptions.js';
import { PackageManager } from '../models/PackageManager.js';
import { type PackageManagersVersions } from '../models/PackageManagersVersions.js';
import { formatGeneratedProjectSources } from './formatGeneratedProjectSources.js';
import { writeBootstrapSourceFile } from './writeBootstrapSourceFile.js';
import { writeCommonSourceFiles } from './writeCommonSourceFiles.js';
import { writeLoggerSourceFiles } from './writeLoggerSourceFiles.js';
import { writeStatusSourceFiles } from './writeStatusSourceFiles.js';
import { writeTodoSourceFiles } from './writeTodoSourceFiles.js';

async function assertTargetIsAvailable(projectPath: string): Promise<void> {
  try {
    const directoryEntries: string[] = await fs.readdir(projectPath);

    if (directoryEntries.length > 0) {
      throw new Error(
        `Target directory "${projectPath}" already exists and is not empty.`,
      );
    }
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return;
    }

    throw error;
  }
}

async function copyTemplateFile(
  sourceRelativePath: string,
  projectPath: string,
  baseTemplateRoot: string,
  destinationRelativePath: string = sourceRelativePath,
): Promise<void> {
  const sourcePath: string = path.join(baseTemplateRoot, sourceRelativePath);
  const destinationPath: string = path.join(
    projectPath,
    destinationRelativePath,
  );

  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  await fs.copyFile(sourcePath, destinationPath);
}

async function copyTemplateDirectory(
  sourceRelativePath: string,
  projectPath: string,
  baseTemplateRoot: string,
  destinationRelativePath: string = sourceRelativePath,
): Promise<void> {
  const sourcePath: string = path.join(baseTemplateRoot, sourceRelativePath);
  const destinationPath: string = path.join(
    projectPath,
    destinationRelativePath,
  );

  await fs.cp(sourcePath, destinationPath, { recursive: true });
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const fileContents: string = await fs.readFile(filePath, 'utf8');

  return JSON.parse(fileContents) as T;
}

export async function createHttpApp(
  options: CreateHttpAppOptions,
): Promise<string> {
  const projectPath: string = resolveProjectPath(options.targetPath);
  const packageName: string = resolvePackageName(projectPath);
  const baseTemplateRoot: string = getBaseTemplateRoot();

  await assertTargetIsAvailable(projectPath);
  await fs.mkdir(projectPath, { recursive: true });

  const dependencyCatalog: DependencyCatalog = await readJsonFile(
    path.join(baseTemplateRoot, 'package.json'),
  );
  const packageManagersVersions: PackageManagersVersions = await readJsonFile(
    path.join(baseTemplateRoot, 'package-managers.json'),
  );
  const yarnBerryVersion: string = await readYarnBerryVersion(baseTemplateRoot);

  const packageManager: PackageManager = options.packageManager;
  const packageManagerVersion: string = resolvePackageManagerVersion(
    packageManager,
    packageManagersVersions,
    yarnBerryVersion,
  );
  const composedDependencies: ComposedScaffoldDependencies =
    composeScaffoldDependencies(
      dependencyCatalog,
      options.httpAdapter,
      options.dbAdapter,
    );

  const yarnRcSourceModel: YarnRcSourceModel | undefined =
    packageManager === PackageManager.yarn
      ? createYarnRcSourceModel(options.httpAdapter, options.dbAdapter)
      : undefined;

  const generatedPackageJson: Record<string, unknown> =
    buildGeneratedPackageJson(
      packageName,
      packageManager,
      packageManagerVersion,
      composedDependencies.dependencies,
      composedDependencies.devDependencies,
      options.dbAdapter,
      yarnRcSourceModel === undefined
        ? undefined
        : yarnRcSourceModel.dependenciesMeta,
    );

  const jsonIndentationSpaces: number = 2;

  await fs.writeFile(
    path.join(projectPath, 'package.json'),
    `${JSON.stringify(generatedPackageJson, undefined, jsonIndentationSpaces)}\n`,
    'utf8',
  );

  await copyTemplateFile(
    '.gitignore.template',
    projectPath,
    baseTemplateRoot,
    '.gitignore',
  );
  await copyTemplateFile('tsconfig.json', projectPath, baseTemplateRoot);
  await copyTemplateFile(
    'eslint.config.mjs.template',
    projectPath,
    baseTemplateRoot,
    'eslint.config.mjs',
  );
  await copyTemplateFile(
    'prettier.config.mjs.template',
    projectPath,
    baseTemplateRoot,
    'prettier.config.mjs',
  );
  await copyTemplateFile(
    '.env.example',
    projectPath,
    baseTemplateRoot,
    '.env.example',
  );
  await copyTemplateFile('.env.example', projectPath, baseTemplateRoot, '.env');
  await copyTemplateFile('docker-compose.yml', projectPath, baseTemplateRoot);
  await copyTemplateFile(
    'prisma.config.ts.template',
    projectPath,
    baseTemplateRoot,
    'prisma.config.ts',
  );
  await copyTemplateDirectory('prisma', projectPath, baseTemplateRoot);
  await copyTemplateDirectory('.agents/skills', projectPath, baseTemplateRoot);
  await copyTemplateFile(
    '.agents/skills/add-resource/SKILL.md',
    projectPath,
    baseTemplateRoot,
    '.claude/skills/add-resource/SKILL.md',
  );

  if (packageManager === PackageManager.pnpm) {
    await fs.writeFile(
      path.join(projectPath, 'pnpm-workspace.yaml'),
      generatePnpmWorkspaceSource(
        createPnpmWorkspaceSourceModel(options.httpAdapter),
      ),
      'utf8',
    );
  }

  if (yarnRcSourceModel !== undefined) {
    await fs.writeFile(
      path.join(projectPath, '.yarnrc.yml'),
      generateYarnRcSource(),
      'utf8',
    );
  }
  await fs.mkdir(path.join(projectPath, 'src'), { recursive: true });
  await fs.writeFile(
    path.join(projectPath, 'src/index.ts'),
    generateIndexSource(),
    'utf8',
  );
  await writeLoggerSourceFiles(projectPath);
  await writeStatusSourceFiles(projectPath);
  await writeCommonSourceFiles(projectPath);
  await writeTodoSourceFiles(
    projectPath,
    createTodoControllerSourceModel(options.httpAdapter),
  );
  await writeBootstrapSourceFile(
    projectPath,
    createBootstrapSourceModel(options.httpAdapter, options.dbAdapter),
  );
  await formatGeneratedProjectSources(projectPath);

  return projectPath;
}
