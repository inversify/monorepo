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

function findPrismaFieldMatch(modelBody, fieldName) {
  const escapedName = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^[^\\S\\n]*${escapedName}\\s+.*$`, 'm').exec(modelBody);
}

function findPrismaFieldLine(modelBody, fieldName) {
  return findPrismaFieldMatch(modelBody, fieldName)?.[0];
}

function extractPrismaFieldAttribute(modelBody, fieldName) {
  const match = findPrismaFieldMatch(modelBody, fieldName);

  if (match === null) {
    return undefined;
  }

  let depth = 0;
  let end = match.index;

  for (let index = match.index; index < modelBody.length; index++) {
    const character = modelBody[index];

    if (character === '(') {
      depth += 1;
    } else if (character === ')') {
      depth -= 1;
    }

    if (character === '\n' && depth <= 0) {
      break;
    }

    end = index + 1;
  }

  return modelBody.slice(match.index, end);
}

function extractPrismaFieldType(fieldAttribute) {
  return /^\s*\S+\s+(\S+)/.exec(fieldAttribute)?.[1];
}

function fieldContainsFragment(fieldAttribute, fragment) {
  if (fragment.startsWith('@') || fragment.includes(':')) {
    return fieldAttribute.includes(fragment);
  }

  return extractPrismaFieldType(fieldAttribute) === fragment;
}

async function readTextIfExists(filePath) {
  if (!(await pathExists(filePath))) {
    return undefined;
  }

  return fs.readFile(filePath, 'utf8');
}

function resolveApiStyle(vars) {
  const apiStyle = vars.apiStyle;

  if (apiStyle !== 'code-first' && apiStyle !== 'schema-first') {
    throw new Error(
      `Unknown apiStyle="${String(apiStyle)}". Expected "code-first" or "schema-first".`,
    );
  }

  return apiStyle;
}

function pushCheck(results, pass, reason) {
  results.push({
    pass,
    score: pass ? 1 : 0,
    reason,
  });
}

async function assertApiStyleContract(results, options) {
  const generateApiTypesPath = path.join(
    options.workspacePath,
    'src',
    'app',
    'scripts',
    'generateApiTypes.ts',
  );
  const generatedApiTypesPath = path.join(
    options.workspacePath,
    'src',
    'generated',
    'api',
    'index.ts',
  );
  const provideOpenApiPath = path.join(
    options.workspacePath,
    'src',
    'app',
    'scripts',
    'provideOpenApi.ts',
  );
  const generateApiTypesExists = await pathExists(generateApiTypesPath);
  const generatedApiTypes = await readTextIfExists(generatedApiTypesPath);
  const provideOpenApi = await readTextIfExists(provideOpenApiPath);
  const hasOasSchema = options.apiModelsSource.includes('@OasSchema');
  const hasToSchema = options.apiSource.includes('toSchema(');
  const hasComponentRef = options.apiSource.includes('#/components/schemas/');
  const importsGeneratedApi = options.apiSource.includes('generated/api');

  if (options.apiStyle === 'code-first') {
    pushCheck(
      results,
      hasOasSchema,
      hasOasSchema
        ? 'code-first API models use @OasSchema'
        : 'code-first API models do not use @OasSchema',
    );
    pushCheck(
      results,
      hasToSchema,
      hasToSchema
        ? 'code-first controllers call toSchema'
        : 'code-first controllers do not call toSchema',
    );
    pushCheck(
      results,
      !hasComponentRef,
      hasComponentRef
        ? 'code-first controllers reference component schemas'
        : 'code-first controllers do not $ref component schemas',
    );
    pushCheck(
      results,
      !importsGeneratedApi,
      importsGeneratedApi
        ? 'code-first API code imports generated/api'
        : 'code-first API code does not import generated/api',
    );
    pushCheck(
      results,
      !generateApiTypesExists,
      generateApiTypesExists
        ? 'code-first workspace has generateApiTypes.ts'
        : 'code-first workspace does not include generateApiTypes.ts',
    );
    pushCheck(
      results,
      generatedApiTypes === undefined,
      generatedApiTypes === undefined
        ? 'code-first workspace does not include src/generated/api'
        : 'code-first workspace includes src/generated/api',
    );
    return;
  }

  const hasJsonSchemaExport = /export const \w+Schema/.test(
    options.apiModelsSource,
  );
  const provideOpenApiImportsResource =
    provideOpenApi !== undefined &&
    provideOpenApi.includes(`${options.resourceDirectory}/api/models`);
  const generatedTypesMentionResource =
    generatedApiTypes !== undefined &&
    hasIdentifier(generatedApiTypes, `${options.resourceName}V1`);

  pushCheck(
    results,
    hasJsonSchemaExport,
    hasJsonSchemaExport
      ? 'schema-first API models export JSON schemas'
      : 'schema-first API models do not export JSON schemas',
  );
  pushCheck(
    results,
    !hasOasSchema,
    hasOasSchema
      ? 'schema-first API models still use @OasSchema'
      : 'schema-first API models do not use @OasSchema',
  );
  pushCheck(
    results,
    hasComponentRef,
    hasComponentRef
      ? 'schema-first controllers $ref component schemas'
      : 'schema-first controllers do not $ref component schemas',
  );
  pushCheck(
    results,
    !hasToSchema,
    hasToSchema
      ? 'schema-first controllers still call toSchema'
      : 'schema-first controllers do not call toSchema',
  );
  pushCheck(
    results,
    importsGeneratedApi,
    importsGeneratedApi
      ? 'schema-first API code imports generated/api'
      : 'schema-first API code does not import generated/api',
  );
  pushCheck(
    results,
    generateApiTypesExists,
    generateApiTypesExists
      ? 'schema-first workspace includes generateApiTypes.ts'
      : 'schema-first workspace is missing generateApiTypes.ts',
  );
  pushCheck(
    results,
    generatedTypesMentionResource,
    generatedTypesMentionResource
      ? `src/generated/api declares ${options.resourceName}V1`
      : `src/generated/api does not declare ${options.resourceName}V1`,
  );
  pushCheck(
    results,
    provideOpenApiImportsResource,
    provideOpenApiImportsResource
      ? 'provideOpenApi loads the resource JSON schemas'
      : 'provideOpenApi does not import the resource JSON schemas',
  );
}

export default async function assertResource(_output, context) {
  const apiStyle = resolveApiStyle(context.vars);
  const workspacePath = path.resolve(evalRoot, context.vars.workspaceDir);
  const resourceRoot = path.join(
    workspacePath,
    'src',
    context.vars.resourceDirectory,
  );
  const prismaSchemaPath = path.join(workspacePath, 'prisma', 'schema.prisma');
  const initializeContainerPath = path.join(
    workspacePath,
    'src',
    'app',
    'scripts',
    'initializeContainer.ts',
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
        const fieldAttribute = extractPrismaFieldAttribute(
          modelBody,
          fieldName,
        );
        const missingFragments =
          fieldAttribute === undefined
            ? expectedFragments
            : expectedFragments.filter(
                (fragment) => !fieldContainsFragment(fieldAttribute, fragment),
              );
        results.push({
          pass: fieldAttribute !== undefined && missingFragments.length === 0,
          score:
            fieldAttribute !== undefined && missingFragments.length === 0
              ? 1
              : 0,
          reason:
            fieldAttribute === undefined
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

  const initializeContainer = await readTextIfExists(initializeContainerPath);
  const resourceName = context.vars.resourceName;

  if (initializeContainer === undefined) {
    results.push({
      pass: false,
      score: 0,
      reason: 'src/app/scripts/initializeContainer.ts is missing',
    });
  } else {
    for (const moduleName of [
      `${resourceName}ContainerModule`,
      `${resourceName}PrismaContainerModule`,
    ]) {
      const isLoaded = new RegExp(`new\\s+${moduleName}\\s*\\(`).test(
        initializeContainer,
      );
      results.push({
        pass: isLoaded,
        score: isLoaded ? 1 : 0,
        reason: isLoaded
          ? `${moduleName} is loaded by initializeContainer`
          : `${moduleName} is not loaded by initializeContainer`,
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
    let apiModelsSource = '';

    for (const sourcePath of sourceFiles) {
      const relativePath = path.relative(resourceRoot, sourcePath);
      const source = await fs.readFile(sourcePath, 'utf8');
      combinedSource += `\n${source}`;

      const layer = relativePath.split(path.sep)[0];
      if (layer in layerSources) {
        layerSources[layer] += `\n${source}`;
      }

      if (relativePath.startsWith(`api${path.sep}models${path.sep}`)) {
        apiModelsSource += `\n${source}`;
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

    await assertApiStyleContract(results, {
      apiModelsSource,
      apiSource: layerSources.api,
      apiStyle,
      resourceDirectory: context.vars.resourceDirectory,
      resourceName,
      workspacePath,
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
