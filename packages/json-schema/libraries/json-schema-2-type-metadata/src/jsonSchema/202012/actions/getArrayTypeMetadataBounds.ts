import {
  type ArrayTypeMetadata,
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';

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
