// Begin-example
import { InversifyAjvValidationError } from '@inversifyjs/ajv-validation';
import {
  BadRequestHttpResponse,
  CatchError,
  type ErrorFilter,
} from '@inversifyjs/http-core';
import { InversifyValidationErrorKind } from '@inversifyjs/validation-common';
import { type ErrorObject } from 'ajv';

function mapAjvErrors(errors: Partial<ErrorObject>[]): Record<string, string> {
  const result: Record<string, string> = {};

  for (const error of errors) {
    const missingProperty: unknown = error.params?.['missingProperty'];
    const path: string =
      error.instancePath === undefined || error.instancePath === ''
        ? typeof missingProperty === 'string'
          ? missingProperty
          : ''
        : error.instancePath.replace(/^\//, '').replaceAll('/', '.');

    if (
      path !== '' &&
      error.message !== undefined &&
      result[path] === undefined
    ) {
      result[path] = error.message;
    }
  }

  return result;
}

@CatchError(InversifyAjvValidationError)
export class CustomAjvValidationErrorFilter implements ErrorFilter<InversifyAjvValidationError> {
  public catch(error: InversifyAjvValidationError): never {
    switch (error.kind) {
      case InversifyValidationErrorKind.validationFailed:
        throw new BadRequestHttpResponse(
          {
            errors: mapAjvErrors(error.errors ?? []),
            message: 'Validation failed',
            success: false,
          },
          error.message,
          {
            cause: error,
          },
        );
      default:
        throw new Error(error.message, {
          cause: error,
        });
    }
  }
}
// End-example

/* eslint-disable no-useless-assignment */
import { ValidateAjvSchema } from '@inversifyjs/ajv-validation';
import { Body, Controller, Post } from '@inversifyjs/http-core';
import { type AnySchema } from 'ajv';

interface User {
  firstName: string;
  lastName: string;
}

const userSchema: AnySchema = {
  additionalProperties: false,
  properties: {
    firstName: { minLength: 1, type: 'string' },
    lastName: { minLength: 1, type: 'string' },
  },
  required: ['firstName', 'lastName'],
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
