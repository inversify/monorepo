import {
  Body,
  Controller,
  Get,
  HttpStatusCode,
  Post,
} from '@inversifyjs/http-core';
import {
  OasRequestBody,
  OasResponse,
  OasSchema,
  OasSchemaOptionalProperty,
  OasSchemaProperty,
  ToSchemaFunction,
} from '@inversifyjs/http-open-api';

@OasSchema({
  description: 'Request payload for creating a user',
  title: 'CreateUserRequest',
})
export class CreateUserRequest {
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
}

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
}

// Begin-example
@Controller('/users')
export class UserController {
  @OasRequestBody((toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: toSchema(CreateUserRequest),
      },
    },
    description: 'User data to create',
    required: true,
  }))
  @OasResponse(HttpStatusCode.OK, (toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: toSchema(User),
      },
    },
    description: 'The created user',
  }))
  @Post()
  public async createUser(@Body() userData: CreateUserRequest): Promise<User> {
    return {
      email: userData.email,
      id: '123',
      name: userData.name,
      ...(userData.age !== undefined && { age: userData.age }),
    };
  }

  @OasResponse(HttpStatusCode.OK, (toSchema: ToSchemaFunction) => ({
    content: {
      'application/json': {
        schema: {
          items: toSchema(User),
          type: 'array',
        },
      },
    },
    description: 'The created user',
  }))
  @Get()
  public async getUsers(): Promise<User[]> {
    return [
      {
        age: 30,
        email: 'john@example.com',
        id: '1',
        name: 'John Doe',
      },
      {
        email: 'jane@example.com',
        id: '2',
        name: 'Jane Smith',
      },
    ];
  }
}
