import { type SwaggerUiOptions } from './SwaggerUiOptions.js';

export interface SwaggerUiProviderUiOptions {
  customCss?: string;
  customCssUrls?: string | string[];
  customJs?: string;
  customJsUrls?: string | string[];
  explorerEnabled?: boolean;
  swaggerUiOptions?: SwaggerUiOptions;
  title?: string;
}
