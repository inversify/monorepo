import {
  CatchError,
  ErrorFilter,
  UnprocessableEntityHttpResponse,
} from '@inversifyjs/http-core';

import { InvalidOperationError } from './errorFilterApiInvalidOperationError';

// Begin-example
@CatchError(InvalidOperationError)
export class InvalidOperationErrorFilter
  implements ErrorFilter<InvalidOperationError>
{
  public catch(error: InvalidOperationError): void {
    throw new UnprocessableEntityHttpResponse(error.message, undefined, {
      cause: error,
    });
  }
}
// End-example
