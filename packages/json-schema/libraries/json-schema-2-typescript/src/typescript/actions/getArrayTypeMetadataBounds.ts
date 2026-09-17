import {
  type ArrayTypeMetadata,
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';

export function doesArrayTypeMetadataPrintAsUnion(
  typeMetadata: ArrayTypeMetadata,
): boolean {
  const minItems: number = getArrayTypeMetadataMinItems(typeMetadata);
  const maxItems: number = getArrayTypeMetadataMaxItems(typeMetadata);
  const prefixItemsLength: number = typeMetadata.prefixItems?.length ?? 0;
  const hasUnboundedRest: boolean =
    typeMetadata.child.kind !== TypeMetadataKind.noneType &&
    maxItems === Number.POSITIVE_INFINITY;

  if (prefixItemsLength === 0 && minItems === 0 && hasUnboundedRest) {
    return false;
  }

  if (minItems > maxItems) {
    return false;
  }

  if (hasUnboundedRest) {
    return minItems < prefixItemsLength;
  }

  return maxItems > minItems;
}

export function getArrayTypeMetadataItem(
  typeMetadata: ArrayTypeMetadata,
  index: number,
): TypeMetadata {
  return typeMetadata.prefixItems?.[index] ?? typeMetadata.child;
}

export function getArrayTypeMetadataMaxItems(
  typeMetadata: ArrayTypeMetadata,
): number {
  const prefixItemsLength: number = typeMetadata.prefixItems?.length ?? 0;
  let maxItems: number = typeMetadata.maxItems ?? Number.POSITIVE_INFINITY;

  if (typeMetadata.child.kind === TypeMetadataKind.noneType) {
    maxItems = Math.min(maxItems, prefixItemsLength);
  }

  return maxItems;
}

export function getArrayTypeMetadataMinItems(
  typeMetadata: ArrayTypeMetadata,
): number {
  return typeMetadata.minItems ?? 0;
}
