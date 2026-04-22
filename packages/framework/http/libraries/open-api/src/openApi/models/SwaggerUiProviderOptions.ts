import { type Logger } from '@inversifyjs/logger';

import { type BaseSwaggerUiProviderApiOptions } from './BaseSwaggerUiProviderApiOptions.js';
import { type SwaggerUiProviderUiOptions } from './SwaggerUiProviderUiOptions.js';

export interface BaseSwaggerUiProviderOptions<TOpenApiObject> {
  api: BaseSwaggerUiProviderApiOptions<TOpenApiObject>;
  logger?: Logger | boolean | undefined;
  ui?: SwaggerUiProviderUiOptions;
}
