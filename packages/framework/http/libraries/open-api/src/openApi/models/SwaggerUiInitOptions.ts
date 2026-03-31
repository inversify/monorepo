import { type SwaggerUiOptions } from './SwaggerUiOptions.js';

export interface SwaggerUiInitOptions<TOpenApiObject> {
  openApiObject: TOpenApiObject;
  swaggerUiOptions: SwaggerUiOptions;
  swaggerUrl: string | undefined;
}
