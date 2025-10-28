import {
  CatchError,
  Controller,
  Get,
  InternalServerErrorHttpResponse,
  isHttpResponse,
  NotFoundHttpResponse,
} from '@inversifyjs/http-core';
import { ExpressErrorFilter } from '@inversifyjs/http-express';
import { ConsoleLogger, Logger } from '@inversifyjs/logger';
import express from 'express';

// Begin-example
@CatchError()
export class GlobalErrorFilter implements ExpressErrorFilter {
  readonly #logger: Logger;

  constructor() {
    this.#logger = new ConsoleLogger('GlobalErrorFilter');
  }

  public catch(
    err: unknown,
    _request: express.Request,
    response: express.Response,
  ): void {
    if (isHttpResponse(err)) {
      this.#logger.http(
        `HttpResponse error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`,
      );

      response.status(err.statusCode).send(err.body);

      return;
    }

    this.#logger.error(
      `Unhandled error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`,
    );

    const internalServerErrorStatusCode: number = 500;

    response.status(internalServerErrorStatusCode).send({
      error: 'Internal Server Error',
      message: 'Unhandled error',
      statusCode: internalServerErrorStatusCode,
    });
  }
}
// End-example

@Controller('/demo')
export class DemoController {
  @Get('/http-response')
  public httpResponse(): void {
    throw new NotFoundHttpResponse('Resource not found');
  }

  @Get('/generic-error')
  public genericError(): void {
    throw new Error('Something went wrong');
  }

  @Get('/internal-server-error')
  public internalServerError(): void {
    throw new InternalServerErrorHttpResponse('Internal error occurred');
  }
}
