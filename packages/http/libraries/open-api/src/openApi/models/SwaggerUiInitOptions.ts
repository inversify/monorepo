import { OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';

import { SwaggerUiOptions } from './SwaggerUiOptions';

export interface SwaggerUiInitOptions {
  openApiObject: OpenApi3Dot1Object;
  swaggerUiOptions: SwaggerUiOptions;
  swaggerUrl: string | undefined;
}
