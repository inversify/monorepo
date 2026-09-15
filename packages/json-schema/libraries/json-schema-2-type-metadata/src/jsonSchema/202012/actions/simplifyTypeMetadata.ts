import {
  type AndTypeMetadata,
  type ArrayTypeMetadata,
  type LiteralTypeMetadata,
  type OrTypeMetadata,
  type PropertyTypeMetadata,
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';
import { type JsonValue } from '@inversifyjs/json-schema-types';

import { areJsonValuesEqual } from './areJsonValuesEqual.js';
import { doesJsonValueInhabitTypeMetadata } from './doesJsonValueInhabitTypeMetadata.js';
import {
  getArrayTypeMetadataItem,
  getArrayTypeMetadataMaxItems,
  getArrayTypeMetadataMinItems,
} from './getArrayTypeMetadataBounds.js';

interface TypeMetadataMutable {
  child?: TypeMetadata;
  children?: TypeMetadata[];
  id?: string;
  isOptional?: boolean;
  kind?: TypeMetadataKind;
  literal?: JsonValue;
  maxItems?: number;
  minItems?: number;
  prefixItems?: TypeMetadata[];
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
  delete mutableTarget.maxItems;
  delete mutableTarget.minItems;
  delete mutableTarget.prefixItems;
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
      !isTypeMetadataCyclic(child) &&
      !hasStringIndexSignatureChild(child) &&
      !hasStringIndexSignatureChild(typeMetadata)
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

function assignArrayTypeMetadataCardinality(
  arrayTypeMetadata: ArrayTypeMetadata,
  minItems: number,
  maxItems: number,
): void {
  const mutableArrayTypeMetadata: TypeMetadataMutable = arrayTypeMetadata;

  if (minItems > 0) {
    mutableArrayTypeMetadata.minItems = minItems;
  } else {
    delete mutableArrayTypeMetadata.minItems;
  }

  const impliedMaxItems: number =
    arrayTypeMetadata.child.kind === TypeMetadataKind.noneType
      ? (arrayTypeMetadata.prefixItems?.length ?? 0)
      : Number.POSITIVE_INFINITY;

  if (Number.isFinite(maxItems) && maxItems < impliedMaxItems) {
    mutableArrayTypeMetadata.maxItems = maxItems;
  } else {
    delete mutableArrayTypeMetadata.maxItems;
  }
}

function intersectArrayTypeMetadata(
  left: ArrayTypeMetadata,
  right: ArrayTypeMetadata,
  ancestorTypeMetadataSet: Set<TypeMetadata>,
  simplifiedTypeMetadataSet: Set<TypeMetadata>,
): TypeMetadata {
  const minItems: number = Math.max(
    getArrayTypeMetadataMinItems(left),
    getArrayTypeMetadataMinItems(right),
  );
  let maxItems: number = Math.min(
    getArrayTypeMetadataMaxItems(left),
    getArrayTypeMetadataMaxItems(right),
  );

  if (minItems > maxItems) {
    return {
      kind: TypeMetadataKind.noneType,
    };
  }

  const leftPrefixItemsLength: number = left.prefixItems?.length ?? 0;
  const rightPrefixItemsLength: number = right.prefixItems?.length ?? 0;
  const rawPrefixItemsLength: number = Math.max(
    leftPrefixItemsLength,
    rightPrefixItemsLength,
  );
  const prefixItemsLength: number = Number.isFinite(maxItems)
    ? Math.min(rawPrefixItemsLength, maxItems)
    : rawPrefixItemsLength;
  const prefixItems: TypeMetadata[] = [];
  let truncatedRest: boolean = false;

  for (let i: number = 0; i < prefixItemsLength; i += 1) {
    const prefixItemConstraint: AndTypeMetadata = {
      children: [
        getArrayTypeMetadataItem(left, i),
        getArrayTypeMetadataItem(right, i),
      ],
      kind: TypeMetadataKind.and,
    };
    const prefixItem: TypeMetadata = simplifyTypeMetadataRecursive(
      prefixItemConstraint,
      ancestorTypeMetadataSet,
      simplifiedTypeMetadataSet,
    );

    if (prefixItem.kind === TypeMetadataKind.noneType) {
      if (i < minItems) {
        return {
          kind: TypeMetadataKind.noneType,
        };
      }

      maxItems = i;
      truncatedRest = true;
      break;
    }

    prefixItems.push(prefixItem);
  }

  const child: TypeMetadata = truncatedRest
    ? {
        kind: TypeMetadataKind.noneType,
      }
    : simplifyTypeMetadataRecursive(
        {
          children: [left.child, right.child],
          kind: TypeMetadataKind.and,
        },
        ancestorTypeMetadataSet,
        simplifiedTypeMetadataSet,
      );
  const arrayTypeMetadata: ArrayTypeMetadata = {
    child,
    kind: TypeMetadataKind.arrayType,
  };

  if (prefixItems.length > 0) {
    arrayTypeMetadata.prefixItems = prefixItems;
  }

  assignArrayTypeMetadataCardinality(arrayTypeMetadata, minItems, maxItems);

  if (
    getArrayTypeMetadataMinItems(arrayTypeMetadata) >
    getArrayTypeMetadataMaxItems(arrayTypeMetadata)
  ) {
    return {
      kind: TypeMetadataKind.noneType,
    };
  }

  return arrayTypeMetadata;
}

function simplifyArrayTypeMetadata(
  typeMetadata: ArrayTypeMetadata,
  ancestorTypeMetadataSet: Set<TypeMetadata>,
  simplifiedTypeMetadataSet: Set<TypeMetadata>,
): TypeMetadata {
  const mutableTypeMetadata: TypeMetadataMutable = typeMetadata;

  if (typeMetadata.prefixItems !== undefined) {
    typeMetadata.prefixItems = typeMetadata.prefixItems.map(
      (prefixItem: TypeMetadata) =>
        simplifyTypeMetadataRecursive(
          prefixItem,
          ancestorTypeMetadataSet,
          simplifiedTypeMetadataSet,
        ),
    );
  }

  typeMetadata.child = simplifyTypeMetadataRecursive(
    typeMetadata.child,
    ancestorTypeMetadataSet,
    simplifiedTypeMetadataSet,
  );

  const minItems: number = getArrayTypeMetadataMinItems(typeMetadata);

  if (typeMetadata.prefixItems !== undefined) {
    const prefixItems: TypeMetadata[] = [];

    for (
      let index: number = 0;
      index < typeMetadata.prefixItems.length;
      index += 1
    ) {
      const prefixItem: TypeMetadata = typeMetadata.prefixItems[
        index
      ] as TypeMetadata;

      if (prefixItem.kind === TypeMetadataKind.noneType) {
        if (index < minItems) {
          return copyTypeMetadataOnto(typeMetadata, {
            kind: TypeMetadataKind.noneType,
          });
        }

        typeMetadata.child = {
          kind: TypeMetadataKind.noneType,
        };
        break;
      }

      prefixItems.push(prefixItem);
    }

    typeMetadata.prefixItems = prefixItems;
  }

  let maxItems: number = getArrayTypeMetadataMaxItems(typeMetadata);

  if (minItems > maxItems) {
    return copyTypeMetadataOnto(typeMetadata, {
      kind: TypeMetadataKind.noneType,
    });
  }

  if (
    typeMetadata.prefixItems !== undefined &&
    Number.isFinite(maxItems) &&
    typeMetadata.prefixItems.length > maxItems
  ) {
    typeMetadata.prefixItems = typeMetadata.prefixItems.slice(0, maxItems);
    maxItems = getArrayTypeMetadataMaxItems(typeMetadata);
  }

  if (
    typeMetadata.prefixItems !== undefined &&
    typeMetadata.prefixItems.length === 0
  ) {
    delete mutableTypeMetadata.prefixItems;
  }

  assignArrayTypeMetadataCardinality(typeMetadata, minItems, maxItems);

  return typeMetadata;
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
      return intersectArrayTypeMetadata(
        left,
        right as ArrayTypeMetadata,
        ancestorTypeMetadataSet,
        simplifiedTypeMetadataSet,
      );
    }
    case TypeMetadataKind.booleanType:
    case TypeMetadataKind.floatType:
    case TypeMetadataKind.integerType:
    case TypeMetadataKind.objectType:
    case TypeMetadataKind.stringType:
      return {
        kind: left.kind,
      };
    case TypeMetadataKind.literalType: {
      const rightLiteral: JsonValue = (right as LiteralTypeMetadata).literal;

      if (!areJsonValuesEqual(left.literal, rightLiteral)) {
        return {
          kind: TypeMetadataKind.noneType,
        };
      }

      return {
        kind: TypeMetadataKind.literalType,
        literal: left.literal,
      };
    }
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

function hasStringIndexSignatureChild(
  typeMetadata: AndTypeMetadata | OrTypeMetadata,
): boolean {
  return typeMetadata.children.some(
    (child: TypeMetadata) =>
      child.kind === TypeMetadataKind.stringIndexSignatureType,
  );
}

function isObjectConstraintTypeMetadata(typeMetadata: TypeMetadata): boolean {
  return (
    typeMetadata.kind === TypeMetadataKind.propertyType ||
    typeMetadata.kind === TypeMetadataKind.stringIndexSignatureType
  );
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
        return (node.prefixItems?.some(visit) ?? false) || visit(node.child);
      case TypeMetadataKind.propertyType:
      case TypeMetadataKind.stringIndexSignatureType:
        return visit(node.child);
      default:
        return false;
    }
  }

  return visit(typeMetadata);
}

