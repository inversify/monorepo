export function generateTodoSchemaV1Source(): string {
  return `import { type OpenApi3Dot2SchemaObject } from '@inversifyjs/open-api-types/v3Dot2';

export const todoSchemaV1: OpenApi3Dot2SchemaObject = {
  properties: {
    completed: {
      type: 'boolean',
    },
    createdAt: {
      format: 'date-time',
      type: 'string',
    },
    deletedAt: {
      format: 'date-time',
      type: ['string', 'null'],
    },
    description: {
      type: 'string',
    },
    id: {
      format: 'uuid',
      type: 'string',
    },
    title: {
      type: 'string',
    },
    updatedAt: {
      format: 'date-time',
      type: 'string',
    },
  },
  required: [
    'completed',
    'createdAt',
    'deletedAt',
    'description',
    'id',
    'title',
    'updatedAt',
  ],
  type: 'object',
  unevaluatedProperties: false,
};
`;
}
