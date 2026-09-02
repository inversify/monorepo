import {
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';

export function collectPropertyTypeMetadataChildren(
  typeMetadata: TypeMetadata,
): TypeMetadata[] {
  if (typeMetadata.kind === TypeMetadataKind.propertyType) {
    return [typeMetadata.child];
  }

  if (
    typeMetadata.kind !== TypeMetadataKind.and &&
    typeMetadata.kind !== TypeMetadataKind.or
  ) {
    return [];
  }

  const propertyTypeMetadata: {
    child: TypeMetadata;
    index: number;
  }[] = [];

  for (const child of typeMetadata.children) {
    if (child.kind === TypeMetadataKind.propertyType) {
      propertyTypeMetadata.push({
        child: child.child,
        index: Number.parseInt(child.property, 10),
      });
    }
  }

  propertyTypeMetadata.sort(
    (
      left: { child: TypeMetadata; index: number },
      right: { child: TypeMetadata; index: number },
    ) => left.index - right.index,
  );

  return propertyTypeMetadata.map(
    (property: { child: TypeMetadata; index: number }) => property.child,
  );
}
