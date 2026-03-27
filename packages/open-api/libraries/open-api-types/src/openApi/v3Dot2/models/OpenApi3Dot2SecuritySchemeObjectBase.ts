import { type OpenApi3Dot2SecuritySchemeObjectType } from './OpenApi3Dot2SecuritySchemeObjectType.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#securitySchemeObject
export interface OpenApi3Dot2SecuritySchemeObjectBase<
  TType extends OpenApi3Dot2SecuritySchemeObjectType,
> {
  deprecated?: boolean;
  description?: string;
  type: TType;
}
