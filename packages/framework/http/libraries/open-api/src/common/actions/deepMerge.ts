import {
  type JsonValue,
  type JsonValueObject,
} from '@inversifyjs/json-schema-types';

export function deepMerge(target: JsonValue, source: JsonValue): JsonValue {
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
