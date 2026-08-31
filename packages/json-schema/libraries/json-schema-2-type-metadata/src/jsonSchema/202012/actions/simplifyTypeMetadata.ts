import {
  type AndTypeMetadata,
  type OrTypeMetadata,
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';
import { type JsonValue } from '@inversifyjs/json-schema-types';

interface TypeMetadataMutable {
  child?: TypeMetadata;
  children?: TypeMetadata[];
  id?: string;
  isOptional?: boolean;
  kind?: TypeMetadataKind;
  literal?: JsonValue;
  property?: string;
}

export function simplifyTypeMetadata(typeMetadata: TypeMetadata): TypeMetadata {
  return simplifyTypeMetadataRecursive(typeMetadata, new Set());
}

function copyTypeMetadataOnto(
  target: TypeMetadata,
  source: TypeMetadata,
): TypeMetadata {
  if (target === source) {
    return target;
  }

  const mutableTarget: TypeMetadataMutable = target;
  const id: string | undefined = mutableTarget.id;

  delete mutableTarget.child;
  delete mutableTarget.children;
  delete mutableTarget.id;
  delete mutableTarget.isOptional;
  delete mutableTarget.literal;
  delete mutableTarget.property;

  Object.assign(mutableTarget, source);

  if (id !== undefined) {
    mutableTarget.id = id;
  }

  return target;
}

function simplifyAndTypeMetadata(
  typeMetadata: AndTypeMetadata,
  visitedTypeMetadataSet: Set<TypeMetadata>,
): TypeMetadata {
  const simplifiedChildren: TypeMetadata[] = [];

  for (const child of typeMetadata.children) {
    const simplifiedChild: TypeMetadata = simplifyTypeMetadataRecursive(
      child,
      visitedTypeMetadataSet,
    );

    if (simplifiedChild.kind === TypeMetadataKind.noneType) {
      return copyTypeMetadataOnto(typeMetadata, {
        kind: TypeMetadataKind.noneType,
      });
    }

    if (simplifiedChild.kind === TypeMetadataKind.anyType) {
      continue;
    }

    simplifiedChildren.push(simplifiedChild);
  }

  return simplifyManyChildrenTypeMetadata(
    typeMetadata,
    simplifiedChildren,
    TypeMetadataKind.anyType,
  );
}

function simplifyManyChildrenTypeMetadata(
  typeMetadata: AndTypeMetadata | OrTypeMetadata,
  simplifiedChildren: TypeMetadata[],
  emptyKind: TypeMetadataKind.anyType | TypeMetadataKind.noneType,
): TypeMetadata {
  if (simplifiedChildren.length === 0) {
    return copyTypeMetadataOnto(typeMetadata, {
      kind: emptyKind,
    });
  }

  if (simplifiedChildren.length === 1) {
    return copyTypeMetadataOnto(
      typeMetadata,
      simplifiedChildren[0] as TypeMetadata,
    );
  }

  typeMetadata.children = simplifiedChildren;

  return typeMetadata;
}

function simplifyOrTypeMetadata(
  typeMetadata: OrTypeMetadata,
  visitedTypeMetadataSet: Set<TypeMetadata>,
): TypeMetadata {
  const simplifiedChildren: TypeMetadata[] = [];

  for (const child of typeMetadata.children) {
    const simplifiedChild: TypeMetadata = simplifyTypeMetadataRecursive(
      child,
      visitedTypeMetadataSet,
    );

    if (simplifiedChild.kind === TypeMetadataKind.anyType) {
      return copyTypeMetadataOnto(typeMetadata, {
        kind: TypeMetadataKind.anyType,
      });
    }

    if (simplifiedChild.kind === TypeMetadataKind.noneType) {
      continue;
    }

    simplifiedChildren.push(simplifiedChild);
  }

  return simplifyManyChildrenTypeMetadata(
    typeMetadata,
    simplifiedChildren,
    TypeMetadataKind.noneType,
  );
}

function simplifyTypeMetadataRecursive(
  typeMetadata: TypeMetadata,
  visitedTypeMetadataSet: Set<TypeMetadata>,
): TypeMetadata {
  if (visitedTypeMetadataSet.has(typeMetadata)) {
    return typeMetadata;
  }

  visitedTypeMetadataSet.add(typeMetadata);

  if ((typeMetadata as TypeMetadataMutable).kind === undefined) {
    return typeMetadata;
  }

  switch (typeMetadata.kind) {
    case TypeMetadataKind.and:
      return simplifyAndTypeMetadata(typeMetadata, visitedTypeMetadataSet);
    case TypeMetadataKind.arrayType:
    case TypeMetadataKind.propertyType:
    case TypeMetadataKind.stringIndexSignatureType:
      typeMetadata.child = simplifyTypeMetadataRecursive(
        typeMetadata.child,
        visitedTypeMetadataSet,
      );

      return typeMetadata;
    case TypeMetadataKind.anyType:
    case TypeMetadataKind.booleanType:
    case TypeMetadataKind.floatType:
    case TypeMetadataKind.integerType:
    case TypeMetadataKind.literalType:
    case TypeMetadataKind.noneType:
    case TypeMetadataKind.objectType:
    case TypeMetadataKind.stringType:
      return typeMetadata;
    case TypeMetadataKind.or:
      return simplifyOrTypeMetadata(typeMetadata, visitedTypeMetadataSet);
  }
}
