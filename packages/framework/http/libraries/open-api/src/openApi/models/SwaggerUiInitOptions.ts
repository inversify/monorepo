import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';

import { type SwaggerUiOptions } from './SwaggerUiOptions.js';

export interface SwaggerUiInitOptions {
  openApiObject: OpenApi3Dot1Object;
  swaggerUiOptions: SwaggerUiOptions;
  swaggerUrl: string | undefined;
}
