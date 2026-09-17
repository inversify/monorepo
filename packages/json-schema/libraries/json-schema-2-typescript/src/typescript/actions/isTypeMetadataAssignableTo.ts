import {
  type ArrayTypeMetadata,
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';
import { type JsonValue } from '@inversifyjs/json-schema-types';

import {
  getArrayTypeMetadataItem,
  getArrayTypeMetadataMaxItems,
  getArrayTypeMetadataMinItems,
} from './getArrayTypeMetadataBounds.js';

export function isTypeMetadataAssignableTo(
  sourceTypeMetadata: TypeMetadata,
  targetTypeMetadata: TypeMetadata,
): boolean {
  return isAssignable(sourceTypeMetadata, targetTypeMetadata, new WeakMap());
}

function isAssignable(
  sourceTypeMetadata: TypeMetadata,
  targetTypeMetadata: TypeMetadata,
  visitedTypeMetadata: WeakMap<TypeMetadata, Set<TypeMetadata>>,
): boolean {
  if (sourceTypeMetadata === targetTypeMetadata) {
    return true;
  }

  const visitedTargetTypeMetadata: Set<TypeMetadata> | undefined =
    visitedTypeMetadata.get(sourceTypeMetadata);

  if (visitedTargetTypeMetadata?.has(targetTypeMetadata) === true) {
    return true;
  }

  if (visitedTargetTypeMetadata === undefined) {
    visitedTypeMetadata.set(sourceTypeMetadata, new Set([targetTypeMetadata]));
  } else {
    visitedTargetTypeMetadata.add(targetTypeMetadata);
  }

  if (targetTypeMetadata.kind === TypeMetadataKind.anyType) {
    return true;
  }

  if (sourceTypeMetadata.kind === TypeMetadataKind.noneType) {
    return true;
  }

  if (sourceTypeMetadata.kind === TypeMetadataKind.anyType) {
    return false;
  }

  if (targetTypeMetadata.kind === TypeMetadataKind.noneType) {
    return false;
  }

  if (sourceTypeMetadata.kind === TypeMetadataKind.or) {
    return sourceTypeMetadata.children.every((child: TypeMetadata) =>
      isAssignable(child, targetTypeMetadata, visitedTypeMetadata),
    );
  }

  if (targetTypeMetadata.kind === TypeMetadataKind.or) {
    return targetTypeMetadata.children.some((child: TypeMetadata) =>
      isAssignable(sourceTypeMetadata, child, visitedTypeMetadata),
    );
  }

  if (targetTypeMetadata.kind === TypeMetadataKind.and) {
    return targetTypeMetadata.children.every((child: TypeMetadata) =>
      isAssignable(sourceTypeMetadata, child, visitedTypeMetadata),
    );
  }

  if (sourceTypeMetadata.kind === TypeMetadataKind.and) {
    return sourceTypeMetadata.children.some((child: TypeMetadata) =>
      isAssignable(child, targetTypeMetadata, visitedTypeMetadata),
    );
  }

  if (sourceTypeMetadata.kind === TypeMetadataKind.literalType) {
    return isLiteralAssignableTo(
      sourceTypeMetadata.literal,
      targetTypeMetadata,
      visitedTypeMetadata,
    );
  }

  if (isNumberTypeMetadata(sourceTypeMetadata)) {
    return isNumberTypeMetadata(targetTypeMetadata);
  }

  if (sourceTypeMetadata.kind === TypeMetadataKind.arrayType) {
    if (targetTypeMetadata.kind === TypeMetadataKind.objectType) {
      return true;
    }

    if (targetTypeMetadata.kind === TypeMetadataKind.arrayType) {
      return isArrayTypeMetadataAssignableTo(
        sourceTypeMetadata,
        targetTypeMetadata,
        visitedTypeMetadata,
      );
    }

    return false;
  }

  if (sourceTypeMetadata.kind === TypeMetadataKind.propertyType) {
    if (targetTypeMetadata.kind === TypeMetadataKind.objectType) {
      return true;
    }

    if (targetTypeMetadata.kind === TypeMetadataKind.stringIndexSignatureType) {
      return isAssignable(
        sourceTypeMetadata.child,
        targetTypeMetadata.child,
        visitedTypeMetadata,
      );
    }

    if (targetTypeMetadata.kind === TypeMetadataKind.propertyType) {
      return (
        sourceTypeMetadata.property === targetTypeMetadata.property &&
        isAssignable(
          sourceTypeMetadata.child,
          targetTypeMetadata.child,
          visitedTypeMetadata,
        )
      );
    }

    return false;
  }

  if (sourceTypeMetadata.kind === TypeMetadataKind.stringIndexSignatureType) {
    if (targetTypeMetadata.kind === TypeMetadataKind.objectType) {
      return true;
    }

    if (targetTypeMetadata.kind === TypeMetadataKind.stringIndexSignatureType) {
      return isAssignable(
        sourceTypeMetadata.child,
        targetTypeMetadata.child,
        visitedTypeMetadata,
      );
    }

    return false;
  }

  if (sourceTypeMetadata.kind === TypeMetadataKind.objectType) {
    return targetTypeMetadata.kind === TypeMetadataKind.objectType;
  }

  return sourceTypeMetadata.kind === targetTypeMetadata.kind;
}

function isArrayTypeMetadataAssignableTo(
  sourceTypeMetadata: ArrayTypeMetadata,
  targetTypeMetadata: ArrayTypeMetadata,
  visitedTypeMetadata: WeakMap<TypeMetadata, Set<TypeMetadata>>,
): boolean {
  if (
    getArrayTypeMetadataMinItems(sourceTypeMetadata) <
    getArrayTypeMetadataMinItems(targetTypeMetadata)
  ) {
    return false;
  }

  if (
    getArrayTypeMetadataMaxItems(sourceTypeMetadata) >
    getArrayTypeMetadataMaxItems(targetTypeMetadata)
  ) {
    return false;
  }

  const prefixItemsLength: number = Math.max(
    sourceTypeMetadata.prefixItems?.length ?? 0,
    targetTypeMetadata.prefixItems?.length ?? 0,
  );
  const sourceMaxItems: number =
    getArrayTypeMetadataMaxItems(sourceTypeMetadata);
  const lastPrefixIndexToCheck: number =
    Math.min(sourceMaxItems, prefixItemsLength) - 1;

  for (let i: number = 0; i <= lastPrefixIndexToCheck; i += 1) {
    if (
      !isAssignable(
        getArrayTypeMetadataItem(sourceTypeMetadata, i),
        getArrayTypeMetadataItem(targetTypeMetadata, i),
        visitedTypeMetadata,
      )
    ) {
      return false;
    }
  }

  if (sourceMaxItems > prefixItemsLength) {
    return isAssignable(
      sourceTypeMetadata.child,
      targetTypeMetadata.child,
      visitedTypeMetadata,
    );
  }

  return true;
}

function isArrayLiteralAssignableTo(
  literal: JsonValue[],
  targetTypeMetadata: ArrayTypeMetadata,
  visitedTypeMetadata: WeakMap<TypeMetadata, Set<TypeMetadata>>,
): boolean {
  if (literal.length < getArrayTypeMetadataMinItems(targetTypeMetadata)) {
    return false;
  }

  if (literal.length > getArrayTypeMetadataMaxItems(targetTypeMetadata)) {
    return false;
  }

  return literal.every((item: JsonValue, index: number) =>
    isLiteralAssignableTo(
      item,
      getArrayTypeMetadataItem(targetTypeMetadata, index),
      visitedTypeMetadata,
    ),
  );
}

function isJsonValueEqual(left: JsonValue, right: JsonValue): boolean {
  if (left === right) {
    return true;
  }

  if (
    left === null ||
    right === null ||
    typeof left !== 'object' ||
    typeof right !== 'object'
  ) {
    return false;
  }

  if (Array.isArray(left)) {
    if (!Array.isArray(right) || left.length !== right.length) {
      return false;
    }

    return left.every((item: JsonValue, index: number) =>
      isJsonValueEqual(item, right[index] as JsonValue),
    );
  }

  if (Array.isArray(right)) {
    return false;
  }

  const leftKeys: (keyof typeof left)[] = Object.keys(left);
  const rightKeys: string[] = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every(
    (key: keyof typeof left) =>
      Object.hasOwn(right, key) &&
      isJsonValueEqual(left[key] as JsonValue, right[key] as JsonValue),
  );
}

function isLiteralAssignableTo(
  literal: JsonValue,
  targetTypeMetadata: TypeMetadata,
  visitedTypeMetadata: WeakMap<TypeMetadata, Set<TypeMetadata>>,
): boolean {
  if (targetTypeMetadata.kind === TypeMetadataKind.literalType) {
    return isJsonValueEqual(literal, targetTypeMetadata.literal);
  }

  if (literal === null) {
    return false;
  }

  if (typeof literal === 'string') {
    return targetTypeMetadata.kind === TypeMetadataKind.stringType;
  }

  if (typeof literal === 'number') {
    return isNumberTypeMetadata(targetTypeMetadata);
  }

  if (typeof literal === 'boolean') {
    return targetTypeMetadata.kind === TypeMetadataKind.booleanType;
  }

  if (Array.isArray(literal)) {
    if (targetTypeMetadata.kind === TypeMetadataKind.objectType) {
      return true;
    }

    if (targetTypeMetadata.kind === TypeMetadataKind.arrayType) {
      return isArrayLiteralAssignableTo(
        literal,
        targetTypeMetadata,
        visitedTypeMetadata,
      );
    }

    return false;
  }

  if (targetTypeMetadata.kind === TypeMetadataKind.objectType) {
    return true;
  }

  if (targetTypeMetadata.kind === TypeMetadataKind.propertyType) {
    if (!Object.hasOwn(literal, targetTypeMetadata.property)) {
      return targetTypeMetadata.isOptional;
    }

    return isLiteralAssignableTo(
      literal[targetTypeMetadata.property] as JsonValue,
      targetTypeMetadata.child,
      visitedTypeMetadata,
    );
  }

  if (targetTypeMetadata.kind === TypeMetadataKind.stringIndexSignatureType) {
    return Object.values(literal).every((value: JsonValue) =>
      isLiteralAssignableTo(
        value,
        targetTypeMetadata.child,
        visitedTypeMetadata,
      ),
    );
  }

  return false;
}

function isNumberTypeMetadata(typeMetadata: TypeMetadata): boolean {
  return (
    typeMetadata.kind === TypeMetadataKind.floatType ||
    typeMetadata.kind === TypeMetadataKind.integerType
  );
}
