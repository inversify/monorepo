import { type JsonSchemaType } from '@inversifyjs/json-schema-types/2020-12';

export interface CoercionCandidate {
  coercedValue: unknown;
  type: JsonSchemaType;
}

export function coerceHeaderValue(
  rawValue: string | string[] | undefined,
  types: Set<JsonSchemaType>,
): CoercionCandidate[] {
  const candidates: CoercionCandidate[] = [];
  let stringCandidate: CoercionCandidate | undefined;

  for (const type of types) {
    const coerced: CoercionCandidate | undefined = tryCoerce(rawValue, type);

    if (coerced !== undefined) {
      if (type === 'string') {
        stringCandidate = coerced;
      } else {
        candidates.push(coerced);
      }
    }
  }

  if (stringCandidate !== undefined) {
    candidates.unshift(stringCandidate);
  }

  return candidates;
}

function tryCoerce(
  rawValue: string | string[] | undefined,
  type: JsonSchemaType,
): CoercionCandidate | undefined {
  switch (type) {
    case 'string': {
      const value: string | undefined = Array.isArray(rawValue)
        ? rawValue[0]
        : rawValue;

      if (value === undefined) {
        return undefined;
      }

      return { coercedValue: value, type };
    }
    case 'integer': {
      const value: string | undefined = Array.isArray(rawValue)
        ? rawValue[0]
        : rawValue;

      if (value === undefined) {
        return undefined;
      }

      const num: number = Number(value);

      if (Number.isNaN(num) || !Number.isInteger(num)) {
        return undefined;
      }

      return { coercedValue: num, type };
    }
    case 'number': {
      const value: string | undefined = Array.isArray(rawValue)
        ? rawValue[0]
        : rawValue;

      if (value === undefined) {
        return undefined;
      }

      const num: number = Number(value);

      if (Number.isNaN(num)) {
        return undefined;
      }

      return { coercedValue: num, type };
    }
    case 'boolean': {
      const value: string | undefined = Array.isArray(rawValue)
        ? rawValue[0]
        : rawValue;

      if (value === 'true') {
        return { coercedValue: true, type };
      }

      if (value === 'false') {
        return { coercedValue: false, type };
      }

      return undefined;
    }
    case 'array': {
      if (Array.isArray(rawValue)) {
        return { coercedValue: rawValue, type };
      }

      if (rawValue === undefined) {
        return undefined;
      }

      return { coercedValue: rawValue.split(','), type };
    }
    case 'null': {
      const value: string | undefined = Array.isArray(rawValue)
        ? rawValue[0]
        : rawValue;

      if (value === '') {
        return { coercedValue: null, type };
      }

      return undefined;
    }
    default: {
      return undefined;
    }
  }
}
