import {
  BadRequestHttpResponse,
  Controller,
  Get,
  Request,
} from '@inversifyjs/http-core';
import express from 'express4';

// Begin-example
@Controller('/headers')
export class RequestExpressController {
  @Get()
  public async readHeader(
    @Request() request: express.Request,
  ): Promise<string> {
    const value: string | string[] | undefined =
      request.headers['x-test-header'];

    let parsedValue: string;

    if (Array.isArray(value)) {
      if (value.length !== 1) {
        throw new BadRequestHttpResponse(
          { message: 'Expected a single `x-test-header` value' },
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
