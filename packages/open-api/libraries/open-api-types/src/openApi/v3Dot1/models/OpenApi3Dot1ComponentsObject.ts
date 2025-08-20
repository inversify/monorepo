import { OpenApi3Dot1CallbackObject } from './OpenApi3Dot1CallbackObject';
import { OpenApi3Dot1ExampleObject } from './OpenApi3Dot1ExampleObject';
import { OpenApi3Dot1HeaderObject } from './OpenApi3Dot1HeaderObject';
import { OpenApi3Dot1LinkObject } from './OpenApi3Dot1LinkObject';
import { OpenApi3Dot1ParameterObject } from './OpenApi3Dot1ParameterObject';
import { OpenApi3Dot1PathItemObject } from './OpenApi3Dot1PathItemObject';
import { OpenApi3Dot1ReferenceObject } from './OpenApi3Dot1ReferenceObject';
import { OpenApi3Dot1RequestBodyObject } from './OpenApi3Dot1RequestBodyObject';
import { OpenApi3Dot1SchemaObject } from './OpenApi3Dot1SchemaObject';
import { OpenApi3Dot1SecuritySchemeObject } from './OpenApi3Dot1SecuritySchemeObject';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#componentsObject
export interface OpenApi3Dot1ComponentsObject {
  callbacks?: Record<
    string,
    OpenApi3Dot1CallbackObject | OpenApi3Dot1ReferenceObject
  >;
  examples?: Record<
    string,
    OpenApi3Dot1ExampleObject | OpenApi3Dot1ReferenceObject
  >;
  headers?: Record<
    string,
    OpenApi3Dot1HeaderObject | OpenApi3Dot1ReferenceObject
  >;
  links?: Record<string, OpenApi3Dot1LinkObject | OpenApi3Dot1ReferenceObject>;
  parameters?: Record<
    string,
    OpenApi3Dot1ParameterObject | OpenApi3Dot1ReferenceObject
  >;
  pathItems?: Record<
    string,
    OpenApi3Dot1PathItemObject | OpenApi3Dot1ReferenceObject
  >;
  requestBodies?: Record<
    string,
    OpenApi3Dot1RequestBodyObject | OpenApi3Dot1ReferenceObject
  >;
  schemas?: Record<string, OpenApi3Dot1SchemaObject>;
  securitySchemes?: Record<
    string,
    OpenApi3Dot1SecuritySchemeObject | OpenApi3Dot1ReferenceObject
  >;
}
