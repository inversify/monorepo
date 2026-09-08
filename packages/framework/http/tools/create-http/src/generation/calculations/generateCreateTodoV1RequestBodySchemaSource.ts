export function generateCreateTodoV1RequestBodySchemaSource(): string {
  return `export const createTodoV1RequestBodySchema = {
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
