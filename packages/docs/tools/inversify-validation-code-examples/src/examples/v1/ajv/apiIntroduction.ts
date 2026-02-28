/* eslint-disable no-useless-assignment */
// Begin-example
import {
  AjvValidationPipe,
  ValidateAjvSchema,
} from '@inversifyjs/ajv-validation';
import { Body, Controller, Post } from '@inversifyjs/http-core';
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express';
import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation';
import { AnySchema } from 'ajv';
import Ajv from 'ajv';
import { Container } from 'inversify';

const container: Container = new Container();
const ajv: Ajv = new Ajv();

// Create HTTP adapter
const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(
  container,
);

// Register global AJV validation pipe
adapter.useGlobalPipe(new AjvValidationPipe(ajv));
adapter.useGlobalFilters(InversifyValidationErrorFilter);

// Define a JSON schema
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

interface User {
  age?: number;
  email: string;
  name: string;
}

@Controller('/users')
export class UserController {
  @Post('/')
  public createUser(@ValidateAjvSchema(userSchema) @Body() user: User): string {
    return `Created user: ${user.name}`;
  }
}
