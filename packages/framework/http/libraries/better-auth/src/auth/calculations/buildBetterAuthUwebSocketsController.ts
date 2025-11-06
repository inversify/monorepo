import {
  All,
  Controller,
  Request as InversifyRequest,
  Response as InversifyResponse,
} from '@inversifyjs/http-core';
import { BetterAuthOptions } from 'better-auth';
import { inject, Newable } from 'inversify';
import type { HttpRequest, HttpResponse } from 'uWebSockets.js';

import { BetterAuth } from '../models/BetterAuth';
import { betterAuthServiceIdentifier } from '../models/betterAuthServiceIdentifier';

export function buildBetterAuthUwebSocketsController(
  basePath: string,
  serviceIdentifier: symbol,
): Newable<unknown> {
  @Controller({
    path: basePath,
    serviceIdentifier,
  })
  class BetterAuthUwebSocketsController<TOptions extends BetterAuthOptions> {
    readonly #auth: BetterAuth<TOptions>;

    constructor(
      @inject(betterAuthServiceIdentifier)
      auth: BetterAuth<TOptions>,
    ) {
      this.#auth = auth;
    }

    @All('/*')
    public async handle(
      @InversifyRequest() request: HttpRequest,
      @InversifyResponse() response: HttpResponse,
    ): Promise<void> {
      const handlerRequest: Request = await this.#buildRequest(
        request,
        response,
      );

      const handlerResponse: Response =
        await this.#auth.handler(handlerRequest);

      await this.#sendResponse(handlerResponse, response);
    }

    async #appendBody(
      headers: Headers,
      response: HttpResponse,
      requestInit: RequestInit,
    ): Promise<void> {
      const contentLength: string | null = headers.get('content-length');
      const hasChunkedTransfer: boolean =
        headers.get('transfer-encoding')?.toLowerCase().includes('chunked') ??
        false;

      if (
        (contentLength === null || contentLength === '0') &&
        !hasChunkedTransfer
      ) {
        return;
      }

      const body: string = await this.#parseBody(response);

      if (body !== '') {
        const contentType: string | null = headers.get('content-type');

        if (
          contentType !== null &&
          contentType.includes('application/x-www-form-urlencoded')
        ) {
          requestInit.body = new URLSearchParams(body);
        } else {
          requestInit.body = body;
        }
      }
    }

    #buildHeaders(request: HttpRequest): Headers {
      const headers: Headers = new Headers();

      request.forEach((key: string, value: string) => {
        headers.append(key, value);
      });

      return headers;
    }

    async #buildRequest(
      request: HttpRequest,
      response: HttpResponse,
    ): Promise<Request> {
      const headers: Headers = this.#buildHeaders(request);

      const requestInit: RequestInit = {
        headers,
        method: request.getMethod(),
      };

      const url: URL = this.#buildUrl(request);

      await this.#appendBody(headers, response, requestInit);

      return new Request(url, requestInit);
    }

    #buildUrl(request: HttpRequest): URL {
      const protocol: string = request.getHeader('x-forwarded-proto') || 'http';
      const host: string = request.getHeader('host');
      const path: string = request.getUrl();
      const query: string = request.getQuery();

      const url: string = `${protocol}://${host}${path}${query ? `?${query}` : ''}`;

      return new URL(url);
    }

    async #parseBody(res: HttpResponse): Promise<string> {
      return new Promise<string>(
        (
          resolve: (value: string) => void,
          reject: (reason?: unknown) => void,
        ) => {
          let buffer: Buffer | undefined;

          res.onAborted(() => {
            reject(new Error('Request aborted'));
          });

          res.onData((chunk: ArrayBuffer, isLast: boolean) => {
            const curBuf: Buffer<ArrayBuffer> = Buffer.from(chunk);

            if (buffer === undefined) {
              buffer = curBuf;
            } else {
              buffer = Buffer.concat([buffer, curBuf]);
            }

            if (isLast) {
              const stringifiedBody: string = buffer.toString();

              resolve(stringifiedBody);
            }
          });
        },
      );
    }

    async #sendResponse(
      handlerResponse: Response,
      response: HttpResponse,
    ): Promise<void> {
      const buffer: ArrayBuffer = await handlerResponse.arrayBuffer();

      response.cork(() => {
        response.writeStatus(handlerResponse.status.toString());

        for (const [key, value] of handlerResponse.headers) {
          response.writeHeader(key, value);
        }

        response.end(handlerResponse.body === null ? undefined : buffer);
      });
    }
  }

  return BetterAuthUwebSocketsController;
}
