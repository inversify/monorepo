import { resolveJsonPointer } from '@inversifyjs/json-schema-pointer';
import {
  type JsonValue,
  type JsonValueObject,
} from '@inversifyjs/json-schema-types';
import {
  type OpenApi3Dot2Object,
  type OpenApi3Dot2OperationObject,
  type OpenApi3Dot2ReferenceObject,
  type OpenApi3Dot2RequestBodyObject,
} from '@inversifyjs/open-api-types/v3Dot2';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

export function getRequestBodyObject(
  openApiObject: OpenApi3Dot2Object,
  operationObject: OpenApi3Dot2OperationObject,
  method: string,
  path: string,
): OpenApi3Dot2RequestBodyObject {
  const requestBodyObject:
    | OpenApi3Dot2RequestBodyObject
    | OpenApi3Dot2ReferenceObject
    | undefined = operationObject.requestBody;

  if (requestBodyObject === undefined) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `No requestBody found for method ${method} for path ${path}`,
    );
  }

  let ref: string | undefined = (
    requestBodyObject as Partial<OpenApi3Dot2ReferenceObject>
  ).$ref;

  let derreferencedRequestBodyObject: JsonValueObject | undefined =
    requestBodyObject as unknown as JsonValueObject;

  while (ref !== undefined) {
    const resolvedRef: JsonValue | undefined = resolveJsonPointer(
      openApiObject as unknown as JsonValue,
      ref,
    );

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

    ref = (
      derreferencedRequestBodyObject as Partial<OpenApi3Dot2ReferenceObject>
    ).$ref;
  }

  return derreferencedRequestBodyObject as unknown as OpenApi3Dot2RequestBodyObject;
}
