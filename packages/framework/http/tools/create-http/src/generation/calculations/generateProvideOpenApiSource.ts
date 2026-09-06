export function generateProvideOpenApiSource(): string {
  return `import { SwaggerUiProvider } from '@inversifyjs/http-open-api/v3Dot2';
import { type Container } from 'inversify';

export function provideOpenApi(container: Container): SwaggerUiProvider {
  const swaggerUiProvider: SwaggerUiProvider = new SwaggerUiProvider({
    api: {
      openApiObject: {
        info: {
          title: 'API',
          version: '1.0.0',
        },
        openapi: '3.2.0',
      },
      path: '/docs',
    },
    ui: {
      title: 'API docs',
    },
  });

  swaggerUiProvider.provide(container);

  return swaggerUiProvider;
}
`;
}
