import {
  type JsonValue,
  type JsonValueObject,
} from '@inversifyjs/json-schema-types';

const DANGEROUS_KEYS: Set<string> = new Set([
  '__proto__',
  'prototype',
  'constructor',
]);

function deepCloneJsonValue(value: JsonValue): JsonValue {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(deepCloneJsonValue);
  }

  const clone: JsonValueObject = {};

  for (const [key, valueValue] of Object.entries(value)) {
    if (!DANGEROUS_KEYS.has(key)) {
      clone[key] = deepCloneJsonValue(valueValue);
    }
  }

  return clone;
}

export function deepMerge(
  target: JsonValue | undefined,
  source: JsonValue,
): JsonValue {
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
    target.push(...source.map(deepCloneJsonValue));
  } else {
    target.push(deepCloneJsonValue(source));
  }

  return target;
}

function deepMergeNonArrayObjects(
  target: JsonValueObject,
  source: JsonValueObject,
): JsonValueObject {
  for (const [key, sourceValue] of Object.entries(source)) {
    if (DANGEROUS_KEYS.has(key)) {
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(target, key)) {
      target[key] = deepMerge(target[key], sourceValue);
    } else {
      target[key] = deepCloneJsonValue(sourceValue);
    }
  }

  return target;
}
