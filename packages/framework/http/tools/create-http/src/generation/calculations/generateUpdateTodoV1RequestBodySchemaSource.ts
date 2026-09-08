export function generateUpdateTodoV1RequestBodySchemaSource(): string {
  return `export const updateTodoV1RequestBodySchema = {
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
