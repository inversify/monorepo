import { InversifyValidationError } from '@inversifyjs/validation-common';
import { type ValidationError } from 'class-validator';

export class InversifyClassValidationError extends InversifyValidationError<
  ValidationError[]
> {}
