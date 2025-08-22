import { OpenApi3Dot1PathItemObject } from './OpenApi3Dot1PathItemObject';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#pathsObject
export type OpenApi3Dot1PathsObject = Record<
  string,
  OpenApi3Dot1PathItemObject
>;
