import { type OpenApi3Dot2XmlObjectNodeType } from './OpenApi3Dot2XmlObjectNodeType.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#xmlObject
export interface OpenApi3Dot2XmlObject {
  name?: string;
  namespace?: string;
  nodeType?: OpenApi3Dot2XmlObjectNodeType;
  prefix?: string;
}
