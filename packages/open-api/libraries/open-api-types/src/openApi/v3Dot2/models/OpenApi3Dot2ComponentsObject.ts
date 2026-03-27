import { type OpenApi3Dot2CallbackObject } from './OpenApi3Dot2CallbackObject.js';
import { type OpenApi3Dot2ExampleObject } from './OpenApi3Dot2ExampleObject.js';
import { type OpenApi3Dot2HeaderObject } from './OpenApi3Dot2HeaderObject.js';
import { type OpenApi3Dot2LinkObject } from './OpenApi3Dot2LinkObject.js';
import { type OpenApi3Dot2MediaTypeObject } from './OpenApi3Dot2MediaTypeObject.js';
import { type OpenApi3Dot2ParameterObject } from './OpenApi3Dot2ParameterObject.js';
import { type OpenApi3Dot2PathItemObject } from './OpenApi3Dot2PathItemObject.js';
import { type OpenApi3Dot2ReferenceObject } from './OpenApi3Dot2ReferenceObject.js';
import { type OpenApi3Dot2RequestBodyObject } from './OpenApi3Dot2RequestBodyObject.js';
import { type OpenApi3Dot2ResponseObject } from './OpenApi3Dot2ResponseObject.js';
import { type OpenApi3Dot2SchemaObject } from './OpenApi3Dot2SchemaObject.js';
import { type OpenApi3Dot2SecuritySchemeObject } from './OpenApi3Dot2SecuritySchemeObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#componentsObject
export interface OpenApi3Dot2ComponentsObject {
  callbacks?: Record<
    string,
    OpenApi3Dot2CallbackObject | OpenApi3Dot2ReferenceObject
  >;
  examples?: Record<
    string,
    OpenApi3Dot2ExampleObject | OpenApi3Dot2ReferenceObject
  >;
  headers?: Record<
    string,
    OpenApi3Dot2HeaderObject | OpenApi3Dot2ReferenceObject
  >;
  links?: Record<string, OpenApi3Dot2LinkObject | OpenApi3Dot2ReferenceObject>;
  mediaTypes?: Record<
    string,
    OpenApi3Dot2MediaTypeObject | OpenApi3Dot2ReferenceObject
  >;
  parameters?: Record<
    string,
    OpenApi3Dot2ParameterObject | OpenApi3Dot2ReferenceObject
  >;
  pathItems?: Record<string, OpenApi3Dot2PathItemObject>;
  requestBodies?: Record<
    string,
    OpenApi3Dot2RequestBodyObject | OpenApi3Dot2ReferenceObject
  >;
  responses?: Record<
    string,
    OpenApi3Dot2ResponseObject | OpenApi3Dot2ReferenceObject
  >;
  schemas?: Record<string, OpenApi3Dot2SchemaObject>;
  securitySchemes?: Record<
    string,
    OpenApi3Dot2SecuritySchemeObject | OpenApi3Dot2ReferenceObject
  >;
}
