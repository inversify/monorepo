import { Controller, Get, UseErrorFilter } from '@inversifyjs/http-core';

import {
  OutOfStockErrorFilter,
  WarehouseErrorFilter,
} from './errorFilterApiDiscriminatedHierarchyErrorFilters.js';
import {
  ClosedWarehouseError,
  OutOfStockError,
  WarehouseError,
} from './errorFilterApiDiscriminatedHierarchyErrors.js';

// Begin-example
@Controller('/warehouse')
@UseErrorFilter(OutOfStockErrorFilter, WarehouseErrorFilter)
export class WarehouseController {
  @Get('/out-of-stock')
  public outOfStock(): void {
    throw new OutOfStockError('SKU-1');
  }

  @Get('/closed')
  public closed(): void {
    throw new WarehouseError('Warehouse is closed');
  }

  @Get('/maintenance')
  public maintenance(): void {
    throw new ClosedWarehouseError('Warehouse is closed for maintenance');
  }
}
// End-example
