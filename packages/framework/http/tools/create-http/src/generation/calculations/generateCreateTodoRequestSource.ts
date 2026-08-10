export function generateCreateTodoRequestSource(): string {
  return `import { OasSchema, OasSchemaProperty } from '@inversifyjs/http-open-api';

@OasSchema(undefined, {
  customAttributes: {
    unevaluatedProperties: false,
  },
  name: 'CreateTodoRequest',
})
export class CreateTodoRequest {
  @OasSchemaProperty({
    type: 'string',
  })
  public title!: string;

  @OasSchemaProperty({
    type: 'string',
  })
  public description!: string;
}
`;
}
