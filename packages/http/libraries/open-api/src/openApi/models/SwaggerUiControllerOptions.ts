import { OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';

import { SwaggerUiControllerUiOptions } from './SwaggerUiControllerUiOptions';

export interface SwaggerUiControllerOptions {
  apiPath: string;
  openApiObject: OpenApi3Dot1Object;
  ui?: SwaggerUiControllerUiOptions;
}
