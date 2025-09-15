import { Controller, Get, UseErrorFilter } from '@inversifyjs/http-core';

import { InvalidOperationError } from './errorFilterApiInvalidOperationError';
import { InvalidOperationErrorFilter } from './errorFilterApiInvalidOperationErrorFilter';

// Begin-example
@Controller('/products')
@UseErrorFilter(InvalidOperationErrorFilter)
export class ProductController {
  @Get('/:id/validate')
  public async validateProduct(): Promise<void> {
    throw new InvalidOperationError('Product validation failed');
  }
}
// End-example
