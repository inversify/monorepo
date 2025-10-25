import {
  BadRequestHttpResponse,
  Controller,
  Get,
  Request,
} from '@inversifyjs/http-core';
import { type FastifyRequest } from 'fastify';

// Begin-example
@Controller('/headers')
export class RequestFastifyController {
  @Get()
  public async readHeader(@Request() request: FastifyRequest): Promise<string> {
    const value: string | string[] | undefined =
      request.headers['x-test-header'];

    let parsedValue: string;

    if (Array.isArray(value)) {
      if (value.length !== 1) {
        throw new BadRequestHttpResponse(
          'Expected a single `x-test-header` value',
        );
      }

      [parsedValue] = value as [string];
    } else {
      parsedValue = value ?? '';
    }

    return parsedValue;
  }
}
