import { type TypeMetadata } from '@inversifyjs/json-schema-type-metadata';

import { type PrintTypeMetadataContext } from '../models/PrintTypeMetadataContext.js';
import { type TransformTypeMetadataToTypeScriptOptions } from '../models/TransformTypeMetadataToTypeScriptOptions.js';
import { collectNamedTypeMetadata } from './collectNamedTypeMetadata.js';
import { printTypeMetadataExpanded } from './printTypeMetadata.js';
import { toTypeScriptIdentifier } from './toTypeScriptIdentifier.js';

const DEFAULT_ROOT_NAME: string = 'Root';

export function transformTypeMetadataToTypeScript(
  typeMetadata: TypeMetadata,
  options?: TransformTypeMetadataToTypeScriptOptions,
): string {
  const orderedNamedTypeMetadata: TypeMetadata[] =
    collectNamedTypeMetadata(typeMetadata);
  const typeMetadataToNameMap: Map<TypeMetadata, string> =
    assignTypeScriptNames(orderedNamedTypeMetadata);

  if (!typeMetadataToNameMap.has(typeMetadata)) {
    const usedNames: Set<string> = new Set(typeMetadataToNameMap.values());
    const rootName: string = getUniqueTypeScriptName(
      options?.rootName ?? DEFAULT_ROOT_NAME,
      usedNames,
    );

    typeMetadataToNameMap.set(typeMetadata, rootName);
    orderedNamedTypeMetadata.push(typeMetadata);
  }

  const context: PrintTypeMetadataContext = {
    typeMetadataToNameMap,
  };

  return orderedNamedTypeMetadata
    .map((namedTypeMetadata: TypeMetadata) => {
      const name: string = typeMetadataToNameMap.get(
        namedTypeMetadata,
      ) as string;

      return `export type ${name} = ${printTypeMetadataExpanded(namedTypeMetadata, context)};`;
    })
    .join('\n');
}

function assignTypeScriptNames(
  orderedNamedTypeMetadata: TypeMetadata[],
): Map<TypeMetadata, string> {
  const typeMetadataToNameMap: Map<TypeMetadata, string> = new Map();
  const usedNames: Set<string> = new Set();
  let anonymousCount: number = 1;

  for (const namedTypeMetadata of orderedNamedTypeMetadata) {
    let baseName: string;

    if (namedTypeMetadata.id !== undefined) {
      baseName = toTypeScriptIdentifier(namedTypeMetadata.id);
    } else {
      baseName = `Type${anonymousCount.toString()}`;
      anonymousCount += 1;
    }

    const name: string = getUniqueTypeScriptName(baseName, usedNames);

    usedNames.add(name);
    typeMetadataToNameMap.set(namedTypeMetadata, name);
  }

  return typeMetadataToNameMap;
}

function getUniqueTypeScriptName(
  baseName: string,
  usedNames: Set<string>,
): string {
  if (!usedNames.has(baseName)) {
    return baseName;
  }

  let suffix: number = 2;
  let name: string = `${baseName}${suffix.toString()}`;

  while (usedNames.has(name)) {
    suffix += 1;
    name = `${baseName}${suffix.toString()}`;
  }

  return name;
}
