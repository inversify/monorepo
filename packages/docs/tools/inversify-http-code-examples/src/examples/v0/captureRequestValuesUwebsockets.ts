/* eslint-disable @typescript-eslint/naming-convention */
// Begin-example
import {
  Controller,
  createCustomParameterDecorator,
  CustomParameterDecoratorHandlerOptions,
  Get,
} from '@inversifyjs/http-core';
import { CaptureRequestValues } from '@inversifyjs/http-uwebsockets';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';

export interface AuditEntry {
  method: string;
  userAgent: string | string[] | undefined;
  userId: string | undefined;
}

// A custom parameter decorator awaiting async work before reading the request
export const Audit: () => ParameterDecorator = () =>
  createCustomParameterDecorator(
    async (
      request: HttpRequest,
      _response: HttpResponse,
      options: CustomParameterDecoratorHandlerOptions<
        HttpRequest,
        HttpResponse
      >,
    ): Promise<AuditEntry> => {
      await Promise.resolve();

      return {
        method: options.getMethod(request),
        userAgent: options.getHeaders(request, 'user-agent'),
        userId: options.getParams(request, 'userId') as string | undefined,
      };
    },
  );

@Controller('/users')
export class UsersController {
  @CaptureRequestValues(['headers', 'method', 'params'])
  @Get('/:userId')
  public async getUser(@Audit() audit: AuditEntry): Promise<AuditEntry> {
    return audit;
  }
}
// End-example
