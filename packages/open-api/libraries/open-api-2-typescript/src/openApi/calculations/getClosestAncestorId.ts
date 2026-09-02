import { type JsonValue } from '@inversifyjs/json-schema-types';

import { getClosestAncestorOrNodeId } from './getClosestAncestorOrNodeId.js';

export function getClosestAncestorId(
  rootSchema: JsonValue,
  jsonPointer: string,
  baseId: string,
): string {
  const lastSeparatorIndex: number = jsonPointer.lastIndexOf('/');

  if (lastSeparatorIndex === -1) {
    return baseId;
  }

  return getClosestAncestorOrNodeId(
    rootSchema,
    jsonPointer.slice(0, lastSeparatorIndex),
    baseId,
  );
}
