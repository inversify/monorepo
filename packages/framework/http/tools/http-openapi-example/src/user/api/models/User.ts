import { OasSchema, OasSchemaProperty } from '@inversifyjs/http-open-api';

import { Interface } from '../../../common/utils/Interface';

@OasSchema(undefined, {
  customAttributes: {
    unevaluatedProperties: false,
  },
  name: 'User',
})
export class User {
  @OasSchemaProperty({
    format: 'uuid',
    type: 'string',
  })
  public id!: string;
  @OasSchemaProperty({
    format: 'email',
    type: 'string',
  })
  public email!: string;
  @OasSchemaProperty()
  public name!: string;
  @OasSchemaProperty()
  public surname!: string;
}

export type UserType = Interface<User>;
