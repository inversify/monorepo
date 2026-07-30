// Begin-example
import {
  BadRequestHttpResponse,
  CatchError,
  type ErrorFilter,
} from '@inversifyjs/http-core';
import { InversifyOpenApiValidationError } from '@inversifyjs/open-api-validation';
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

@CatchError(InversifyOpenApiValidationError)
export class CustomOpenApiValidationErrorFilter implements ErrorFilter<InversifyOpenApiValidationError> {
  public catch(error: InversifyOpenApiValidationError): never {
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

import { Controller, Post } from '@inversifyjs/http-core';
import { OasRequestBody } from '@inversifyjs/http-open-api';
import { ValidatedBody } from '@inversifyjs/open-api-validation';

interface User {
  firstName: string;
  lastName: string;
}

@Controller('/users')
export class UserController {
  @OasRequestBody({
    content: {
      'application/json': {
        schema: {
          additionalProperties: false,
          properties: {
            firstName: { minLength: 1, type: 'string' },
            lastName: { minLength: 1, type: 'string' },
          },
          required: ['firstName', 'lastName'],
          type: 'object',
        },
      },
    },
  })
  @Post('/')
  public createUser(@ValidatedBody() user: User): User {
    return user;
  }
}
