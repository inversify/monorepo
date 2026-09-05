import {
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';

export function visitTypeMetadataChildren(
  typeMetadata: TypeMetadata,
  visit: (child: TypeMetadata) => void,
): void {
  switch (typeMetadata.kind) {
    case TypeMetadataKind.and:
    case TypeMetadataKind.or:
      for (const child of typeMetadata.children) {
        visit(child);
      }
      break;
    case TypeMetadataKind.arrayType:
    case TypeMetadataKind.propertyType:
    case TypeMetadataKind.stringIndexSignatureType:
      visit(typeMetadata.child);
      break;
    default:
      break;
  }
}
