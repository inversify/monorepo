/* eslint-disable no-useless-assignment */
// Begin-example
import { ValidateAjvSchema } from '@inversifyjs/ajv-validation';
import { Body, Controller, Post } from '@inversifyjs/http-core';
import { AnySchema } from 'ajv';

interface User {
  name: string;
  email: string;
  age?: number;
}

const userSchema: AnySchema = {
  additionalProperties: false,
  properties: {
    age: { minimum: 0, type: 'number' },
    email: { format: 'email', type: 'string' },
    name: { minLength: 1, type: 'string' },
  },
  required: ['name', 'email'],
  type: 'object',
};

@Controller('/users')
export class UserController {
  @Post()
  public async createUser(
    @Body()
    @ValidateAjvSchema(userSchema)
    user: User,
  ): Promise<User> {
    return user;
  }
}
