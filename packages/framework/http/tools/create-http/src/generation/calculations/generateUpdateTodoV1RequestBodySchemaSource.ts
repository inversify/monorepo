export function generateUpdateTodoV1RequestBodySchemaSource(): string {
  return `import { type OpenApi3Dot2SchemaObject } from '@inversifyjs/open-api-types/v3Dot2';

export const updateTodoV1RequestBodySchema: OpenApi3Dot2SchemaObject = {
  properties: {
    completed: {
      type: 'boolean',
    },
    description: {
      type: 'string',
    },
    title: {
      type: 'string',
    },
  },
  type: 'object',
  unevaluatedProperties: false,
};
`;
}
