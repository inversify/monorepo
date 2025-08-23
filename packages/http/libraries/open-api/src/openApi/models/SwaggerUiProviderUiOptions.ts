import { SwaggerUiOptions } from './SwaggerUiOptions';

export interface SwaggerUiProviderUiOptions {
  customCss?: string;
  customCssUrls?: string | string[];
  customJs?: string;
  customJsUrls?: string | string[];
  explorerEnabled?: boolean;
  swaggerUiOptions?: SwaggerUiOptions;
  title?: string;
}
