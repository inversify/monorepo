import { resolveJsonPointer } from '@inversifyjs/json-schema-pointer';
import {
  type JsonValue,
  type JsonValueObject,
} from '@inversifyjs/json-schema-types';
import {
  type OpenApi3Dot1Object,
  type OpenApi3Dot1OperationObject,
  type OpenApi3Dot1ReferenceObject,
  type OpenApi3Dot1RequestBodyObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

export function getRequestBodyObject(
  openApiObject: OpenApi3Dot1Object,
  operationObject: OpenApi3Dot1OperationObject,
  method: string,
  path: string,
): OpenApi3Dot1RequestBodyObject {
  const requestBodyObject:
    | OpenApi3Dot1RequestBodyObject
    | OpenApi3Dot1ReferenceObject
    | undefined = operationObject.requestBody;

  if (requestBodyObject === undefined) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `No requestBody found for method ${method} for path ${path}`,
    );
  }

  let ref: string | undefined = (
    requestBodyObject as Partial<OpenApi3Dot1ReferenceObject>
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
      derreferencedRequestBodyObject as Partial<OpenApi3Dot1ReferenceObject>
    ).$ref;
  }

  return derreferencedRequestBodyObject as unknown as OpenApi3Dot1RequestBodyObject;
}
