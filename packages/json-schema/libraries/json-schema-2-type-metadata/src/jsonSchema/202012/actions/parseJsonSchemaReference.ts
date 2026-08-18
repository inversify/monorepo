import { type ParsedJsonSchemaReference } from '../models/ParsedJsonSchemaReference.js';

const FRAGMENT_SEPARATOR: string = '#';

// https://json-schema.org/draft/2020-12/json-schema-core.html#name-defining-location-independe
const PLAIN_NAME_PATTERN: RegExp = /^[A-Za-z_][A-Za-z0-9._-]*$/;

/**
 * Extracts the only two things a reference can be understood as without
 * resolving it as a URI: whether it carries a path part, and its fragment when
 * that fragment is a plain name.
 */
export function parseJsonSchemaReference(
  reference: string,
): ParsedJsonSchemaReference {
  const fragmentSeparatorIndex: number = reference.indexOf(FRAGMENT_SEPARATOR);

  if (fragmentSeparatorIndex === -1) {
    return {
      anchor: undefined,
      isLocal: false,
      value: reference,
    };
  }

  const fragment: string = reference.slice(fragmentSeparatorIndex + 1);

  return {
    anchor: PLAIN_NAME_PATTERN.test(fragment) ? fragment : undefined,
    isLocal: fragmentSeparatorIndex === 0,
    value: reference,
  };
}
