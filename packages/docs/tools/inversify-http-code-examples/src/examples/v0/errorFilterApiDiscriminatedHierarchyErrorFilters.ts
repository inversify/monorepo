import {
  BadRequestHttpResponse,
  CatchError,
  ConflictHttpResponse,
  type ErrorFilter,
} from '@inversifyjs/http-core';

import {
  OutOfStockError,
  WarehouseError,
} from './errorFilterApiDiscriminatedHierarchyErrors.js';

// Begin-example
@CatchError(WarehouseError)
export class WarehouseErrorFilter implements ErrorFilter<WarehouseError> {
  public catch(error: WarehouseError): void {
    throw new BadRequestHttpResponse(
      { message: error.message },
      error.message,
      {
        cause: error,
      },
    );
  }
}

@CatchError(OutOfStockError)
export class OutOfStockErrorFilter implements ErrorFilter<OutOfStockError> {
  public catch(error: OutOfStockError): void {
    throw new ConflictHttpResponse({ message: error.message }, error.message, {
      cause: error,
    });
  }
}
// End-example
