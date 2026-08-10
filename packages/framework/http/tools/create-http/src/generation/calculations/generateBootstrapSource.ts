import prettier from 'prettier';
import {
  type ImportDeclarationStructure,
  type OptionalKind,
  Project,
  QuoteKind,
  type SourceFile,
  VariableDeclarationKind,
} from 'ts-morph';

import {
  type BootstrapSourceModel,
  type SourceImport,
  type SourceNamedImport,
} from '../models/BootstrapSourceModel.js';
import { SCAFFOLD_PRETTIER_OPTIONS } from '../models/scaffoldPrettierOptions.js';

function toImportDeclarationStructure(
  sourceImport: SourceImport,
): OptionalKind<ImportDeclarationStructure> {
  return {
    ...(sourceImport.defaultImport === undefined
      ? {}
      : { defaultImport: sourceImport.defaultImport }),
    ...(sourceImport.isTypeOnly === undefined
      ? {}
      : { isTypeOnly: sourceImport.isTypeOnly }),
    moduleSpecifier: sourceImport.moduleSpecifier,
    ...(sourceImport.namedImports === undefined
      ? {}
      : {
          namedImports: sourceImport.namedImports.map(
            (namedImport: SourceNamedImport) => ({
              ...(namedImport.alias === undefined
                ? {}
                : { alias: namedImport.alias }),
              ...(namedImport.isTypeOnly === undefined
                ? {}
                : { isTypeOnly: namedImport.isTypeOnly }),
              name: namedImport.name,
            }),
          ),
        }),
    ...(sourceImport.namespaceImport === undefined
      ? {}
      : { namespaceImport: sourceImport.namespaceImport }),
  };
}

export async function generateBootstrapSource(
  model: BootstrapSourceModel,
): Promise<string> {
  const project: Project = new Project({
    manipulationSettings: {
      quoteKind: QuoteKind.Single,
      useTrailingCommas: true,
    },
    useInMemoryFileSystem: true,
  });

  const sourceFile: SourceFile = project.createSourceFile('bootstrap.ts');

  for (const sourceImport of model.imports) {
    sourceFile.addImportDeclaration(toImportDeclarationStructure(sourceImport));
  }

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@inversifyjs/config',
    namedImports: [
      { name: 'ConfigContainerModule' },
      { isTypeOnly: true, name: 'ConfigService' },
      { name: 'configServiceIdentifier' },
    ],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@inversifyjs/config-dotenv',
    namedImports: [{ name: 'envFile' }],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@inversifyjs/http-open-api',
    namedImports: [{ name: 'SwaggerUiProvider' }],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@inversifyjs/http-validation',
    namedImports: [{ name: 'InversifyValidationErrorFilter' }],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@inversifyjs/open-api-validation/v3Dot1',
    namedImports: [{ name: 'OpenApiValidationPipe' }],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: 'zod',
    namedImports: [{ name: 'z' }],
  });

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        initializer:
          "z.object({\n  DATABASE_URL: z.string().min(1),\n  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),\n  PORT: z.coerce.number().min(1).max(65535).default(3000),\n})",
        name: 'appConfigSchema',
      },
    ],
  });

  sourceFile.addTypeAlias({
    name: 'AppConfig',
    type: 'z.infer<typeof appConfigSchema>',
  });

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        initializer:
          'ConfigContainerModule.fromOptions({\n  source: envFile(),\n  validate: appConfigSchema,\n})',
        name: 'configModule',
      },
    ],
  });

  const initializeContainerBodyStatements: string[] = [
    'const container: Container = new Container();',
    'await container.loadAsync(configModule);',
    ...(model.initializeContainerBodyStatements ?? []),
    'return container;',
  ];

  sourceFile.addFunction({
    isAsync: true,
    isExported: false,
    name: 'initializeContainer',
    returnType: 'Promise<Container>',
    statements: initializeContainerBodyStatements,
  });

  const applicationDeclaration: string =
    model.applicationType === undefined
      ? 'const app = await adapter.build();'
      : `const app: ${model.applicationType} = await adapter.build();`;

  const bootstrapBodyStatements: string[] = [
    'const container: Container = await initializeContainer();',
    'container.bind(InversifyValidationErrorFilter).toSelf().inSingletonScope();',
    'const configService: ConfigService<AppConfig> = container.get(configServiceIdentifier);',
    'const { PORT } = configService.get();',
    `const adapter: ${model.adapter.className} = new ${model.adapter.className}(
  container,
  ${model.adapter.optionsObjectLiteral},
);`,
    `const swaggerProvider: SwaggerUiProvider = new SwaggerUiProvider({
  api: {
    openApiObject: {
      info: {
        title: 'API',
        version: '1.0.0',
      },
      openapi: '3.1.1',
    },
    path: '/docs',
  },
  ui: {
    title: 'API docs',
  },
});`,
    'swaggerProvider.provide(container);',
    'adapter.useGlobalPipe(new OpenApiValidationPipe(swaggerProvider.openApiObject));',
    'adapter.useGlobalFilters(InversifyValidationErrorFilter);',
    applicationDeclaration,
    ...model.listenStatements,
  ];

  sourceFile.addFunction({
    isAsync: true,
    isExported: true,
    name: 'bootstrap',
    returnType: 'Promise<void>',
    statements: bootstrapBodyStatements,
  });

  return prettier.format(sourceFile.getFullText(), SCAFFOLD_PRETTIER_OPTIONS);
}
