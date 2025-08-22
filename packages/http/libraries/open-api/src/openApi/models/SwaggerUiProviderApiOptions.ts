import { OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';

export interface SwaggerUiProviderApiOptions {
  openApiObject: OpenApi3Dot1Object;
  path: string;
}
