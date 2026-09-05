import {
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';

export function buildRootUnionTypeMetadata(
  namedTypeMetadata: TypeMetadata[],
): TypeMetadata {
  if (namedTypeMetadata.length === 0) {
    return {
      kind: TypeMetadataKind.noneType,
    };
  }

  return {
    children: namedTypeMetadata,
    kind: TypeMetadataKind.or,
  };
}
