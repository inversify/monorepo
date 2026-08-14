export function generateTodoV1Source(): string {
  return `import { OasSchema, OasSchemaProperty } from '@inversifyjs/http-open-api/v3Dot2';

@OasSchema(undefined, {
  customAttributes: {
    unevaluatedProperties: false,
  },
  name: 'TodoV1',
})
export class TodoV1 {
  @OasSchemaProperty({
    format: 'uuid',
    type: 'string',
  })
  public id!: string;

  @OasSchemaProperty({
    type: 'string',
  })
  public title!: string;

  @OasSchemaProperty({
    type: 'string',
  })
  public description!: string;

  @OasSchemaProperty({
    type: 'boolean',
  })
  public completed!: boolean;

  @OasSchemaProperty({
    format: 'date-time',
    type: 'string',
  })
  public createdAt!: Date;

  @OasSchemaProperty({
    format: 'date-time',
    type: ['string', 'null'],
  })
  public deletedAt!: Date | null;

  @OasSchemaProperty({
    format: 'date-time',
    type: 'string',
  })
  public updatedAt!: Date;
}
`;
}
