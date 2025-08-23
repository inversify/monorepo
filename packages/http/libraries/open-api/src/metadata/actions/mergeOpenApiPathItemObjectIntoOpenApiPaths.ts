import { JsonValue, JsonValueObject } from '@inversifyjs/json-schema-types';
import {
  OpenApi3Dot1Object,
  OpenApi3Dot1PathItemObject,
} from '@inversifyjs/open-api-types/v3Dot1';

export function mergeOpenApiPathItemObjectIntoOpenApiPaths(
  target: OpenApi3Dot1Object,
  path: string,
  openApiPathItemObject: OpenApi3Dot1PathItemObject,
): OpenApi3Dot1Object {
  if (target.paths === undefined) {
    target.paths = {};
  }

  if (target.paths[path] === undefined) {
    target.paths[path] = openApiPathItemObject;
  } else {
    target.paths[path] = deepMerge(
      target.paths[path] as JsonValueObject,
      openApiPathItemObject as JsonValueObject,
    ) as OpenApi3Dot1PathItemObject;
  }

  return target;
}

function deepMerge(target: JsonValue, source: JsonValue): JsonValue {
  if (Array.isArray(target)) {
    return deepMergeArray(target, source);
  }

  if (
    target !== null &&
    typeof target === 'object' &&
    source !== null &&
    typeof source === 'object' &&
    !Array.isArray(source)
  ) {
    return deepMergeNonArrayObjects(target, source);
  }

  return source;
}

function deepMergeArray(target: JsonValue[], source: JsonValue): JsonValue[] {
  if (Array.isArray(source)) {
    target.push(...source);
  } else {
    target.push(source);
  }

  return target;
}

function deepMergeNonArrayObjects(
  target: JsonValueObject,
  source: JsonValueObject,
): JsonValueObject {
  for (const key of Object.keys(source)) {
    const sourceValue: JsonValue | undefined = source[key];

    if (sourceValue !== undefined) {
      const targetValue: JsonValue | undefined = target[key];

      if (targetValue !== undefined) {
        target[key] = deepMerge(targetValue, sourceValue);
      } else {
        target[key] = sourceValue;
      }
    }
  }

  return target;
}
