import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';

import { type BaseSwaggerUiProviderOptions } from '../SwaggerUiProviderOptions.js';

export type SwaggerUiProviderApiOptions =
  BaseSwaggerUiProviderOptions<OpenApi3Dot1Object>;
