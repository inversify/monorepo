import { type JsonSchemaType } from '@inversifyjs/json-schema-types/2020-12';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { maybeCoerceStringOrStringArrayToNonNullableBoolean } from './maybeCoerceStringOrStringArrayToNonNullableBoolean.js';
import { maybeCoerceStringOrStringArrayToNonNullableInteger } from './maybeCoerceStringOrStringArrayToNonNullableInteger.js';
import { maybeCoerceStringOrStringArrayToNonNullableNumber } from './maybeCoerceStringOrStringArrayToNonNullableNumber.js';
import { maybeCoerceStringOrStringArrayToNull } from './maybeCoerceStringOrStringArrayToNull.js';
import { maybeCoerceStringOrStringArrayToNullableBoolean } from './maybeCoerceStringOrStringArrayToNullableBoolean.js';
import { maybeCoerceStringOrStringArrayToNullableInteger } from './maybeCoerceStringOrStringArrayToNullableInteger.js';
import { maybeCoerceStringOrStringArrayToNullableNumber } from './maybeCoerceStringOrStringArrayToNullableNumber.js';

export function buildNonArrayHeaderParse(
  isNullable: boolean,
  schemaRef: string,
  type: JsonSchemaType,
): (value: string | string[] | undefined) => unknown {
  switch (type) {
    case 'boolean':
      if (isNullable) {
        return maybeCoerceStringOrStringArrayToNullableBoolean;
      } else {
        return maybeCoerceStringOrStringArrayToNonNullableBoolean;
      }
    case 'integer':
      if (isNullable) {
        return maybeCoerceStringOrStringArrayToNullableInteger;
      } else {
        return maybeCoerceStringOrStringArrayToNonNullableInteger;
      }
    case 'number':
      if (isNullable) {
        return maybeCoerceStringOrStringArrayToNullableNumber;
      } else {
        return maybeCoerceStringOrStringArrayToNonNullableNumber;
      }
    case 'null':
      return maybeCoerceStringOrStringArrayToNull;
    case 'string':
      return (value: string | string[] | undefined): unknown => value;
    default:
      throw new InversifyValidationError(
        InversifyValidationErrorKind.invalidConfiguration,
        `Unsupported header parameter "${schemaRef}" type: "${type}"`,
      );
  }
}
