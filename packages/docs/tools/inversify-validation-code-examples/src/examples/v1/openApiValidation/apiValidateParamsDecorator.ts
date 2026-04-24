// Begin-example
import { Controller, Get } from '@inversifyjs/http-core';
import { OasParameter } from '@inversifyjs/http-open-api';
import { ValidatedParams } from '@inversifyjs/open-api-validation';

interface UserParams {
  userId: string;
}

@Controller('/users')
export class UserController {
  @OasParameter({
    in: 'path',
    name: 'userId',
    required: true,
    schema: { format: 'uuid', type: 'string' },
  })
  @Get('/:userId')
  public getUser(@ValidatedParams() params: UserParams): string {
    return `User ID: ${params.userId}`;
  }
}
