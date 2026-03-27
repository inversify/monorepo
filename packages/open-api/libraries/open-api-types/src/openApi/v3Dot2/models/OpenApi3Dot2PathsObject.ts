import { type OpenApi3Dot2PathItemObject } from './OpenApi3Dot2PathItemObject.js';

// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#pathsObject
export type OpenApi3Dot2PathsObject = Record<
  string,
  OpenApi3Dot2PathItemObject
>;