function absorbLiteralTypeMetadataFromAnd(
  typeMetadata: AndTypeMetadata,
): TypeMetadata | undefined {
  const literalTypeMetadata: LiteralTypeMetadata[] = [];

  for (const child of typeMetadata.children) {
    if (child.kind === TypeMetadataKind.literalType) {
      literalTypeMetadata.push(child);
    }
  }

  if (literalTypeMetadata.length === 0) {
    return undefined;
  }

  const firstLiteralTypeMetadata: LiteralTypeMetadata =
    literalTypeMetadata[0] as LiteralTypeMetadata;

  for (const child of literalTypeMetadata) {
    if (!areJsonValuesEqual(firstLiteralTypeMetadata.literal, child.literal)) {
      return {
        kind: TypeMetadataKind.noneType,
      };
    }
  }

  const otherChildren: TypeMetadata[] = typeMetadata.children.filter(
    (child: TypeMetadata) =>
      child.kind !== TypeMetadataKind.literalType ||
      !areJsonValuesEqual(firstLiteralTypeMetadata.literal, child.literal),
  );

  if (otherChildren.length === 0) {
    return firstLiteralTypeMetadata;
  }

  const constraintTypeMetadata: TypeMetadata =
    otherChildren.length === 1
      ? (otherChildren[0] as TypeMetadata)
      : {
          children: otherChildren,
          kind: TypeMetadataKind.and,
        };

  if (
    !doesJsonValueInhabitTypeMetadata(
      firstLiteralTypeMetadata.literal,
      constraintTypeMetadata,
    )
  ) {
    return {
      kind: TypeMetadataKind.noneType,
    };
  }

  return firstLiteralTypeMetadata;
}

