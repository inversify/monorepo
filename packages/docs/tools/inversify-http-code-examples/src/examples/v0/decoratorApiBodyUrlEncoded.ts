import { Body, Controller, Post } from '@inversifyjs/http-core';

export interface FormResult {
  username: string;
  password: string;
}

// Begin-example
@Controller('/auth')
export class BodyUrlEncodedController {
  @Post('/login')
  public async login(
    @Body() body: Record<string, string | string[]>,
  ): Promise<FormResult> {
    // Body is automatically parsed from URL-encoded form data
    // when Content-Type is application/x-www-form-urlencoded
    return {
      password: body['password'] as string,
      username: body['username'] as string,
    };
  }
}
