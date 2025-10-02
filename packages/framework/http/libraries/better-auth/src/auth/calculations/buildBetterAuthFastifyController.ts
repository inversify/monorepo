/*
 * Better Auth Fastify Controller
 * https://www.better-auth.com/docs/integrations/fastify
 */

import {
  All,
  Controller,
  Request as InversifyRequest,
  Response as InversifyResponse,
} from '@inversifyjs/http-core';
import { BetterAuthOptions } from 'better-auth';
import { FastifyReply, FastifyRequest } from 'fastify';
import { inject, Newable } from 'inversify';

import { BetterAuth } from '../models/BetterAuth';
import { betterAuthServiceIdentifier } from '../models/betterAuthServiceIdentifier';

export function buildBetterAuthFastifyController(
  basePath: string,
  serviceIdentifier: symbol,
): Newable<unknown> {
  @Controller({
    path: basePath,
    serviceIdentifier,
  })
  class BetterAuthFastifyController<TOptions extends BetterAuthOptions> {
    readonly #auth: BetterAuth<TOptions>;

    constructor(
      @inject(betterAuthServiceIdentifier)
      auth: BetterAuth<TOptions>,
    ) {
      this.#auth = auth;
    }

    @All('/*')
    public async handle(
      @InversifyRequest() request: FastifyRequest,
      @InversifyResponse() reply: FastifyReply,
    ): Promise<void> {
      const req: Request = this.#buildRequest(request);

      const response: Response = await this.#auth.handler(req);

      await this.#sendResponse(response, reply);
    }

    #appendBody(
      headers: Headers,
      request: FastifyRequest,
      requestInit: RequestInit,
    ): void {
      if (request.body !== undefined) {
        const contentType: string | null = headers.get('content-type');

        if (
          contentType !== null &&
          contentType.includes('application/x-www-form-urlencoded')
        ) {
          requestInit.body = new URLSearchParams(
            request.body as Record<string, string>,
          );
        } else {
          requestInit.body = JSON.stringify(request.body);
        }
      }
    }

    #buildHeaders(request: FastifyRequest): Headers {
      const headers: Headers = new Headers();

      for (const [key, value] of Object.entries(request.headers)) {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            for (const valueElement of value) {
              headers.append(key, valueElement);
            }
          } else {
            headers.append(key, value);
          }
        }
      }

      return headers;
    }

    #buildRequest(request: FastifyRequest): Request {
      const headers: Headers = this.#buildHeaders(request);

      const requestInit: RequestInit = {
        headers,
        method: request.method,
      };

      this.#appendBody(headers, request, requestInit);

      return new Request(this.#buildUrl(request), requestInit);
    }

    #buildUrl(request: FastifyRequest): URL {
      return new URL(request.url, `${request.protocol}://${request.host}`);
    }

    async #sendResponse(
      response: Response,
      reply: FastifyReply,
    ): Promise<void> {
      reply.status(response.status);

      for (const [key, value] of response.headers) {
        reply.header(key, value);
      }

      reply.send(response.body === null ? null : await response.text());
    }
  }

  return BetterAuthFastifyController;
}
