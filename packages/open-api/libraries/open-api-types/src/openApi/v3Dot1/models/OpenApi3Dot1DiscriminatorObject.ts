// https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#discriminatorObject
export interface OpenApi3Dot1DiscriminatorObject {
  mapping?: Record<string, string>;
  propertyName: string;
}
