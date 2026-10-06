import { Discriminated } from '@inversifyjs/http-core';

// Begin-example
@Discriminated('warehouse')
export class WarehouseError extends Error {}

@Discriminated('out-of-stock')
export class OutOfStockError extends WarehouseError {
  constructor(sku: string) {
    super(`Product ${sku} is out of stock`);
  }
}

export class ClosedWarehouseError extends WarehouseError {}
// End-example
