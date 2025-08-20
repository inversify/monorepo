import { OpenApi3Dot1ParameterObjectIn } from './OpenApi3Dot1ParameterObjectIn';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#parameterObject
export interface OpenApi3Dot1ParameterObject {
  allowEmptyValue?: boolean;
  deprecated?: boolean;
  description?: string;
  in: OpenApi3Dot1ParameterObjectIn;
  name: string;
  required?: boolean;
}
