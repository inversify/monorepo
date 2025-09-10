import {
  Body,
  Controller,
  Get,
  HttpStatusCode,
  Params,
  Post,
} from '@inversifyjs/http-core';
import {
  OasDeprecated,
  OasDescription,
  OasExternalDocs,
  OasOperationId,
  OasParameter,
  OasRequestBody,
  OasResponse,
  OasSchema,
  OasSchemaOptionalProperty,
  OasSchemaProperty,
  OasSecurity,
  OasServer,
  OasSummary,
  OasTag,
  ToSchemaFunction,
} from '@inversifyjs/http-open-api';

@OasSchema({
  description: 'A product in the inventory',
  title: 'Product',
})
export class Product {
  @OasSchemaProperty({
    description: 'The unique identifier of the product',
    type: 'string',
  })
  public id!: string;

  @OasSchemaProperty({
    description: 'The name of the product',
    type: 'string',
  })
  public name!: string;

  @OasSchemaProperty({
    description: 'The price of the product',
    minimum: 0,
    type: 'number',
  })
  public price!: number;

  @OasSchemaOptionalProperty({
    description: 'A detailed description of the product',
    type: 'string',
  })
  public description?: string;
}

@OasSchema({
  description: 'Request payload for creating a product',
  title: 'CreateProductRequest',
})
export class CreateProductRequest {
  @OasSchemaProperty({
    description: 'The name of the product',
    type: 'string',
  })
  public name!: string;

  @OasSchemaProperty({
    description: 'The price of the product',
    minimum: 0,
    type: 'number',
  })
  public price!: number;

  @OasSchemaOptionalProperty({
    description: 'A detailed description of the product',
    type: 'string',
  })
  public description?: string;
}

@OasSchema({
  description: 'Error response',
  title: 'Error',
})
export class ErrorResponse {
  @OasSchemaProperty({
    description: 'Error message',
    type: 'string',
  })
  public message!: string;

  @OasSchemaProperty({
    description: 'Error code',
    type: 'string',
  })
  public code!: string;
}

// Begin-example
@OasServer({
  description: 'Development server',
  url: 'http://localhost:3000',
})
@Controller('/products')
export class ProductController {
  @OasSummary('Get all products')
  @OasDescription('Retrieves a list of all products in the inventory')
  @OasOperationId('getAllProducts')
  @OasTag('products')
  @OasTag('inventory')
  @OasExternalDocs({
    description: 'Find more info about products API',
    url: 'https://example.com/docs/products',
  })
  @OasResponse(HttpStatusCode.OK, (toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: {
          items: toSchema(Product),
          type: 'array',
        },
      },
    },
    description: 'List of products',
  }))
  @Get()
  public async getAllProducts(): Promise<Product[]> {
    return [
      {
        description: 'A great laptop',
        id: '1',
        name: 'Laptop',
        price: 999.99,
      },
      {
        id: '2',
        name: 'Mouse',
        price: 29.99,
      },
    ];
  }

  @OasSummary('Get product by ID')
  @OasDescription('Retrieves a specific product by its unique identifier')
  @OasOperationId('getProductById')
  @OasTag('products')
  @OasParameter({
    description: 'The unique identifier of the product',
    in: 'path',
    name: 'id',
    required: true,
    schema: {
      type: 'string',
    },
  })
  @OasResponse(HttpStatusCode.OK, (toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: toSchema(Product),
      },
    },
    description: 'Product details',
  }))
  @OasResponse(HttpStatusCode.NOT_FOUND, (toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: toSchema(ErrorResponse),
      },
    },
    description: 'Product not found',
  }))
  @Get('/:id')
  public async getProductById(
    @Params() params: { id: string },
  ): Promise<Product> {
    return {
      description: 'A great laptop',
      id: params.id,
      name: 'Laptop',
      price: 999.99,
    };
  }

  @OasSummary('Create a new product')
  @OasDescription('Creates a new product in the inventory')
  @OasOperationId('createProduct')
  @OasTag('products')
  @OasTag('inventory')
  @OasSecurity({
    bearerAuth: [],
  })
  @OasRequestBody((toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: toSchema(CreateProductRequest),
      },
    },
    description: 'Product data to create',
    required: true,
  }))
  @OasResponse(HttpStatusCode.CREATED, (toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: toSchema(Product),
      },
    },
    description: 'Product created successfully',
  }))
  @OasResponse(HttpStatusCode.BAD_REQUEST, (toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: toSchema(ErrorResponse),
      },
    },
    description: 'Invalid product data',
  }))
  @Post()
  public async createProduct(
    @Body() productData: CreateProductRequest,
  ): Promise<Product> {
    return {
      id: '123',
      name: productData.name,
      price: productData.price,
      ...(productData.description !== undefined && {
        description: productData.description,
      }),
    };
  }

  @OasSummary('Get legacy product data')
  @OasDescription(
    'This endpoint is deprecated and will be removed in a future version',
  )
  @OasOperationId('getLegacyProduct')
  @OasTag('products')
  @OasTag('legacy')
  @OasDeprecated()
  @OasResponse(HttpStatusCode.OK, {
    content: {
      'application/json': {
        schema: {
          properties: {
            data: { type: 'string' },
          },
          required: ['data'],
          type: 'object',
        },
      },
    },
    description: 'Legacy product data',
  })
  @Get('/legacy')
  public async getLegacyProduct(): Promise<{ data: string }> {
    return {
      data: 'This is legacy data',
    };
  }
}
