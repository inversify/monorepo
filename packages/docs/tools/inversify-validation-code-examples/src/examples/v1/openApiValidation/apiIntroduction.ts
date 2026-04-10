// Begin-example
import { Controller, Post } from '@inversifyjs/http-core';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { OasRequestBody, SwaggerUiProvider } from '@inversifyjs/http-open-api';
import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';
import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { ValidatedBody } from '@inversifyjs/open-api-validation';
import { OpenApiValidationPipe } from '@inversifyjs/open-api-validation/v3Dot1';
import { Container } from 'inversify';

const container: Container = new Container();

// Define a base OpenAPI document
const openApiObject: OpenApi3Dot1Object = {
  info: { title: 'My API', version: '1.0.0' },
  openapi: '3.1.1',
};

// Create the SwaggerUiProvider
const swaggerProvider: SwaggerUiProvider = new SwaggerUiProvider({
  api: {
    openApiObject,
    path: '/docs',
  },
});

interface User {
  email: string;
  name: string;
}

@Controller('/users')
export class UserController {
  @OasRequestBody({
    content: {
      'application/json': {
        schema: {
          additionalProperties: false,
          properties: {
            email: { format: 'email', type: 'string' },
            name: { minLength: 1, type: 'string' },
          },
          required: ['name', 'email'],
          type: 'object',
        },
      },
    },
  })
  @Post('/')
  public createUser(@ValidatedBody() user: User): string {
    return `Created user: ${user.name}`;
  }
}

// Register bindings
container.bind(InversifyValidationErrorFilter).toSelf().inSingletonScope();
container.bind(UserController).toSelf().inSingletonScope();

// Populate the OpenAPI spec from controller metadata
swaggerProvider.provide(container);

// Create HTTP adapter
const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
  container,
);

// Register global validation pipe using the populated OpenAPI spec
adapter.useGlobalPipe(new OpenApiValidationPipe(swaggerProvider.openApiObject));
adapter.useGlobalFilters(InversifyValidationErrorFilter);
