import {
  type OpenApi3Dot2Object,
  type OpenApi3Dot2PathItemObject,
} from '@inversifyjs/open-api-types/v3Dot2';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

export function getPathItemObject(
  openApiObject: OpenApi3Dot2Object,
  path: string,
): OpenApi3Dot2PathItemObject {
  const pathItemObject: OpenApi3Dot2PathItemObject | undefined =
    openApiObject.paths?.[path];

  if (pathItemObject === undefined) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `Path ${path} not found`,
    );
  }

  return pathItemObject;
}
