import { CatchError, ErrorFilter } from '@inversifyjs/framework-core';
import { BadRequestHttpResponse } from '@inversifyjs/http-core';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

@CatchError(InversifyValidationError)
export class InversifyValidationErrorFilter implements ErrorFilter<
  InversifyValidationError,
  unknown,
  unknown,
  unknown
> {
  public catch(error: InversifyValidationError): never {
    if (error.kind === InversifyValidationErrorKind.validationFailed) {
      throw new BadRequestHttpResponse(
        { message: error.message },
        error.message,
        {
          cause: error,
        },
      );
    }

    throw error;
  }
}