function simplifyAndTypeMetadata(
  typeMetadata: AndTypeMetadata,
  ancestorTypeMetadataSet: Set<TypeMetadata>,
  simplifiedTypeMetadataSet: Set<TypeMetadata>,
  parentHasStringIndexSignature: boolean,
): TypeMetadata {
  const hasStringIndexSignature: boolean =
    hasStringIndexSignatureChild(typeMetadata);

  typeMetadata.children = typeMetadata.children.map((child: TypeMetadata) =>
    simplifyTypeMetadataRecursive(
      child,
      ancestorTypeMetadataSet,
      simplifiedTypeMetadataSet,
      hasStringIndexSignature,
    ),
  );

  const absorbedTypeMetadata: TypeMetadata | undefined =
    absorbLiteralTypeMetadataFromAnd(typeMetadata);

  if (absorbedTypeMetadata !== undefined) {
    return copyTypeMetadataOnto(typeMetadata, absorbedTypeMetadata);
  }

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

  const absorbedFoldedTypeMetadata: TypeMetadata | undefined =
    absorbLiteralTypeMetadataFromAnd(typeMetadata);

  if (absorbedFoldedTypeMetadata !== undefined) {
    return copyTypeMetadataOnto(typeMetadata, absorbedFoldedTypeMetadata);
  }

  return simplifyAnyAndNoneAnd(typeMetadata, parentHasStringIndexSignature);
}

function simplifyAnyAndNoneAnd(
  typeMetadata: AndTypeMetadata,
  parentHasStringIndexSignature: boolean,
): TypeMetadata {
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
    parentHasStringIndexSignature,
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
    false,
  );
}

function simplifyManyChildrenTypeMetadata(
  typeMetadata: AndTypeMetadata | OrTypeMetadata,
  simplifiedChildren: TypeMetadata[],
  emptyKind: TypeMetadataKind.anyType | TypeMetadataKind.noneType,
  parentHasStringIndexSignature: boolean,
): TypeMetadata {
  if (simplifiedChildren.length === 0) {
    return copyTypeMetadataOnto(typeMetadata, {
      kind: emptyKind,
    });
  }

  const singleChild: TypeMetadata | undefined = simplifiedChildren[0];

  if (
    simplifiedChildren.length === 1 &&
    singleChild !== undefined &&
    (typeMetadata.kind === TypeMetadataKind.or ||
      !parentHasStringIndexSignature ||
      !isObjectConstraintTypeMetadata(singleChild))
  ) {
    return copyTypeMetadataOnto(typeMetadata, singleChild);
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
  parentHasStringIndexSignature: boolean = false,
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
        parentHasStringIndexSignature,
      );
      break;
    case TypeMetadataKind.arrayType:
      simplifiedTypeMetadata = simplifyArrayTypeMetadata(
        typeMetadata,
        ancestorTypeMetadataSet,
        simplifiedTypeMetadataSet,
      );
      break;
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
