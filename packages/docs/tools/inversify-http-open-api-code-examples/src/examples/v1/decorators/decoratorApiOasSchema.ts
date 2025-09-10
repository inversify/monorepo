import {
  OasSchema,
  OasSchemaOptionalProperty,
  OasSchemaProperty,
} from '@inversifyjs/http-open-api';

// Begin-example
@OasSchema({
  description: 'A user in the system',
  title: 'User',
})
export class User {
  @OasSchemaProperty({
    description: 'The unique identifier of the user',
    type: 'string',
  })
  public id!: string;

  @OasSchemaProperty({
    description: 'The name of the user',
    type: 'string',
  })
  public name!: string;

  @OasSchemaProperty({
    description: 'The email address of the user',
    format: 'email',
    type: 'string',
  })
  public email!: string;

  @OasSchemaOptionalProperty({
    description: 'The age of the user',
    minimum: 0,
    type: 'integer',
  })
  public age?: number;

  @OasSchemaOptionalProperty({
    description: 'Whether the user is active',
    type: 'boolean',
  })
  public isActive?: boolean;
}
