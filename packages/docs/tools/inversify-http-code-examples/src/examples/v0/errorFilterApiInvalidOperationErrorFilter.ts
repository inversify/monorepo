import {
  CatchError,
  ErrorFilter,
  UnprocessableEntityHttpResponse,
} from '@inversifyjs/http-core';

import { InvalidOperationError } from './errorFilterApiInvalidOperationError';

// Begin-example
@CatchError(InvalidOperationError)
export class InvalidOperationErrorFilter implements ErrorFilter<InvalidOperationError> {
  public catch(error: InvalidOperationError): void {
    throw new UnprocessableEntityHttpResponse(
      { message: error.message },
      error.message,
      {
        cause: error,
      },
    );
  }
}
// End-example
