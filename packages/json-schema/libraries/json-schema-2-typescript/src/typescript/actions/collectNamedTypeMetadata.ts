import {
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';

import { visitTypeMetadataChildren } from './visitTypeMetadataChildren.js';

export function collectNamedTypeMetadata(
  typeMetadata: TypeMetadata,
): TypeMetadata[] {
  const ancestorTypeMetadata: TypeMetadata[] = [];
  const cyclicTypeMetadataSet: Set<TypeMetadata> = new Set();
  const firstSeenTypeMetadata: TypeMetadata[] = [];
  const visitCountMap: Map<TypeMetadata, number> = new Map();

  function visit(node: TypeMetadata): void {
    const ancestorIndex: number = ancestorTypeMetadata.lastIndexOf(node);

    if (ancestorIndex !== -1) {
      for (
        let i: number = ancestorIndex;
        i < ancestorTypeMetadata.length;
        i += 1
      ) {
        cyclicTypeMetadataSet.add(ancestorTypeMetadata[i] as TypeMetadata);
      }
      return;
    }

    const visitCount: number = (visitCountMap.get(node) ?? 0) + 1;
    visitCountMap.set(node, visitCount);

    if (visitCount > 1) {
      return;
    }

    firstSeenTypeMetadata.push(node);
    ancestorTypeMetadata.push(node);

    visitTypeMetadataChildren(node, visit);

    ancestorTypeMetadata.pop();
  }

  visit(typeMetadata);

  const orderedNamedTypeMetadata: TypeMetadata[] = [];

  for (const node of firstSeenTypeMetadata) {
    if (shouldNameTypeMetadata(node, visitCountMap, cyclicTypeMetadataSet)) {
      orderedNamedTypeMetadata.push(node);
    }
  }

  return orderedNamedTypeMetadata;
}

function shouldNameTypeMetadata(
  typeMetadata: TypeMetadata,
  visitCountMap: Map<TypeMetadata, number>,
  cyclicTypeMetadataSet: Set<TypeMetadata>,
): boolean {
  if (typeMetadata.id !== undefined) {
    return true;
  }

  if (
    typeMetadata.kind === TypeMetadataKind.propertyType ||
    typeMetadata.kind === TypeMetadataKind.stringIndexSignatureType
  ) {
    return false;
  }

  return (
    (visitCountMap.get(typeMetadata) ?? 0) > 1 ||
    cyclicTypeMetadataSet.has(typeMetadata)
  );
}
