import {
  type SourceImport,
  type SourceNamedImport,
} from '../models/BootstrapSourceModel.js';

export function printSourceImport(sourceImport: SourceImport): string {
  const importKeyword: string =
    sourceImport.isTypeOnly === true ? 'import type' : 'import';
  const namedImports: string = (sourceImport.namedImports ?? [])
    .map((namedImport: SourceNamedImport): string =>
      namedImport.isTypeOnly === true
        ? `type ${namedImport.name}`
        : namedImport.name,
    )
    .join(', ');

  return `${importKeyword} { ${namedImports} } from '${sourceImport.moduleSpecifier}';`;
}
