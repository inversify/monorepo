import {
  type AndTypeMetadata,
  type ArrayTypeMetadata,
  type OrTypeMetadata,
  type PropertyTypeMetadata,
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
  return simplifyTypeMetadataRecursive(typeMetadata, new Set(), new Set());
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

function distributeJsonSchemaInstanceTypeIntoOr(
  jsonSchemaInstanceType: TypeMetadata,
  orTypeMetadata: OrTypeMetadata,
  ancestorTypeMetadataSet: Set<TypeMetadata>,
  simplifiedTypeMetadataSet: Set<TypeMetadata>,
): TypeMetadata {
  const distributedOrTypeMetadata: OrTypeMetadata = {
    children: orTypeMetadata.children.map((branch: TypeMetadata) => {
      const distributedAndTypeMetadata: AndTypeMetadata = {
        children: [jsonSchemaInstanceType, branch],
        kind: TypeMetadataKind.and,
      };

      return simplifyTypeMetadataRecursive(
        distributedAndTypeMetadata,
        ancestorTypeMetadataSet,
        simplifiedTypeMetadataSet,
      );
    }),
    kind: TypeMetadataKind.or,
  };

  if (orTypeMetadata.id !== undefined) {
    distributedOrTypeMetadata.id = orTypeMetadata.id;
  }

  return simplifyTypeMetadataRecursive(
    distributedOrTypeMetadata,
    ancestorTypeMetadataSet,
    simplifiedTypeMetadataSet,
  );
}

function canFoldJsonSchemaInstanceShapedOr(
  typeMetadata: TypeMetadata,
  ancestorTypeMetadataSet: Set<TypeMetadata>,
): typeMetadata is OrTypeMetadata {
  return (
    canDistributeJsonSchemaInstanceTypeIntoOr(
      typeMetadata,
      ancestorTypeMetadataSet,
    ) &&
    typeMetadata.id === undefined &&
    isJsonSchemaInstanceShapedType(typeMetadata)
  );
}

function canJsonSchemaInstanceKindsMeet(
  left: TypeMetadata,
  right: TypeMetadata,
): boolean {
  const leftKind: TypeMetadataKind | undefined =
    getJsonSchemaInstanceTypeKind(left);
  const rightKind: TypeMetadataKind | undefined =
    getJsonSchemaInstanceTypeKind(right);

  if (leftKind === undefined || rightKind === undefined) {
    return true;
  }

  if (leftKind === rightKind) {
    return true;
  }

  return (
    (leftKind === TypeMetadataKind.integerType &&
      rightKind === TypeMetadataKind.floatType) ||
    (leftKind === TypeMetadataKind.floatType &&
      rightKind === TypeMetadataKind.integerType)
  );
}

function cartesianJsonSchemaInstanceShapedOrs(
  left: OrTypeMetadata,
  right: OrTypeMetadata,
  ancestorTypeMetadataSet: Set<TypeMetadata>,
  simplifiedTypeMetadataSet: Set<TypeMetadata>,
): TypeMetadata {
  const children: TypeMetadata[] = [];

  for (const leftBranch of left.children) {
    for (const rightBranch of right.children) {
      if (!canJsonSchemaInstanceKindsMeet(leftBranch, rightBranch)) {
        continue;
      }

      const productTypeMetadata: AndTypeMetadata = {
        children: [leftBranch, rightBranch],
        kind: TypeMetadataKind.and,
      };

      const simplifiedProductTypeMetadata: TypeMetadata =
        simplifyTypeMetadataRecursive(
          productTypeMetadata,
          ancestorTypeMetadataSet,
          simplifiedTypeMetadataSet,
        );

      if (simplifiedProductTypeMetadata.kind !== TypeMetadataKind.noneType) {
        children.push(simplifiedProductTypeMetadata);
      }
    }
  }

  const distributedOrTypeMetadata: OrTypeMetadata = {
    children,
    kind: TypeMetadataKind.or,
  };

  return simplifyTypeMetadataRecursive(
    distributedOrTypeMetadata,
    ancestorTypeMetadataSet,
    simplifiedTypeMetadataSet,
  );
}

function flattenSameKindChildren(
  typeMetadata: AndTypeMetadata | OrTypeMetadata,
  ancestorTypeMetadataSet: Set<TypeMetadata>,
): void {
  const flattenedChildren: TypeMetadata[] = [];

  for (const child of typeMetadata.children) {
    if (
      child.kind === typeMetadata.kind &&
      child.id === undefined &&
      !ancestorTypeMetadataSet.has(child) &&
      !isTypeMetadataCyclic(child)
    ) {
      flattenedChildren.push(...child.children);
    } else {
      flattenedChildren.push(child);
    }
  }

  typeMetadata.children = flattenedChildren;
}

function foldJsonSchemaInstanceShapedTerms(
  terms: TypeMetadata[],
  ancestorTypeMetadataSet: Set<TypeMetadata>,
  simplifiedTypeMetadataSet: Set<TypeMetadata>,
): TypeMetadata {
  let foldedTypeMetadata: TypeMetadata = terms[0] as TypeMetadata;

  for (let i: number = 1; i < terms.length; i++) {
    foldedTypeMetadata = intersectJsonSchemaInstanceShapedTerms(
      foldedTypeMetadata,
      terms[i] as TypeMetadata,
      ancestorTypeMetadataSet,
      simplifiedTypeMetadataSet,
    );

    if (foldedTypeMetadata.kind === TypeMetadataKind.noneType) {
      return foldedTypeMetadata;
    }
  }

  return foldedTypeMetadata;
}

function getJsonSchemaInstanceTypeKind(
  typeMetadata: TypeMetadata,
): TypeMetadataKind | undefined {
  if (isJsonSchemaInstanceType(typeMetadata)) {
    return typeMetadata.kind;
  }

  return undefined;
}

function intersectAndTypes(
  typeMetadata: AndTypeMetadata,
  ancestorTypeMetadataSet: Set<TypeMetadata>,
  simplifiedTypeMetadataSet: Set<TypeMetadata>,
): void {
  for (const child of typeMetadata.children) {
    if (child.kind === TypeMetadataKind.noneType) {
      copyTypeMetadataOnto(typeMetadata, {
        kind: TypeMetadataKind.noneType,
      });

      return;
    }
  }

  let mergedJsonSchemaInstanceType: TypeMetadata | undefined;
  const foldableOrTypeMetadata: OrTypeMetadata[] = [];
  const otherChildren: TypeMetadata[] = [];

  for (const child of typeMetadata.children) {
    if (isJsonSchemaInstanceType(child)) {
      if (mergedJsonSchemaInstanceType === undefined) {
        mergedJsonSchemaInstanceType = child;
      } else {
        mergedJsonSchemaInstanceType = intersectJsonSchemaInstanceTypes(
          mergedJsonSchemaInstanceType,
          child,
          ancestorTypeMetadataSet,
          simplifiedTypeMetadataSet,
        );

        if (mergedJsonSchemaInstanceType.kind === TypeMetadataKind.noneType) {
          copyTypeMetadataOnto(typeMetadata, mergedJsonSchemaInstanceType);

          return;
        }
      }
    } else if (
      canFoldJsonSchemaInstanceShapedOr(child, ancestorTypeMetadataSet)
    ) {
      foldableOrTypeMetadata.push(child);
    } else {
      otherChildren.push(child);
    }
  }

  if (
    mergedJsonSchemaInstanceType === undefined &&
    (foldableOrTypeMetadata.length === 0 || foldableOrTypeMetadata.length === 1)
  ) {
    return;
  }

  let foldedTypeMetadata: TypeMetadata;

  if (
    mergedJsonSchemaInstanceType !== undefined &&
    foldableOrTypeMetadata.length === 0
  ) {
    foldedTypeMetadata = mergedJsonSchemaInstanceType;
  } else {
    const terms: TypeMetadata[] =
      mergedJsonSchemaInstanceType === undefined
        ? foldableOrTypeMetadata
        : [mergedJsonSchemaInstanceType, ...foldableOrTypeMetadata];

    foldedTypeMetadata = foldJsonSchemaInstanceShapedTerms(
      terms,
      ancestorTypeMetadataSet,
      simplifiedTypeMetadataSet,
    );

    if (foldedTypeMetadata.kind === TypeMetadataKind.noneType) {
      copyTypeMetadataOnto(typeMetadata, foldedTypeMetadata);

      return;
    }
  }

  const shouldDistributeFoldedInstanceTypeIntoOtherOrs: boolean =
    isJsonSchemaInstanceType(foldedTypeMetadata) &&
    otherChildren.some((child: TypeMetadata) =>
      canDistributeJsonSchemaInstanceTypeIntoOr(child, ancestorTypeMetadataSet),
    );
  const foldableOrTypeMetadataSet: Set<TypeMetadata> = new Set(
    foldableOrTypeMetadata,
  );

  const nextChildren: TypeMetadata[] = [];
  let insertedFoldedTypeMetadata: boolean = false;

  for (const child of typeMetadata.children) {
    if (
      isJsonSchemaInstanceType(child) ||
      foldableOrTypeMetadataSet.has(child)
    ) {
      if (
        !shouldDistributeFoldedInstanceTypeIntoOtherOrs &&
        !insertedFoldedTypeMetadata
      ) {
        nextChildren.push(foldedTypeMetadata);
        insertedFoldedTypeMetadata = true;
      }
    } else if (
      shouldDistributeFoldedInstanceTypeIntoOtherOrs &&
      canDistributeJsonSchemaInstanceTypeIntoOr(child, ancestorTypeMetadataSet)
    ) {
      nextChildren.push(
        distributeJsonSchemaInstanceTypeIntoOr(
          foldedTypeMetadata,
          child,
          ancestorTypeMetadataSet,
          simplifiedTypeMetadataSet,
        ),
      );
    } else {
      nextChildren.push(child);
    }
  }

  typeMetadata.children = nextChildren;
}

function intersectJsonSchemaInstanceShapedTerms(
  left: TypeMetadata,
  right: TypeMetadata,
  ancestorTypeMetadataSet: Set<TypeMetadata>,
  simplifiedTypeMetadataSet: Set<TypeMetadata>,
): TypeMetadata {
  if (
    canFoldJsonSchemaInstanceShapedOr(left, ancestorTypeMetadataSet) &&
    canFoldJsonSchemaInstanceShapedOr(right, ancestorTypeMetadataSet)
  ) {
    return cartesianJsonSchemaInstanceShapedOrs(
      left,
      right,
      ancestorTypeMetadataSet,
      simplifiedTypeMetadataSet,
    );
  }

  if (
    canFoldJsonSchemaInstanceShapedOr(left, ancestorTypeMetadataSet) &&
    isJsonSchemaInstanceType(right)
  ) {
    return distributeJsonSchemaInstanceTypeIntoOr(
      right,
      left,
      ancestorTypeMetadataSet,
      simplifiedTypeMetadataSet,
    );
  }

  if (
    canFoldJsonSchemaInstanceShapedOr(right, ancestorTypeMetadataSet) &&
    isJsonSchemaInstanceType(left)
  ) {
    return distributeJsonSchemaInstanceTypeIntoOr(
      left,
      right,
      ancestorTypeMetadataSet,
      simplifiedTypeMetadataSet,
    );
  }

  if (isJsonSchemaInstanceType(left) && isJsonSchemaInstanceType(right)) {
    return intersectJsonSchemaInstanceTypes(
      left,
      right,
      ancestorTypeMetadataSet,
      simplifiedTypeMetadataSet,
    );
  }

  const fallbackTypeMetadata: AndTypeMetadata = {
    children: [left, right],
    kind: TypeMetadataKind.and,
  };

  return simplifyTypeMetadataRecursive(
    fallbackTypeMetadata,
    ancestorTypeMetadataSet,
    simplifiedTypeMetadataSet,
  );
}

function intersectAndPropertyTypes(
  typeMetadata: AndTypeMetadata,
  ancestorTypeMetadataSet: Set<TypeMetadata>,
  simplifiedTypeMetadataSet: Set<TypeMetadata>,
): void {
  const propertyTypeMetadataByProperty: Map<string, PropertyTypeMetadata[]> =
    new Map();

  for (const child of typeMetadata.children) {
    if (child.kind === TypeMetadataKind.propertyType) {
      const propertyTypeMetadata: PropertyTypeMetadata[] =
        propertyTypeMetadataByProperty.get(child.property) ?? [];

      propertyTypeMetadata.push(child);
      propertyTypeMetadataByProperty.set(child.property, propertyTypeMetadata);
    }
  }

  const insertedPropertySet: Set<string> = new Set();
  const nextChildren: TypeMetadata[] = [];

  for (const child of typeMetadata.children) {
    if (child.kind === TypeMetadataKind.propertyType) {
      if (!insertedPropertySet.has(child.property)) {
        insertedPropertySet.add(child.property);

        const mergedPropertyTypeMetadata: TypeMetadata =
          intersectPropertyTypeMetadata(
            propertyTypeMetadataByProperty.get(
              child.property,
            ) as PropertyTypeMetadata[],
            ancestorTypeMetadataSet,
            simplifiedTypeMetadataSet,
          );

        if (mergedPropertyTypeMetadata.kind === TypeMetadataKind.noneType) {
          copyTypeMetadataOnto(typeMetadata, mergedPropertyTypeMetadata);

          return;
        }

        nextChildren.push(mergedPropertyTypeMetadata);
      }
    } else {
      nextChildren.push(child);
    }
  }

  typeMetadata.children = nextChildren;
}

function intersectPropertyTypeMetadata(
  propertyTypeMetadata: PropertyTypeMetadata[],
  ancestorTypeMetadataSet: Set<TypeMetadata>,
  simplifiedTypeMetadataSet: Set<TypeMetadata>,
): TypeMetadata {
  const firstPropertyTypeMetadata: PropertyTypeMetadata =
    propertyTypeMetadata[0] as PropertyTypeMetadata;
  const isOptional: boolean = propertyTypeMetadata.every(
    (property: PropertyTypeMetadata) => property.isOptional,
  );

  let child: TypeMetadata;

  if (propertyTypeMetadata.length === 1) {
    child = firstPropertyTypeMetadata.child;
  } else {
    const childConstraint: AndTypeMetadata = {
      children: propertyTypeMetadata.map(
        (property: PropertyTypeMetadata) => property.child,
      ),
      kind: TypeMetadataKind.and,
    };

    child = simplifyTypeMetadataRecursive(
      childConstraint,
      ancestorTypeMetadataSet,
      simplifiedTypeMetadataSet,
    );
  }

  if (child.kind === TypeMetadataKind.noneType && !isOptional) {
    return {
      kind: TypeMetadataKind.noneType,
    };
  }

  firstPropertyTypeMetadata.child = child;
  firstPropertyTypeMetadata.isOptional = isOptional;

  return firstPropertyTypeMetadata;
}

function intersectJsonSchemaInstanceTypes(
  left: TypeMetadata,
  right: TypeMetadata,
  ancestorTypeMetadataSet: Set<TypeMetadata>,
  simplifiedTypeMetadataSet: Set<TypeMetadata>,
): TypeMetadata {
  if (
    (left.kind === TypeMetadataKind.integerType &&
      right.kind === TypeMetadataKind.floatType) ||
    (left.kind === TypeMetadataKind.floatType &&
      right.kind === TypeMetadataKind.integerType)
  ) {
    return {
      kind: TypeMetadataKind.integerType,
    };
  }

  if (left.kind !== right.kind) {
    return {
      kind: TypeMetadataKind.noneType,
    };
  }

  switch (left.kind) {
    case TypeMetadataKind.arrayType: {
      const itemConstraint: AndTypeMetadata = {
        children: [left.child, (right as ArrayTypeMetadata).child],
        kind: TypeMetadataKind.and,
      };

      return {
        child: simplifyTypeMetadataRecursive(
          itemConstraint,
          ancestorTypeMetadataSet,
          simplifiedTypeMetadataSet,
        ),
        kind: TypeMetadataKind.arrayType,
      };
    }
    case TypeMetadataKind.booleanType:
    case TypeMetadataKind.floatType:
    case TypeMetadataKind.integerType:
    case TypeMetadataKind.objectType:
    case TypeMetadataKind.stringType:
      return {
        kind: left.kind,
      };
    case TypeMetadataKind.literalType:
      return {
        kind: TypeMetadataKind.literalType,
        literal: null,
      };
    default:
      return {
        kind: TypeMetadataKind.noneType,
      };
  }
}

function canDistributeJsonSchemaInstanceTypeIntoOr(
  typeMetadata: TypeMetadata,
  ancestorTypeMetadataSet: Set<TypeMetadata>,
): typeMetadata is OrTypeMetadata {
  return (
    typeMetadata.kind === TypeMetadataKind.or &&
    !ancestorTypeMetadataSet.has(typeMetadata) &&
    !isTypeMetadataCyclic(typeMetadata)
  );
}

function isJsonSchemaInstanceShapedType(
  typeMetadata: TypeMetadata,
  visitedTypeMetadataSet: Set<TypeMetadata> = new Set(),
): boolean {
  if (isJsonSchemaInstanceType(typeMetadata)) {
    return true;
  }

  if (
    typeMetadata.kind !== TypeMetadataKind.and &&
    typeMetadata.kind !== TypeMetadataKind.or
  ) {
    return false;
  }

  if (visitedTypeMetadataSet.has(typeMetadata)) {
    return false;
  }

  visitedTypeMetadataSet.add(typeMetadata);

  return typeMetadata.children.every((child: TypeMetadata) =>
    isJsonSchemaInstanceShapedType(child, visitedTypeMetadataSet),
  );
}

function isJsonSchemaInstanceType(typeMetadata: TypeMetadata): boolean {
  switch (typeMetadata.kind) {
    case TypeMetadataKind.arrayType:
    case TypeMetadataKind.booleanType:
    case TypeMetadataKind.floatType:
    case TypeMetadataKind.integerType:
    case TypeMetadataKind.objectType:
    case TypeMetadataKind.stringType:
      return true;
    case TypeMetadataKind.literalType:
      return typeMetadata.literal === null;
    default:
      return false;
  }
}

function isTypeMetadataCyclic(typeMetadata: TypeMetadata): boolean {
  const visitedTypeMetadataSet: Set<TypeMetadata> = new Set();

  function visit(node: TypeMetadata): boolean {
    if (node === typeMetadata && visitedTypeMetadataSet.size > 0) {
      return true;
    }

    if (visitedTypeMetadataSet.has(node)) {
      return false;
    }

    visitedTypeMetadataSet.add(node);

    switch (node.kind) {
      case TypeMetadataKind.and:
      case TypeMetadataKind.or:
        return node.children.some(visit);
      case TypeMetadataKind.arrayType:
      case TypeMetadataKind.propertyType:
      case TypeMetadataKind.stringIndexSignatureType:
        return visit(node.child);
      default:
        return false;
    }
  }

  return visit(typeMetadata);
}

function simplifyAndTypeMetadata(
  typeMetadata: AndTypeMetadata,
  ancestorTypeMetadataSet: Set<TypeMetadata>,
  simplifiedTypeMetadataSet: Set<TypeMetadata>,
): TypeMetadata {
  typeMetadata.children = typeMetadata.children.map((child: TypeMetadata) =>
    simplifyTypeMetadataRecursive(
      child,
      ancestorTypeMetadataSet,
      simplifiedTypeMetadataSet,
    ),
  );

  flattenSameKindChildren(typeMetadata, ancestorTypeMetadataSet);
  intersectAndTypes(
    typeMetadata,
    ancestorTypeMetadataSet,
    simplifiedTypeMetadataSet,
  );

  if ((typeMetadata as TypeMetadataMutable).kind === TypeMetadataKind.and) {
    intersectAndPropertyTypes(
      typeMetadata,
      ancestorTypeMetadataSet,
      simplifiedTypeMetadataSet,
    );
  }

  if ((typeMetadata as TypeMetadataMutable).kind !== TypeMetadataKind.and) {
    return typeMetadata;
  }

  return simplifyAnyAndNoneAnd(typeMetadata);
}

function simplifyAnyAndNoneAnd(typeMetadata: AndTypeMetadata): TypeMetadata {
  const simplifiedChildren: TypeMetadata[] = [];

  for (const child of typeMetadata.children) {
    if (child.kind === TypeMetadataKind.noneType) {
      return copyTypeMetadataOnto(typeMetadata, {
        kind: TypeMetadataKind.noneType,
      });
    } else if (child.kind !== TypeMetadataKind.anyType) {
      simplifiedChildren.push(child);
    }
  }

  return simplifyManyChildrenTypeMetadata(
    typeMetadata,
    simplifiedChildren,
    TypeMetadataKind.anyType,
  );
}

function simplifyAnyAndNoneOr(typeMetadata: OrTypeMetadata): TypeMetadata {
  const simplifiedChildren: TypeMetadata[] = [];

  for (const child of typeMetadata.children) {
    if (child !== typeMetadata) {
      if (child.kind === TypeMetadataKind.anyType) {
        return copyTypeMetadataOnto(typeMetadata, {
          kind: TypeMetadataKind.anyType,
        });
      } else if (child.kind !== TypeMetadataKind.noneType) {
        simplifiedChildren.push(child);
      }
    }
  }

  return simplifyManyChildrenTypeMetadata(
    typeMetadata,
    simplifiedChildren,
    TypeMetadataKind.noneType,
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
  ancestorTypeMetadataSet: Set<TypeMetadata>,
  simplifiedTypeMetadataSet: Set<TypeMetadata>,
): TypeMetadata {
  typeMetadata.children = typeMetadata.children.map((child: TypeMetadata) =>
    simplifyTypeMetadataRecursive(
      child,
      ancestorTypeMetadataSet,
      simplifiedTypeMetadataSet,
    ),
  );

  flattenSameKindChildren(typeMetadata, ancestorTypeMetadataSet);

  return simplifyAnyAndNoneOr(typeMetadata);
}

function simplifyTypeMetadataRecursive(
  typeMetadata: TypeMetadata,
  ancestorTypeMetadataSet: Set<TypeMetadata>,
  simplifiedTypeMetadataSet: Set<TypeMetadata>,
): TypeMetadata {
  if (
    ancestorTypeMetadataSet.has(typeMetadata) ||
    simplifiedTypeMetadataSet.has(typeMetadata)
  ) {
    return typeMetadata;
  }

  ancestorTypeMetadataSet.add(typeMetadata);

  if ((typeMetadata as TypeMetadataMutable).kind === undefined) {
    ancestorTypeMetadataSet.delete(typeMetadata);
    simplifiedTypeMetadataSet.add(typeMetadata);

    return typeMetadata;
  }

  let simplifiedTypeMetadata: TypeMetadata;

  switch (typeMetadata.kind) {
    case TypeMetadataKind.and:
      simplifiedTypeMetadata = simplifyAndTypeMetadata(
        typeMetadata,
        ancestorTypeMetadataSet,
        simplifiedTypeMetadataSet,
      );
      break;
    case TypeMetadataKind.arrayType:
    case TypeMetadataKind.propertyType:
    case TypeMetadataKind.stringIndexSignatureType:
      typeMetadata.child = simplifyTypeMetadataRecursive(
        typeMetadata.child,
        ancestorTypeMetadataSet,
        simplifiedTypeMetadataSet,
      );

      simplifiedTypeMetadata = typeMetadata;
      break;
    case TypeMetadataKind.anyType:
    case TypeMetadataKind.booleanType:
    case TypeMetadataKind.floatType:
    case TypeMetadataKind.integerType:
    case TypeMetadataKind.literalType:
    case TypeMetadataKind.noneType:
    case TypeMetadataKind.objectType:
    case TypeMetadataKind.stringType:
      simplifiedTypeMetadata = typeMetadata;
      break;
    case TypeMetadataKind.or:
      simplifiedTypeMetadata = simplifyOrTypeMetadata(
        typeMetadata,
        ancestorTypeMetadataSet,
        simplifiedTypeMetadataSet,
      );
      break;
  }

  ancestorTypeMetadataSet.delete(typeMetadata);
  simplifiedTypeMetadataSet.add(typeMetadata);

  return simplifiedTypeMetadata;
}
