import {
  type JsonValue,
  type JsonValueObject,
} from '@inversifyjs/json-schema-types';
import {
  type OpenApi3Dot2OperationObject,
  type OpenApi3Dot2ReferenceObject,
  type OpenApi3Dot2RequestBodyObject,
} from '@inversifyjs/open-api-types/v3Dot2';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { type OpenApiResolver } from '../../services/OpenApiResolver.js';

export function getRequestBodyObject(
  openApiResolver: OpenApiResolver,
  operationObject: OpenApi3Dot2OperationObject,
  method: string,
  route: string,
): OpenApi3Dot2RequestBodyObject {
  const requestBodyObject:
    | OpenApi3Dot2RequestBodyObject
    | OpenApi3Dot2ReferenceObject
    | undefined = operationObject.requestBody;

  if (requestBodyObject === undefined) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `No requestBody found for ${method.toUpperCase()} ${route}`,
    );
  }

  const ref: string | undefined = (
    requestBodyObject as Partial<OpenApi3Dot2ReferenceObject>
  ).$ref;

  let derreferencedRequestBodyObject: JsonValueObject | undefined =
    requestBodyObject as unknown as JsonValueObject;

  if (ref !== undefined) {
    const resolvedRef: JsonValue | undefined =
      openApiResolver.deepResolveReference(ref);

    if (resolvedRef === undefined) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.validationFailed,
        `Could not resolve $ref pointer ${ref} for ${method.toUpperCase()} ${route}`,
      );
    }

    if (
      resolvedRef === null ||
      typeof resolvedRef !== 'object' ||
      Array.isArray(resolvedRef)
    ) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.validationFailed,
        `Resolved $ref pointer ${ref} is not a valid request body object for ${method.toUpperCase()} ${route}`,
      );
    }

    derreferencedRequestBodyObject = resolvedRef;
  }

  return derreferencedRequestBodyObject as unknown as OpenApi3Dot2RequestBodyObject;
}
