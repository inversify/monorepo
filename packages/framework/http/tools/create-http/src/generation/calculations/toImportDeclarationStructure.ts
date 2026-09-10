import { type ImportDeclarationStructure, type OptionalKind } from 'ts-morph';

import {
  type SourceImport,
  type SourceNamedImport,
} from '../models/BootstrapSourceModel.js';

export function toImportDeclarationStructure(
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
