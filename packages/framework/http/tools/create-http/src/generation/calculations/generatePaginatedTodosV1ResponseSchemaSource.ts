export function generatePaginatedTodosV1ResponseSchemaSource(): string {
  return `export const paginatedTodosV1ResponseSchema = {
  properties: {
    items: {
      items: {
        $ref: '#/components/schemas/TodoV1',
      },
      type: 'array',
    },
    page: {
      minimum: 1,
      type: 'integer',
    },
    pageSize: {
      maximum: 20,
      minimum: 1,
      type: 'integer',
    },
    totalItems: {
      minimum: 0,
      type: 'integer',
    },
  },
  required: ['items', 'page', 'pageSize', 'totalItems'],
  type: 'object',
  unevaluatedProperties: false,
};
`;
}
