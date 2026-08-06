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

const DEFAULT_PORT: number = 3000;

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

export function generateBootstrapSource(model: BootstrapSourceModel): string {
  const project: Project = new Project({
    manipulationSettings: {
      quoteKind: QuoteKind.Single,
      useTrailingCommas: true,
    },
    useInMemoryFileSystem: true,
  });

  const sourceFile: SourceFile = project.createSourceFile('bootstrap.ts');
  const port: number = model.port ?? DEFAULT_PORT;

  for (const sourceImport of model.imports) {
    sourceFile.addImportDeclaration(toImportDeclarationStructure(sourceImport));
  }

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        initializer: String(port),
        name: 'PORT',
        type: 'number',
      },
    ],
  });

  const initializeContainerBodyStatements: string[] = [
    'const container: Container = new Container();',
    ...(model.initializeContainerBodyStatements ?? []),
    'return container;',
  ];

  sourceFile.addFunction({
    isAsync: false,
    isExported: false,
    name: 'initializeContainer',
    returnType: 'Container',
    statements: initializeContainerBodyStatements,
  });

  const applicationDeclaration: string =
    model.applicationType === undefined
      ? 'const app = await adapter.build();'
      : `const app: ${model.applicationType} = await adapter.build();`;

  const bootstrapBodyStatements: string[] = [
    'const container: Container = initializeContainer();',
    `const adapter: ${model.adapter.className} = new ${model.adapter.className}(
  container,
  ${model.adapter.optionsObjectLiteral},
);`,
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

  sourceFile.formatText({
    ensureNewLineAtEndOfFile: true,
  });

  return sourceFile.getFullText();
}
