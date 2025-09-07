import { Body, Controller, HttpStatusCode, Post } from '@inversifyjs/http-core';
import {
  OasDescription,
  OasOperationId,
  OasRequestBody,
  OasResponse,
  OasSummary,
  OasTag,
  ToSchemaFunction,
} from '@inversifyjs/http-open-api';
import {
  OpenApi3Dot1RequestBodyObject,
  OpenApi3Dot1ResponseObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import { inject } from 'inversify';

import { UserService } from '../../domain/services/UserService';
import { User, UserType } from '../models/User';
import { UserCreateQuery } from '../models/UserCreateQuery';

@Controller('/users')
@OasSummary('User management routes')
export class UserController {
  readonly #userService: UserService;

  constructor(
    @inject(UserService)
    userService: UserService,
  ) {
    this.#userService = userService;
  }

  @OasDescription('Registers a new user in the system')
  @OasOperationId('createUser')
  @OasRequestBody(
    (toSchema: ToSchemaFunction): OpenApi3Dot1RequestBodyObject => ({
      content: {
        'application/json': {
          schema: toSchema(UserCreateQuery),
        },
      },
      description: 'User create query',
      required: true,
    }),
  )
  @OasResponse(
    HttpStatusCode.OK,
    (toSchema: ToSchemaFunction): OpenApi3Dot1ResponseObject => ({
      content: {
        'application/json': {
          schema: toSchema(User),
        },
      },
      description: 'User created',
    }),
  )
  @OasTag('Users')
  @Post()
  public async register(
    @Body() userCreateQuery: UserCreateQuery,
  ): Promise<UserType> {
    const [user]: [UserType] = await this.#userService.create(userCreateQuery);

    return user;
  }
}
