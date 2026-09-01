import { type JsonValue } from '@inversifyjs/json-schema-types';

import { isTypeScriptIdentifierSyntax } from './toTypeScriptIdentifier.js';

export function printJsonValueLiteral(value: JsonValue): string {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(printJsonValueLiteral).join(', ')}]`;
  }

  const members: string[] = Object.entries(value).map(
    ([key, nestedValue]: [string, JsonValue]) =>
      `${printPropertyKey(key)}: ${printJsonValueLiteral(nestedValue)}`,
  );

  if (members.length === 0) {
    return '{}';
  }

  return `{ ${members.join('; ')} }`;
}

export function printPropertyKey(property: string): string {
  if (isTypeScriptIdentifierSyntax(property)) {
    return property;
  }

  return JSON.stringify(property);
}
