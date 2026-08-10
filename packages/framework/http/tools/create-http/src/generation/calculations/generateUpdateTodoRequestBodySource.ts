export function generateUpdateTodoRequestBodySource(): string {
  return `import {
  OasSchema,
  OasSchemaOptionalProperty,
} from '@inversifyjs/http-open-api/v3Dot2';

@OasSchema(undefined, {
  customAttributes: {
    unevaluatedProperties: false,
  },
  name: 'UpdateTodoRequestBody',
})
export class UpdateTodoRequestBody {
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
