// Begin-example
import { Controller, Get } from '@inversifyjs/http-core';
import { OasParameter } from '@inversifyjs/http-open-api';
import { ValidatedQuery } from '@inversifyjs/open-api-validation';

interface ProductQuery {
  limit?: number;
  search?: string;
}

@Controller('/products')
export class ProductController {
  @OasParameter({
    in: 'query',
    name: 'search',
    required: false,
    schema: { type: 'string' },
  })
  @OasParameter({
    in: 'query',
    name: 'limit',
    required: false,
    schema: { minimum: 1, type: 'integer' },
  })
  @Get('/')
  public getProducts(@ValidatedQuery() query: ProductQuery): string {
    return `Search: ${query.search ?? ''}`;
  }
}
