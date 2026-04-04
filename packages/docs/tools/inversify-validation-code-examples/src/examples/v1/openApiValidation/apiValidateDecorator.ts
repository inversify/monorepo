// Begin-example
import { Body, Controller, Post } from '@inversifyjs/http-core';
import { OasRequestBody } from '@inversifyjs/http-open-api';
import { Validate } from '@inversifyjs/http-openapi-validation';

interface Product {
  name: string;
  price: number;
}

@Controller('/products')
export class ProductController {
  @OasRequestBody({
    content: {
      'application/json': {
        schema: {
          additionalProperties: false,
          properties: {
            name: { minLength: 1, type: 'string' },
            price: { minimum: 0, type: 'number' },
          },
          required: ['name', 'price'],
          type: 'object',
        },
      },
    },
  })
  @Post('/')
  public createProduct(@Validate() @Body() product: Product): string {
    return `Created product: ${product.name}`;
  }
}
