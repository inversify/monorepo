import { InversifyValidationError } from '@inversifyjs/validation-common';
import { type StandardSchemaV1 } from '@standard-schema/spec';

export class InversifyStandardSchemaValidationError extends InversifyValidationError<
  readonly StandardSchemaV1.Issue[]
> {}
