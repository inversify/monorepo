// Begin-example
import {
  BadRequestHttpResponse,
  CatchError,
  type ErrorFilter,
} from '@inversifyjs/http-core';
import { InversifyStandardSchemaValidationError } from '@inversifyjs/standard-schema-validation';
import { InversifyValidationErrorKind } from '@inversifyjs/validation-common';

function mapStandardSchemaIssues(
  issues: NonNullable<InversifyStandardSchemaValidationError['errors']>,
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const issue of issues) {
    const path: string =
      issue.path
        ?.map((segment: PropertyKey | { key: PropertyKey }): string =>
          typeof segment === 'object' && 'key' in segment
            ? String(segment.key)
            : String(segment),
        )
        .join('.') ?? '';

    if (path !== '' && result[path] === undefined) {
      result[path] = issue.message;
    }
  }

  return result;
}

@CatchError(InversifyStandardSchemaValidationError)
export class CustomStandardSchemaValidationErrorFilter implements ErrorFilter<InversifyStandardSchemaValidationError> {
  public catch(error: InversifyStandardSchemaValidationError): never {
    switch (error.kind) {
      case InversifyValidationErrorKind.validationFailed:
        throw new BadRequestHttpResponse(
          {
            errors: mapStandardSchemaIssues(error.errors ?? []),
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
import { ValidateStandardSchemaV1 } from '@inversifyjs/standard-schema-validation';
import zod from 'zod';

interface User {
  firstName: string;
  lastName: string;
}

@Controller('/users')
export class UserController {
  @Post()
  public async createUser(
    @Body()
    @ValidateStandardSchemaV1(
      zod
        .object({
          firstName: zod.string().min(1, 'First name is required'),
          lastName: zod.string().min(1, 'Last name is required'),
        })
        .strict(),
    )
    user: User,
  ): Promise<User> {
    return user;
  }
}
