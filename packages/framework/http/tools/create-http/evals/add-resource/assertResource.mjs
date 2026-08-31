import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

async function directoryContainsTypeScript(directoryPath) {
  if (!(await pathExists(directoryPath))) {
    return false;
  }

  return (await collectTypeScriptFiles(directoryPath)).length > 0;
}

function extractPrismaModel(schema, modelName) {
  const escapedName = modelName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return schema.match(
    new RegExp(`\\bmodel\\s+${escapedName}\\s*\\{([\\s\\S]*?)\\n\\}`),
  )?.[1];
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
    const containsSource = await directoryContainsTypeScript(
      path.join(resourceRoot, relativeDirectory),
    );
    results.push({
      pass: containsSource,
      score: containsSource ? 1 : 0,
      reason: containsSource
        ? `${relativeDirectory} contains TypeScript source`
        : `${relativeDirectory} has no TypeScript source`,
    });
  }

  const schema = await fs.readFile(prismaSchemaPath, 'utf8');
  const modelFields = JSON.parse(context.vars.modelFields);
  for (const [modelName, expectedFields] of Object.entries(modelFields)) {
    const modelBody = extractPrismaModel(schema, modelName);
    const missingFields =
      modelBody === undefined
        ? expectedFields
        : expectedFields.filter(
            (fieldName) =>
              !new RegExp(`^\\s*${fieldName}\\s+`, 'm').test(modelBody),
          );
    results.push({
      pass: modelBody !== undefined && missingFields.length === 0,
      score: modelBody !== undefined && missingFields.length === 0 ? 1 : 0,
      reason:
        modelBody === undefined
          ? `Prisma model ${modelName} is missing`
          : missingFields.length === 0
            ? `Prisma model ${modelName} has its required fields`
            : `Prisma model ${modelName} is missing fields: ${missingFields.join(', ')}`,
    });
  }

  const fieldRules = JSON.parse(context.vars.fieldRules);
  for (const [modelName, fields] of Object.entries(fieldRules)) {
    const modelBody = extractPrismaModel(schema, modelName) ?? '';
    for (const [fieldName, expectedFragments] of Object.entries(fields)) {
      const fieldLine = modelBody.match(
        new RegExp(`^\\s*${fieldName}\\s+.*$`, 'm'),
      )?.[0];
      const missingFragments =
        fieldLine === undefined
          ? expectedFragments
          : expectedFragments.filter(
              (fragment) => !fieldLine.includes(fragment),
            );
      results.push({
        pass: fieldLine !== undefined && missingFragments.length === 0,
        score: fieldLine !== undefined && missingFragments.length === 0 ? 1 : 0,
        reason:
          fieldLine === undefined
            ? `${modelName}.${fieldName} is missing`
            : missingFragments.length === 0
              ? `${modelName}.${fieldName} satisfies its contract`
              : `${modelName}.${fieldName} is missing: ${missingFragments.join(', ')}`,
      });
    }
  }

  if (context.vars.requiresCascade === 'true') {
    const hasCascade = /@relation\([^)]*onDelete:\s*Cascade[^)]*\)/.test(
      schema,
    );
    results.push({
      pass: hasCascade,
      score: hasCascade ? 1 : 0,
      reason: hasCascade
        ? 'the owned relation uses cascade deletion'
        : 'the owned relation does not declare cascade deletion',
    });
  }

  const bootstrap = await fs.readFile(bootstrapPath, 'utf8');
  const resourceName = context.vars.resourceName;
  for (const moduleName of [
    `${resourceName}ContainerModule`,
    `${resourceName}PrismaContainerModule`,
  ]) {
    const isLoaded = new RegExp(`new\\s+${moduleName}\\s*\\(`).test(bootstrap);
    results.push({
      pass: isLoaded,
      score: isLoaded ? 1 : 0,
      reason: isLoaded
        ? `${moduleName} is loaded by bootstrap`
        : `${moduleName} is not loaded by bootstrap`,
    });
  }

  if (await pathExists(resourceRoot)) {
    const sourceFiles = await collectTypeScriptFiles(resourceRoot);
    const boundaryViolations = [];
    let combinedSource = '';

    for (const sourcePath of sourceFiles) {
      const relativePath = path.relative(resourceRoot, sourcePath);
      const source = await fs.readFile(sourcePath, 'utf8');
      combinedSource += `\n${source}`;
      if (
        relativePath.startsWith(`domain${path.sep}`) ||
        relativePath.startsWith(`application${path.sep}`)
      ) {
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

    const hasExpectedRoute = combinedSource.includes(context.vars.routePrefix);
    results.push({
      pass: hasExpectedRoute,
      score: hasExpectedRoute ? 1 : 0,
      reason: hasExpectedRoute
        ? `controller declares ${context.vars.routePrefix}`
        : `controller does not declare ${context.vars.routePrefix}`,
    });

    for (const decorator of JSON.parse(context.vars.expectedDecorators)) {
      const isDeclared = combinedSource.includes(`@${decorator}(`);
      results.push({
        pass: isDeclared,
        score: isDeclared ? 1 : 0,
        reason: isDeclared
          ? `controller declares an @${decorator} endpoint`
          : `controller does not declare an @${decorator} endpoint`,
      });
    }
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
