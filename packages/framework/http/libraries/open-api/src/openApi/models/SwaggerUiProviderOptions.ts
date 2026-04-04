import { type BaseSwaggerUiProviderApiOptions } from './BaseSwaggerUiProviderApiOptions.js';
import { type SwaggerUiProviderUiOptions } from './SwaggerUiProviderUiOptions.js';

export interface BaseSwaggerUiProviderOptions<TOpenApiObject> {
  api: BaseSwaggerUiProviderApiOptions<TOpenApiObject>;
  ui?: SwaggerUiProviderUiOptions;
}
