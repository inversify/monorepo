import {
  type AndTypeMetadata,
  type ArrayTypeMetadata,
  type StringIndexSignatureTypeMetadata,
  type TypeMetadata,
  TypeMetadataKind,
} from '@inversifyjs/json-schema-type-metadata';
import {
  type JsonValue,
  type JsonValueObject,
} from '@inversifyjs/json-schema-types';

import { areJsonValuesEqual } from './areJsonValuesEqual.js';

export function doesJsonValueInhabitTypeMetadata(
  value: JsonValue,
  typeMetadata: TypeMetadata,
): boolean {
  return doesJsonValueInhabitTypeMetadataRecursive(
    value,
    typeMetadata,
    new Map(),
  );
}

function doesJsonValueInhabitTypeMetadataRecursive(
  value: JsonValue,
  typeMetadata: TypeMetadata,
  visitingTypeMetadataValues: Map<TypeMetadata, Set<JsonValue>>,
): boolean {
  const visitingValues: Set<JsonValue> | undefined =
    visitingTypeMetadataValues.get(typeMetadata);

  if (visitingValues?.has(value) === true) {
    return typeMetadata.kind !== TypeMetadataKind.or;
  }

  const nextVisitingValues: Set<JsonValue> = visitingValues ?? new Set();

  nextVisitingValues.add(value);
  visitingTypeMetadataValues.set(typeMetadata, nextVisitingValues);

  try {
    return doesJsonValueInhabitTypeMetadataWhileVisiting(
      value,
      typeMetadata,
      visitingTypeMetadataValues,
    );
  } finally {
    nextVisitingValues.delete(value);

    if (nextVisitingValues.size === 0) {
      visitingTypeMetadataValues.delete(typeMetadata);
    }
  }
}

function doesJsonValueInhabitTypeMetadataWhileVisiting(
  value: JsonValue,
  typeMetadata: TypeMetadata,
  visitingTypeMetadataValues: Map<TypeMetadata, Set<JsonValue>>,
): boolean {
  switch (typeMetadata.kind) {
    case TypeMetadataKind.and:
      return doesJsonValueInhabitAndTypeMetadata(
        value,
        typeMetadata,
        visitingTypeMetadataValues,
      );
    case TypeMetadataKind.anyType:
      return true;
    case TypeMetadataKind.arrayType:
      return doesJsonValueInhabitArrayTypeMetadata(
        value,
        typeMetadata,
        visitingTypeMetadataValues,
      );
    case TypeMetadataKind.booleanType:
      return typeof value === 'boolean';
    case TypeMetadataKind.floatType:
      return typeof value === 'number' && Number.isFinite(value);
    case TypeMetadataKind.integerType:
      return typeof value === 'number' && Number.isInteger(value);
    case TypeMetadataKind.literalType:
      return areJsonValuesEqual(value, typeMetadata.literal);
    case TypeMetadataKind.noneType:
      return false;
    case TypeMetadataKind.objectType:
      return isJsonValueObject(value);
    case TypeMetadataKind.or:
      return typeMetadata.children.some((child: TypeMetadata) =>
        doesJsonValueInhabitTypeMetadataRecursive(
          value,
          child,
          visitingTypeMetadataValues,
        ),
      );
    case TypeMetadataKind.propertyType:
      if (!isJsonValueObject(value)) {
        return true;
      }

      if (!Object.hasOwn(value, typeMetadata.property)) {
        return typeMetadata.isOptional;
      }

      return doesJsonValueInhabitTypeMetadataRecursive(
        value[typeMetadata.property] as JsonValue,
        typeMetadata.child,
        visitingTypeMetadataValues,
      );
    case TypeMetadataKind.stringIndexSignatureType:
      return doesJsonValueInhabitStringIndexSignatureTypeMetadata(
        value,
        typeMetadata,
        new Set(),
        visitingTypeMetadataValues,
      );
    case TypeMetadataKind.stringType:
      return typeof value === 'string';
  }
}

function doesJsonValueInhabitArrayTypeMetadata(
  value: JsonValue,
  typeMetadata: ArrayTypeMetadata,
  visitingTypeMetadataValues: Map<TypeMetadata, Set<JsonValue>>,
): boolean {
  if (!Array.isArray(value)) {
    return false;
  }

  const prefixItems: TypeMetadata[] = typeMetadata.prefixItems ?? [];

  if (value.length < prefixItems.length) {
    return false;
  }

  return value.every((item: JsonValue, index: number) =>
    doesJsonValueInhabitTypeMetadataRecursive(
      item,
      prefixItems[index] ?? typeMetadata.child,
      visitingTypeMetadataValues,
    ),
  );
}

function doesJsonValueInhabitAndTypeMetadata(
  value: JsonValue,
  typeMetadata: AndTypeMetadata,
  visitingTypeMetadataValues: Map<TypeMetadata, Set<JsonValue>>,
): boolean {
  const declaredProperties: Set<string> = new Set();

  for (const child of typeMetadata.children) {
    if (child.kind === TypeMetadataKind.propertyType) {
      declaredProperties.add(child.property);
    }
  }

  return typeMetadata.children.every((child: TypeMetadata) => {
    if (child.kind === TypeMetadataKind.stringIndexSignatureType) {
      return doesJsonValueInhabitStringIndexSignatureTypeMetadata(
        value,
        child,
        declaredProperties,
        visitingTypeMetadataValues,
      );
    }

    return doesJsonValueInhabitTypeMetadataRecursive(
      value,
      child,
      visitingTypeMetadataValues,
    );
  });
}

function doesJsonValueInhabitStringIndexSignatureTypeMetadata(
  value: JsonValue,
  typeMetadata: StringIndexSignatureTypeMetadata,
  declaredProperties: Set<string>,
  visitingTypeMetadataValues: Map<TypeMetadata, Set<JsonValue>>,
): boolean {
  if (!isJsonValueObject(value)) {
    return true;
  }

  return Object.entries(value).every(([key, item]: [string, JsonValue]) => {
    if (declaredProperties.has(key)) {
      return true;
    }

    return doesJsonValueInhabitTypeMetadataRecursive(
      item,
      typeMetadata.child,
      visitingTypeMetadataValues,
    );
  });
}

function isJsonValueObject(value: JsonValue): value is JsonValueObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
