import { SwaggerUiProviderApiOptions } from './SwaggerUiProviderApiOptions';
import { SwaggerUiProviderUiOptions } from './SwaggerUiProviderUiOptions';

export interface SwaggerUiProviderOptions {
  api: SwaggerUiProviderApiOptions;
  ui?: SwaggerUiProviderUiOptions;
}
