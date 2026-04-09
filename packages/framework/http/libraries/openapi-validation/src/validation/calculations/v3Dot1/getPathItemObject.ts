import {
  type OpenApi3Dot1Object,
  type OpenApi3Dot1PathItemObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

export function getPathItemObject(
  openApiObject: OpenApi3Dot1Object,
  path: string,
): OpenApi3Dot1PathItemObject {
  const pathItemObject: OpenApi3Dot1PathItemObject | undefined =
    openApiObject.paths?.[path];

  if (pathItemObject === undefined) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `Path ${path} not found`,
    );
  }

  return pathItemObject;
}
