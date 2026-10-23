import {
  BadRequestHttpResponse,
  CatchError,
  ErrorFilter,
} from '@inversifyjs/http-core';

import { NotImplementedOperationError } from '../errors/NotImplementedOperationError.js';

@CatchError(NotImplementedOperationError)
export class BadRequestOperationErrorFilter implements ErrorFilter<NotImplementedOperationError> {
  public catch(error: NotImplementedOperationError): void {
    throw new BadRequestHttpResponse(
      { message: error.message },
      error.message,
      {
        cause: error,
      },
    );
  }
}
