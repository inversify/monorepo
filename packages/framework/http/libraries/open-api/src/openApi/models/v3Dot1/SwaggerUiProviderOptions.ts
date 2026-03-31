import { type SwaggerUiProviderUiOptions } from '../SwaggerUiProviderUiOptions.js';
import { type SwaggerUiProviderApiOptions } from './SwaggerUiProviderApiOptions.js';

export interface SwaggerUiProviderOptions {
  api: SwaggerUiProviderApiOptions;
  ui?: SwaggerUiProviderUiOptions;
}
