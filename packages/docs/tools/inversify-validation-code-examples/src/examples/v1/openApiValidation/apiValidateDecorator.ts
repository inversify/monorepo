// Begin-example
import { Controller, Post } from '@inversifyjs/http-core';
import { OasRequestBody } from '@inversifyjs/http-open-api';
import { ValidatedBody } from '@inversifyjs/open-api-validation';

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
  public createProduct(@ValidatedBody() product: Product): string {
    return `Created product: ${product.name}`;
  }
}
