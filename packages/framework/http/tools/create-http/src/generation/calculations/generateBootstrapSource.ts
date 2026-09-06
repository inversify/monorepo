import prettier from 'prettier';
import { Project, QuoteKind, type SourceFile } from 'ts-morph';

import { type BootstrapSourceModel } from '../models/BootstrapSourceModel.js';
import { SCAFFOLD_PRETTIER_OPTIONS } from '../models/scaffoldPrettierOptions.js';
import { toImportDeclarationStructure } from './toImportDeclarationStructure.js';

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
    moduleSpecifier: './initializeContainer.js',
    namedImports: [
      { isTypeOnly: true, name: 'AppConfig' },
      { name: 'initializeContainer' },
    ],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: './provideOpenApi.js',
    namedImports: [{ name: 'provideOpenApi' }],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@inversifyjs/config',
    namedImports: [
      { isTypeOnly: true, name: 'ConfigService' },
      { name: 'configServiceIdentifier' },
    ],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@inversifyjs/logger',
    namedImports: [{ isTypeOnly: true, name: 'Logger' }],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '../../logger/models/loggerFactoryIdentifier.js',
    namedImports: [{ name: 'loggerFactoryIdentifier' }],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@inversifyjs/http-open-api/v3Dot2',
    namedImports: [{ name: 'SwaggerUiProvider' }],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@inversifyjs/http-validation',
    namedImports: [{ name: 'InversifyValidationErrorFilter' }],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@inversifyjs/open-api-validation/v3Dot2',
    namedImports: [{ name: 'OpenApiValidationPipe' }],
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
    'const loggerFactory: (context: string) => Logger = container.get(loggerFactoryIdentifier);',
    "const logger: Logger = loggerFactory('Bootstrap');",
    `const adapter: ${model.adapter.className} = new ${model.adapter.className}(
  container,
  ${model.adapter.optionsObjectLiteral},
);`,
    'const swaggerProvider: SwaggerUiProvider = provideOpenApi(container);',
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
