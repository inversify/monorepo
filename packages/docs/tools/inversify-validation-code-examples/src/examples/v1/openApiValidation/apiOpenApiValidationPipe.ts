// Begin-example
import { Body, Controller, Post } from '@inversifyjs/http-core';
import { OasRequestBody, SwaggerUiProvider } from '@inversifyjs/http-open-api';
import {
  OpenApiValidationPipe,
  Validate,
} from '@inversifyjs/http-openapi-validation';
import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { Container } from 'inversify';

const container: Container = new Container();

const openApiObject: OpenApi3Dot1Object = {
  info: { title: 'My API', version: '1.0.0' },
  openapi: '3.1.1',
};

const swaggerProvider: SwaggerUiProvider = new SwaggerUiProvider({
  api: {
    openApiObject,
    path: '/docs',
  },
});

interface Message {
  content: string;
}

@Controller('/messages')
export class MessageController {
  @OasRequestBody({
    content: {
      'application/json': {
        schema: {
          additionalProperties: false,
          properties: {
            content: { maxLength: 200, type: 'string' },
          },
          required: ['content'],
          type: 'object',
        },
      },
    },
  })
  @Post('/')
  public createMessage(@Validate() @Body() message: Message): string {
    return `Message: ${message.content}`;
  }
}

container.bind(MessageController).toSelf().inSingletonScope();
swaggerProvider.provide(container);

// Create the validation pipe from the populated OpenAPI spec
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const pipe: OpenApiValidationPipe = new OpenApiValidationPipe(
  swaggerProvider.openApiObject,
);
