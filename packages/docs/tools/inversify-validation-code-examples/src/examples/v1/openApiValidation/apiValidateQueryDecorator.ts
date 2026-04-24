// Begin-example
import { Controller, Get } from '@inversifyjs/http-core';
import { OasParameter } from '@inversifyjs/http-open-api';
import { ValidatedQuery } from '@inversifyjs/open-api-validation';

@Controller('/products')
export class ProductController {
  @OasParameter({
    in: 'query',
    name: 'search',
    required: true,
    schema: { type: 'string' },
  })
  @OasParameter({
    in: 'query',
    name: 'limit',
    required: false,
    schema: { minimum: 1, type: 'integer' },
  })
  @Get('/')
  public getProducts(@ValidatedQuery() query: Record<string, unknown>): string {
    return `Search: ${String(query['search'])}`;
  }
}
