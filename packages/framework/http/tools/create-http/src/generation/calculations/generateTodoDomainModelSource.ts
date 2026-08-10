export function generateTodoDomainModelSource(): string {
  return `import { OasSchema, OasSchemaProperty } from '@inversifyjs/http-open-api';

@OasSchema(undefined, {
  customAttributes: {
    unevaluatedProperties: false,
  },
  name: 'Todo',
})
export class Todo {
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
  public created_at!: Date;

  @OasSchemaProperty({
    format: 'date-time',
    type: ['string', 'null'],
  })
  public deleted_at!: Date | null;

  @OasSchemaProperty({
    format: 'date-time',
    type: 'string',
  })
  public updated_at!: Date;
}
`;
}
