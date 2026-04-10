import { type OpenApi3Dot2RequestBodyObject } from '@inversifyjs/open-api-types/v3Dot2';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

export function inferContentType(
  requestBodyObject: OpenApi3Dot2RequestBodyObject,
  method: string,
): string {
  const contentTypes: string[] = Object.keys(requestBodyObject.content);

  if (contentTypes.length === 1) {
    return contentTypes[0] as string;
  }

  throw new InversifyValidationError(
    InversifyValidationErrorKind.validationFailed,
    `Cannot determine content type for request body validation for method ${method}: no content type provided and multiple content types defined in OpenAPI spec (${contentTypes.join(
      ', ',
    )})`,
  );
}
