import {
  CatchError,
  Controller,
  Get,
  InternalServerErrorHttpResponse,
  isHttpResponse,
  NotFoundHttpResponse,
} from '@inversifyjs/http-core';
import { HonoErrorFilter } from '@inversifyjs/http-hono';
import { ConsoleLogger, Logger } from '@inversifyjs/logger';
import { Context, HonoRequest } from 'hono';
import { type ContentfulStatusCode } from 'hono/utils/http-status';

// Begin-example
@CatchError()
export class GlobalErrorFilter implements HonoErrorFilter {
  readonly #logger: Logger;

  constructor() {
    this.#logger = new ConsoleLogger('GlobalErrorFilter');
  }

  public catch(
    err: unknown,
    _request: HonoRequest,
    context: Context,
  ): Response | undefined {
    if (isHttpResponse(err)) {
      this.#logger.http(
        `HttpResponse error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`,
      );

      return context.json(err.body, err.statusCode as ContentfulStatusCode);
    }

    this.#logger.error(
      `Unhandled error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`,
    );

    const internalServerErrorStatusCode: ContentfulStatusCode = 500;

    return context.json(
      {
        error: 'Internal Server Error',
        message: 'Unhandled error',
        statusCode: internalServerErrorStatusCode,
      },
      internalServerErrorStatusCode,
    );
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
