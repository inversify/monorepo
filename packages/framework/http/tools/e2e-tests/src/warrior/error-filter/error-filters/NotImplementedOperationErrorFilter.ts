import {
  CatchError,
  ErrorFilter,
  NotImplementedHttpResponse,
} from '@inversifyjs/http-core';

import { NotImplementedOperationError } from '../errors/NotImplementedOperationError';

@CatchError(NotImplementedOperationError)
export class NotImplementedOperationErrorFilter
  implements ErrorFilter<NotImplementedOperationError>
{
  public catch(error: NotImplementedOperationError): void {
    throw new NotImplementedHttpResponse(error.message, undefined, {
      cause: error,
    });
  }
}
