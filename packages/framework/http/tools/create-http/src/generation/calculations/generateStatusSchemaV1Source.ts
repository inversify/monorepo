export function generateStatusSchemaV1Source(): string {
  return `export const statusSchemaV1 = {
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
