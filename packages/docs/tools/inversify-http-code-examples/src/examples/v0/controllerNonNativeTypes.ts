import {
  Body,
  Controller,
  CreatedHttpResponse,
  ErrorHttpResponse,
  Get,
  HttpStatusCode,
  Post,
  SetHeader,
} from '@inversifyjs/http-core';

export interface CreateUserRequest {
  email: string;
  name: string;
}

export interface User {
  email: string;
  id: number;
  name: string;
}

// Begin-example
@Controller('/users')
export class NonNativeUsersController {
  // Return plain value - Inversify converts to JSON response
  @Get()
  @SetHeader('X-Custom-Header', 'CustomValue')
  public async getUsers(): Promise<User[]> {
    return [
      { email: 'john@example.com', id: 1, name: 'John Doe' },
      { email: 'jane@example.com', id: 2, name: 'Jane Smith' },
    ];
  }

  // Return specific HttpResponse for custom status codes
  @Post()
  public async createUser(
    @Body() userData: CreateUserRequest,
  ): Promise<CreatedHttpResponse> {
    const newUser: User = {
      email: userData.email,
      id: Math.random(),
      name: userData.name,
    };

    return new CreatedHttpResponse(newUser);
  }

  // Throw ErrorHttpResponse for error conditions
  @Get('/not-found')
  public async getUserNotFound(): Promise<never> {
    throw new ErrorHttpResponse(
      HttpStatusCode.NOT_FOUND,
      { message: 'The requested user does not exist' },
      'The requested user does not exist',
    );
  }

  // Return string directly - sent as text response
  @Get('/status')
  public async getStatus(): Promise<string> {
    return 'Service is healthy';
  }
}
// End-example
