import {
  Project,
  QuoteKind,
  type SourceFile,
  VariableDeclarationKind,
} from 'ts-morph';

import { type InitializeContainerSourceModel } from '../models/InitializeContainerSourceModel.js';
import { formatScaffoldSource } from './formatScaffoldSource.js';
import { toImportDeclarationStructure } from './toImportDeclarationStructure.js';

export async function generateInitializeContainerSource(
  model: InitializeContainerSourceModel,
): Promise<string> {
  const project: Project = new Project({
    manipulationSettings: {
      quoteKind: QuoteKind.Single,
      useTrailingCommas: true,
    },
    useInMemoryFileSystem: true,
  });

  const sourceFile: SourceFile = project.createSourceFile(
    'initializeContainer.ts',
  );

  for (const sourceImport of model.imports) {
    sourceFile.addImportDeclaration(toImportDeclarationStructure(sourceImport));
  }

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@inversifyjs/config',
    namedImports: [
      { name: 'ConfigContainerModule' },
      { isTypeOnly: true, name: 'ConfigObject' },
      { isTypeOnly: true, name: 'ConfigService' },
      { name: 'configServiceIdentifier' },
    ],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@inversifyjs/logger',
    namedImports: [{ name: 'LogLevel' }],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: '@inversifyjs/config-dotenv',
    namedImports: [{ name: 'envFile' }],
  });

  sourceFile.addImportDeclaration({
    moduleSpecifier: 'zod',
    namedImports: [{ name: 'z' }],
  });

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        initializer: '3000',
        name: 'defaultPort',
        type: 'number',
      },
    ],
  });

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        initializer: '65535',
        name: 'maxPort',
        type: 'number',
      },
    ],
  });

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        initializer: `z.object({
  DATABASE_URL: z.string().min(1),
  DEV_PROFILER_ENABLED: z.stringbool().default(false),
  LOG_LEVELS: z
    .string()
    .default('error,warn,info')
    .transform((value: string) =>
      value.split(',').map((level: string) => level.trim()),
    )
    .pipe(
      z.array(
        z.enum([
          LogLevel.ERROR,
          LogLevel.WARN,
          LogLevel.INFO,
          LogLevel.HTTP,
          LogLevel.VERBOSE,
          LogLevel.DEBUG,
          LogLevel.SILLY,
        ]),
      ),
    ),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().min(1).max(maxPort).default(defaultPort),
})`,
        name: 'appConfigSchema',
      },
    ],
  });

  sourceFile.addTypeAlias({
    isExported: true,
    name: 'AppConfig',
    type: 'z.infer<typeof appConfigSchema>',
  });

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        initializer: `ConfigContainerModule.fromOptions<AppConfig>({
  source: envFile(),
  validate: {
    validate: (input: ConfigObject): AppConfig => appConfigSchema.parse(input),
  },
})`,
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
    isExported: true,
    name: 'initializeContainer',
    returnType: 'Promise<Container>',
    statements: initializeContainerBodyStatements,
  });

  return formatScaffoldSource(
    'initializeContainer.ts',
    sourceFile.getFullText(),
  );
}
