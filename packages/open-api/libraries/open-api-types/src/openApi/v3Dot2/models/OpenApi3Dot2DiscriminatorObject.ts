// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.2.0.md#discriminatorObject
export interface OpenApi3Dot2DiscriminatorObject {
  defaultMapping?: string;
  mapping?: Record<string, string>;
  propertyName: string;
}
