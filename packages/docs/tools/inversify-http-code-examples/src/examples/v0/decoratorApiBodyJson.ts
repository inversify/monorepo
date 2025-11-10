import { Body, Controller, Post } from '@inversifyjs/http-core';

export interface UserPayload {
  name: string;
  email: string;
}

export interface UserResult {
  id: number;
  name: string;
  email: string;
}

// Begin-example
@Controller('/users')
export class BodyJsonController {
  @Post()
  public async createUser(@Body() body: UserPayload): Promise<UserResult> {
    // Body is automatically parsed from JSON when Content-Type is application/json
    return {
      email: body.email,
      id: 1,
      name: body.name,
    };
  }
}
