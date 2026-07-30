import { InversifyValidationError } from '@inversifyjs/validation-common';
import { type ErrorObject } from 'ajv';

export class InversifyOpenApiValidationError extends InversifyValidationError<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Partial<ErrorObject<string, Record<string, any>, unknown>>[]
> {}
