import { type JsonValue } from '@inversifyjs/json-schema-types';

export function areJsonValuesEqual(left: JsonValue, right: JsonValue): boolean {
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
      areJsonValuesEqual(item, right[index] as JsonValue),
    );
  }

  if (Array.isArray(right)) {
    return false;
  }

  const leftKeys: string[] = Object.keys(left);
  const rightKeys: string[] = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every(
    (key: string) =>
      Object.hasOwn(right, key) &&
      areJsonValuesEqual(left[key] as JsonValue, right[key] as JsonValue),
  );
}
