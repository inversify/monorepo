import {
  CatchError,
  Controller,
  Get,
  InternalServerErrorHttpResponse,
  isHttpResponse,
  NotFoundHttpResponse,
} from '@inversifyjs/http-core';
import { FastifyErrorFilter } from '@inversifyjs/http-fastify';
import { ConsoleLogger, Logger } from '@inversifyjs/logger';
import { FastifyReply, FastifyRequest } from 'fastify';

// Begin-example
@CatchError()
export class GlobalErrorFilter implements FastifyErrorFilter {
  readonly #logger: Logger;

  constructor() {
    this.#logger = new ConsoleLogger('GlobalErrorFilter');
  }

  public async catch(
    err: unknown,
    _request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    if (isHttpResponse(err)) {
      this.#logger.http(
        `HttpResponse error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`,
      );

      void reply.status(err.statusCode).send(err.body);

      return;
    }

    this.#logger.error(
      `Unhandled error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`,
    );

    const internalServerErrorStatusCode: number = 500;

    void reply.status(internalServerErrorStatusCode).send({
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
      {
        message: 'Internal error occurred',
      },
      'Internal error occurred',
    );
  }
}
