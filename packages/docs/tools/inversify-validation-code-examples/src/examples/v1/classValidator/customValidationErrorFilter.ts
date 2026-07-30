// Begin-example
import { InversifyClassValidationError } from '@inversifyjs/class-validation';
import {
  BadRequestHttpResponse,
  CatchError,
  type ErrorFilter,
} from '@inversifyjs/http-core';
import { InversifyValidationErrorKind } from '@inversifyjs/validation-common';
import { type ValidationError } from 'class-validator';

function mapClassValidationErrors(
  errors: ValidationError[],
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const error of errors) {
    const message: string | undefined =
      error.constraints === undefined
        ? undefined
        : Object.values(error.constraints)[0];

    if (message !== undefined) {
      result[error.property] = message;
    }
  }

  return result;
}

@CatchError(InversifyClassValidationError)
export class CustomClassValidationErrorFilter implements ErrorFilter<InversifyClassValidationError> {
  public catch(error: InversifyClassValidationError): never {
    switch (error.kind) {
      case InversifyValidationErrorKind.validationFailed:
        throw new BadRequestHttpResponse(
          {
            errors: mapClassValidationErrors(error.errors ?? []),
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

import { Body, Controller, Post } from '@inversifyjs/http-core';
import { IsNotEmpty, IsString } from 'class-validator';

export class User {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  public readonly firstName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  public readonly lastName!: string;
}

@Controller('/users')
export class UserController {
  @Post()
  public async createUser(@Body() user: User): Promise<User> {
    return user;
  }
}
