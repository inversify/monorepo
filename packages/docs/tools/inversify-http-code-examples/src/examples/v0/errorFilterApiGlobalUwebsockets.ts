import {
  CatchError,
  Controller,
  Get,
  InternalServerErrorHttpResponse,
  isHttpResponse,
  NotFoundHttpResponse,
} from '@inversifyjs/http-core';
import { UwebSocketsErrorFilter } from '@inversifyjs/http-uwebsockets';
import { ConsoleLogger, Logger } from '@inversifyjs/logger';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';

// Begin-example
@CatchError()
export class GlobalErrorFilter implements UwebSocketsErrorFilter {
  readonly #logger: Logger;

  constructor() {
    this.#logger = new ConsoleLogger('GlobalErrorFilter');
  }

  public catch(
    err: unknown,
    _request: HttpRequest,
    response: HttpResponse,
  ): void {
    if (isHttpResponse(err)) {
      this.#logger.http(
        `HttpResponse error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`,
      );

      response.cork((): void => {
        response.writeStatus(err.statusCode.toString());
        response.writeHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(err.body));
      });

      return;
    }

    this.#logger.error(
      `Unhandled error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`,
    );

    const internalServerErrorStatusCode: number = 500;

    response.cork((): void => {
      response.writeStatus(internalServerErrorStatusCode.toString());
      response.writeHeader('Content-Type', 'application/json');
      response.end(
        JSON.stringify({
          error: 'Internal Server Error',
          message: 'Unhandled error',
          statusCode: internalServerErrorStatusCode,
        }),
      );
    });
  }
}
// End-example

@Controller('/demo')
export class DemoController {
  @Get('/http-response')
  public httpResponse(): void {
    throw new NotFoundHttpResponse(
      { message: 'Resource not found' },
      'Resource not found',
    );
  }

  @Get('/generic-error')
  public genericError(): void {
    throw new Error('Something went wrong');
  }

  @Get('/internal-server-error')
  public internalServerError(): void {
    throw new InternalServerErrorHttpResponse(
      { message: 'Internal error occurred' },
      'Internal error occurred',
    );
  }
}
