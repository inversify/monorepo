export function generatePaginatedTodosResponseSource(): string {
  return `import {
  OasSchema,
  OasSchemaProperty,
  type ToSchemaFunction,
} from '@inversifyjs/http-open-api/v3Dot2';

import { Todo } from '../../domain/models/Todo.js';

@OasSchema(undefined, {
  customAttributes: {
    unevaluatedProperties: false,
  },
  name: 'PaginatedTodosResponse',
})
export class PaginatedTodosResponse {
  @OasSchemaProperty((toSchema: ToSchemaFunction) => ({
    items: toSchema(Todo),
    type: 'array',
  }))
  public items!: Todo[];

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
