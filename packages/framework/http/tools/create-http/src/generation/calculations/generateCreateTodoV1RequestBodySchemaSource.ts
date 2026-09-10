export function generateCreateTodoV1RequestBodySchemaSource(): string {
  return `import { type OpenApi3Dot2SchemaObject } from '@inversifyjs/open-api-types/v3Dot2';

export const createTodoV1RequestBodySchema: OpenApi3Dot2SchemaObject = {
  properties: {
    description: {
      type: 'string',
    },
    title: {
      type: 'string',
    },
  },
  required: ['description', 'title'],
  type: 'object',
  unevaluatedProperties: false,
};
`;
}
