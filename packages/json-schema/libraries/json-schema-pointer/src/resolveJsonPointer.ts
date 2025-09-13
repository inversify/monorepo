import { JsonValue } from '@inversifyjs/json-schema-types';

const SEPARATOR: string = '/';
const SEPARATOR_ENCODED: string = '~1';
const ENCODER: string = '~';
const ENCODER_ENCODED: string = '~0';

export function resolveJsonPointer(
  json: JsonValue,
  pointer: string,
): JsonValue | undefined {
  const pointerSegments: string[] = pointer
    .split(SEPARATOR)
    .map((segment: string) =>
      segment
        .replaceAll(SEPARATOR_ENCODED, SEPARATOR)
        .replaceAll(ENCODER_ENCODED, ENCODER),
    );

  if (pointerSegments[0] === undefined || pointerSegments[0] !== '') {
    throw new Error('Invalid JSON pointer!');
  }

  let result: JsonValue | undefined = json;

  for (let i: number = 1; i < pointerSegments.length; ++i) {
    const pointerSegment: string = pointerSegments[i] as string;

    if (result == null || typeof result !== 'object') {
      result = undefined;
      break;
    }

    if (Array.isArray(result)) {
      const pointerIndex: number = parseInt(pointerSegment);

      if (Number.isNaN(pointerIndex)) {
        result = undefined;
        break;
      }

      result = result[pointerIndex];
    } else {
      result = result[pointerSegment];
    }
  }

  return result;
}
