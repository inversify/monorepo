export function generatePaginatedTodosV1ResponseSource(): string {
  return `import {
  OasSchema,
  OasSchemaProperty,
  type ToSchemaFunction,
} from '@inversifyjs/http-open-api/v3Dot2';

import { TodoV1 } from './TodoV1.js';

@OasSchema(undefined, {
  customAttributes: {
    unevaluatedProperties: false,
  },
  name: 'PaginatedTodosV1Response',
})
export class PaginatedTodosV1Response {
  @OasSchemaProperty((toSchema: ToSchemaFunction) => ({
    items: toSchema(TodoV1),
    type: 'array',
  }))
  public items!: TodoV1[];

  @OasSchemaProperty({
    minimum: 1,
    type: 'integer',
  })
  public page!: number;

  @OasSchemaProperty({
    maximum: 20,
    minimum: 1,
    type: 'integer',
  })
  public pageSize!: number;

  @OasSchemaProperty({
    minimum: 0,
    type: 'integer',
  })
  public totalItems!: number;
}
`;
}
