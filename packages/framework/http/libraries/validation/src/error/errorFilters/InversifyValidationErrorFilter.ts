import { CatchError, ErrorFilter } from '@inversifyjs/framework-core';
import { BadRequestHttpResponse } from '@inversifyjs/http-core';
import { InversifyValidationError } from '@inversifyjs/validation-common';

@CatchError(InversifyValidationError)
export class InversifyValidationErrorFilter
  implements ErrorFilter<InversifyValidationError, unknown, unknown, unknown>
{
  public catch(error: InversifyValidationError): never {
    throw new BadRequestHttpResponse(error.message, undefined, {
      cause: error,
    });
  }
}
