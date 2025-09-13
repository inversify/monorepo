import { OasSchema, OasSchemaProperty } from '@inversifyjs/http-open-api';

import { Interface } from '../../../common/utils/Interface';

@OasSchema(undefined, {
  customAttributes: {
    unevaluatedProperties: false,
  },
  name: 'UserCreateQuery',
})
export class UserCreateQuery {
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

export type UserCreateQueryType = Interface<UserCreateQuery>;
