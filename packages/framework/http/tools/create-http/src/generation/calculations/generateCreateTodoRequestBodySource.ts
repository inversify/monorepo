export function generateCreateTodoRequestBodySource(): string {
  return `import { OasSchema, OasSchemaProperty } from '@inversifyjs/http-open-api/v3Dot2';

@OasSchema(undefined, {
  customAttributes: {
    unevaluatedProperties: false,
  },
  name: 'CreateTodoRequestBody',
})
export class CreateTodoRequestBody {
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
