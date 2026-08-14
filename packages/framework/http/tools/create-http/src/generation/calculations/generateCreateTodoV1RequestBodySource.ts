export function generateCreateTodoV1RequestBodySource(): string {
  return `import { OasSchema, OasSchemaProperty } from '@inversifyjs/http-open-api/v3Dot2';

@OasSchema(undefined, {
  customAttributes: {
    unevaluatedProperties: false,
  },
  name: 'CreateTodoV1RequestBody',
})
export class CreateTodoV1RequestBody {
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
