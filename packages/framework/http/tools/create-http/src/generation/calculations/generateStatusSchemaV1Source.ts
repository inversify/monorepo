export function generateStatusSchemaV1Source(): string {
  return `import { type OpenApi3Dot2SchemaObject } from '@inversifyjs/open-api-types/v3Dot2';

export const statusSchemaV1: OpenApi3Dot2SchemaObject = {
  properties: {
    status: {
      type: 'string',
    },
  },
  required: ['status'],
  type: 'object',
  unevaluatedProperties: false,
};
`;
}
