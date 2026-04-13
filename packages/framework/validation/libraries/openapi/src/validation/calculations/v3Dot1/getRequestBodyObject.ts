import {
  type JsonValue,
  type JsonValueObject,
} from '@inversifyjs/json-schema-types';
import {
  type OpenApi3Dot1OperationObject,
  type OpenApi3Dot1ReferenceObject,
  type OpenApi3Dot1RequestBodyObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { type BodyValidationInputParam } from '../../models/BodyValidationInputParam.js';
import { type OpenApiResolver } from '../../services/OpenApiResolver.js';

export function getRequestBodyObject(
  openApiResolver: OpenApiResolver,
  operationObject: OpenApi3Dot1OperationObject,
  inputParam: BodyValidationInputParam<unknown>,
): OpenApi3Dot1RequestBodyObject {
  const requestBodyObject:
    | OpenApi3Dot1RequestBodyObject
    | OpenApi3Dot1ReferenceObject
    | undefined = operationObject.requestBody;

  if (requestBodyObject === undefined) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `No requestBody found for method ${inputParam.method} for path ${inputParam.path}`,
    );
  }

  const ref: string | undefined = (
    requestBodyObject as Partial<OpenApi3Dot1ReferenceObject>
  ).$ref;

  let derreferencedRequestBodyObject: JsonValueObject | undefined =
    requestBodyObject as unknown as JsonValueObject;

  if (ref !== undefined) {
    const resolvedRef: JsonValue | undefined =
      openApiResolver.deepResolveReference(ref);

    if (resolvedRef === undefined) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.validationFailed,
        `Could not resolve $ref pointer ${ref}`,
      );
    }

    if (
      resolvedRef === null ||
      typeof resolvedRef !== 'object' ||
      Array.isArray(resolvedRef)
    ) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.validationFailed,
        `Resolved $ref pointer ${ref} is not a valid object`,
      );
    }

    derreferencedRequestBodyObject = resolvedRef;
  }

  return derreferencedRequestBodyObject as unknown as OpenApi3Dot1RequestBodyObject;
}
