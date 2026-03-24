import { type OpenApi3Dot1ContactObject } from './OpenApi3Dot1ContactObject.js';
import { type OpenApi3Dot1LicenseObject } from './OpenApi3Dot1LicenseObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#infoObject
export interface OpenApi3Dot1InfoObject {
  contact?: OpenApi3Dot1ContactObject;
  description?: string;
  license?: OpenApi3Dot1LicenseObject;
  summary?: string;
  termsOfService?: string;
  title: string;
  version: string;
}
