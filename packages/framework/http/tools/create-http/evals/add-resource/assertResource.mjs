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

function toCamelCase(fieldName) {
  return fieldName.replaceAll(/_([a-z0-9])/g, (_match, character) =>
    character.toUpperCase(),
  );
}

function hasIdentifier(source, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escapedName}\\b`).test(source);
}

function hasClassProperty(source, fieldName) {
  const escapedName = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escapedName}\\s*[!:]`).test(source);
}

function mappedColumnNames(modelFields) {
  const columnNames = new Set();

  for (const fields of Object.values(modelFields)) {
    for (const fieldName of fields) {
      if (fieldName.includes('_')) {
        columnNames.add(fieldName);
      }
    }
  }

  return [...columnNames];
}

function isRelationForeignKey(columnName, fieldRules) {
  if (!columnName.endsWith('_id')) {
    return false;
  }

  const relationName = columnName.slice(0, -3);

  return Object.values(fieldRules).some((fields) => {
    const relationRules = fields[relationName];

    return (
      Array.isArray(relationRules) &&
      relationRules.some((fragment) => fragment.includes('@relation'))
    );
  });
}

function findPrismaFieldLine(modelBody, fieldName) {
  const escapedName = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return modelBody.match(new RegExp(`^\\s*${escapedName}\\s+.*$`, 'm'))?.[0];
}

async function readTextIfExists(filePath) {
  if (!(await pathExists(filePath))) {
    return undefined;
  }

  return fs.readFile(filePath, 'utf8');
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
    'application/models',
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

  const modelFields = JSON.parse(context.vars.modelFields);
  const fieldRules = JSON.parse(context.vars.fieldRules);
  const schema = await readTextIfExists(prismaSchemaPath);

  if (schema === undefined) {
    results.push({
      pass: false,
      score: 0,
      reason: 'prisma/schema.prisma is missing',
    });
  } else {
    for (const [modelName, expectedFields] of Object.entries(modelFields)) {
      const modelBody = extractPrismaModel(schema, modelName);
      const missingFields =
        modelBody === undefined
          ? expectedFields
          : expectedFields.filter(
              (fieldName) =>
                findPrismaFieldLine(modelBody, fieldName) === undefined,
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

    for (const [modelName, fields] of Object.entries(fieldRules)) {
      const modelBody = extractPrismaModel(schema, modelName) ?? '';
      for (const [fieldName, expectedFragments] of Object.entries(fields)) {
        const fieldLine = findPrismaFieldLine(modelBody, fieldName);
        const missingFragments =
          fieldLine === undefined
            ? expectedFragments
            : expectedFragments.filter(
                (fragment) => !fieldLine.includes(fragment),
              );
        results.push({
          pass: fieldLine !== undefined && missingFragments.length === 0,
          score:
            fieldLine !== undefined && missingFragments.length === 0 ? 1 : 0,
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
  }

  const bootstrap = await readTextIfExists(bootstrapPath);
  const resourceName = context.vars.resourceName;

  if (bootstrap === undefined) {
    results.push({
      pass: false,
      score: 0,
      reason: 'src/app/scripts/bootstrap.ts is missing',
    });
  } else {
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
  }

  if (await pathExists(resourceRoot)) {
    const sourceFiles = await collectTypeScriptFiles(resourceRoot);
    const boundaryViolations = [];
    const layerSources = {
      api: '',
      application: '',
      domain: '',
    };
    let combinedSource = '';
    let createRequestSource = '';
    let responseModelSource = '';

    for (const sourcePath of sourceFiles) {
      const relativePath = path.relative(resourceRoot, sourcePath);
      const source = await fs.readFile(sourcePath, 'utf8');
      combinedSource += `\n${source}`;

      const layer = relativePath.split(path.sep)[0];
      if (layer in layerSources) {
        layerSources[layer] += `\n${source}`;
      }

      if (relativePath.startsWith(`api${path.sep}models${path.sep}`)) {
        const fileName = path.basename(sourcePath);
        if (/create/i.test(fileName)) {
          createRequestSource += `\n${source}`;
        } else if (
          /V1\.ts$/.test(fileName) &&
          !/create|update|patch|paginated|request/i.test(fileName)
        ) {
          responseModelSource += `\n${source}`;
        }
      }

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

    const abovePrismaSource = `${layerSources.domain}\n${layerSources.application}\n${layerSources.api}`;
    const mappedColumns = mappedColumnNames(modelFields);
    const hasPersistencePortIdentifier = sourceFiles.some((sourcePath) =>
      /(?:^|[\\/])application[\\/]models[\\/].*PersistencePortIdentifier\.ts$/.test(
        path.relative(resourceRoot, sourcePath),
      ),
    );

    results.push({
      pass: hasPersistencePortIdentifier,
      score: hasPersistencePortIdentifier ? 1 : 0,
      reason: hasPersistencePortIdentifier
        ? 'application/models declares a persistence port identifier'
        : 'application/models does not declare a persistence port identifier',
    });

    for (const columnName of mappedColumns) {
      const domainName = toCamelCase(columnName);
      const leakedAbovePrisma = hasIdentifier(abovePrismaSource, columnName);

      results.push({
        pass: !leakedAbovePrisma,
        score: leakedAbovePrisma ? 0 : 1,
        reason: leakedAbovePrisma
          ? `domain, application, or API still use database column ${columnName}`
          : `${columnName} stays behind the Prisma adapter`,
      });

      if (isRelationForeignKey(columnName, fieldRules)) {
        continue;
      }

      const domainHasName = hasIdentifier(layerSources.domain, domainName);
      results.push({
        pass: domainHasName,
        score: domainHasName ? 1 : 0,
        reason: domainHasName
          ? `domain exposes ${domainName}`
          : `domain does not expose ${domainName}`,
      });

      const apiHasName = hasIdentifier(layerSources.api, domainName);
      results.push({
        pass: apiHasName,
        score: apiHasName ? 1 : 0,
        reason: apiHasName
          ? `API exposes ${domainName}`
          : `API does not expose ${domainName}`,
      });
    }

    const nestedField = context.vars.nestedField;
    if (typeof nestedField === 'string' && nestedField.length > 0) {
      const createAcceptsNested =
        createRequestSource.length > 0 &&
        hasClassProperty(createRequestSource, nestedField);
      results.push({
        pass: createAcceptsNested,
        score: createAcceptsNested ? 1 : 0,
        reason: createAcceptsNested
          ? `create request accepts ${nestedField}`
          : `create request does not accept ${nestedField}`,
      });

      const responseIncludesNested =
        responseModelSource.length > 0 &&
        hasClassProperty(responseModelSource, nestedField);
      results.push({
        pass: responseIncludesNested,
        score: responseIncludesNested ? 1 : 0,
        reason: responseIncludesNested
          ? `get response includes ${nestedField}`
          : `get response does not include ${nestedField}`,
      });
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
