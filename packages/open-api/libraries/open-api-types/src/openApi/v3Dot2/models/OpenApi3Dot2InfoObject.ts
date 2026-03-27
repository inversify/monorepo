import { type OpenApi3Dot2ContactObject } from './OpenApi3Dot2ContactObject.js';
import { type OpenApi3Dot2LicenseObject } from './OpenApi3Dot2LicenseObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#infoObject
export interface OpenApi3Dot2InfoObject {
  contact?: OpenApi3Dot2ContactObject;
  description?: string;
  license?: OpenApi3Dot2LicenseObject;
  summary?: string;
  termsOfService?: string;
  title: string;
  version: string;
}
