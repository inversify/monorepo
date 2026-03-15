import { type SwaggerUiProviderApiOptions } from './SwaggerUiProviderApiOptions.js';
import { type SwaggerUiProviderUiOptions } from './SwaggerUiProviderUiOptions.js';

export interface SwaggerUiProviderOptions {
  api: SwaggerUiProviderApiOptions;
  ui?: SwaggerUiProviderUiOptions;
}
