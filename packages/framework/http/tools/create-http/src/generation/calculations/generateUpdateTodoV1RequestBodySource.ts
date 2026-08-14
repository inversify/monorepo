export function generateUpdateTodoV1RequestBodySource(): string {
  return `import {
  OasSchema,
  OasSchemaOptionalProperty,
} from '@inversifyjs/http-open-api/v3Dot2';

@OasSchema(undefined, {
  customAttributes: {
    unevaluatedProperties: false,
  },
  name: 'UpdateTodoV1RequestBody',
})
export class UpdateTodoV1RequestBody {
  @OasSchemaOptionalProperty({
    type: 'string',
  })
  public title?: string;

  @OasSchemaOptionalProperty({
    type: 'string',
  })
  public description?: string;

  @OasSchemaOptionalProperty({
    type: 'boolean',
  })
  public completed?: boolean;
}
`;
}
