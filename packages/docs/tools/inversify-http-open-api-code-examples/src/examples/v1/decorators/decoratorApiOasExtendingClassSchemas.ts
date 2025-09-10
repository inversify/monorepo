import {
  OasSchema,
  OasSchemaProperty,
  ToSchemaFunction,
} from '@inversifyjs/http-open-api';

// Begin-example
@OasSchema()
export class BaseSchema {
  @OasSchemaProperty({
    description: 'A common string property',
    type: 'string',
  })
  public foo!: string;
}

@OasSchema((toSchema: ToSchemaFunction) => toSchema(BaseSchema), {
  customAttributes: {
    unevaluatedProperties: false,
  },
})
export class ExtendedSchema extends BaseSchema {
  @OasSchemaProperty({
    description: 'An additional property in the extended schema',
    type: 'string',
  })
  public bar!: string;

  @OasSchemaProperty({
    description: 'A numeric property in the extended schema',
    minimum: 0,
    type: 'number',
  })
  public count!: number;
}
