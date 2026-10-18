import { type Pipe } from '@inversifyjs/http-core';
import { StandardSchemaValidationPipe } from '@inversifyjs/standard-schema-validation';

export const standardSchemaValidationPipe: Pipe =
  new StandardSchemaValidationPipe();
