import { Readable } from 'node:stream';
import { URLSearchParamsIterator } from 'node:url';

import {
  buildNormalizedPath,
  handleMiddlewareList,
  HttpStatusCode,
  InversifyHttpAdapter,
  MiddlewareHandler,
  RequestMethodParameterType,
  RequestMethodType,
  RouterParams,
} from '@inversifyjs/http-core';
import { Container } from 'inversify';
import {
  App,
  getParts,
  HttpRequest,
  HttpResponse,
  RecognizedString,
  TemplatedApp,
} from 'uWebSockets.js';

import { pipeStreamOverResponse } from '../actions/pipeStreamOverResponse';
import { abortedSymbol } from '../data/abortedSymbol';
import { CustomHttpResponse } from '../models/CustomHttpResponse';
import { UwebSocketsHttpAdapterOptions } from '../models/UwebSocketsHttpAdapterOptions';

const ADAPTER_ID: unique symbol = Symbol.for(
  '@inversifyjs/http-uwebsockets/InversifyUwebSocketsHttpAdapter',
);

export class InversifyUwebSocketsHttpAdapter extends InversifyHttpAdapter<
  HttpRequest,
  HttpResponse,
  () => void,
  void,
  UwebSocketsHttpAdapterOptions
> {
  public readonly id: symbol = ADAPTER_ID;

  readonly #app: TemplatedApp;

  constructor(
    container: Container,
    httpAdapterOptions?: UwebSocketsHttpAdapterOptions,
    customApp?: TemplatedApp,
  ) {
    super(
      container,
      {
        logger: true,
      },
      httpAdapterOptions,
      [RequestMethodParameterType.Body],
    );

    this.#app = customApp ?? this.#buildDefaultApp();
  }

  public async build(): Promise<TemplatedApp> {
    await this._buildServer();

    return this.#app;
  }

  protected _buildRouter(
    routerParams: RouterParams<HttpRequest, HttpResponse, () => void, void>,
  ): void {
    for (const routeParams of routerParams.routeParamsList) {
      const orderedHandlers: MiddlewareHandler<
        HttpRequest,
        HttpResponse,
        () => void,
        void
      >[] = [
        ...routeParams.preHandlerMiddlewareList,
        ...routeParams.guardList,
        routeParams.handler,
        ...routeParams.postHandlerMiddlewareList,
      ];

      const routePath: string = buildNormalizedPath(
        `${routerParams.path}${routeParams.path}`,
      );

      const handleMiddlewares: (
        request: HttpRequest,
        response: HttpResponse,
      ) => Promise<void> = handleMiddlewareList(orderedHandlers);

      this.#getAppRouteHandler(routeParams.requestMethodType)(
        routePath,
        async (res: HttpResponse, req: HttpRequest) => {
          res.onAborted(() => {
            (res as CustomHttpResponse)[abortedSymbol] = true;
          });

          await handleMiddlewares(req, res);
        },
      );
    }
  }

  protected _replyJson(
    _request: HttpRequest,
    response: HttpResponse,
    value?: object,
  ): void {
    if ((response as CustomHttpResponse)[abortedSymbol] !== true) {
      response.cork((): void => {
        response.end(JSON.stringify(value));
      });
    }
  }

  protected _replyText(
    _request: HttpRequest,
    response: HttpResponse,
    value?: string,
  ): void {
    if ((response as CustomHttpResponse)[abortedSymbol] !== true) {
      response.cork((): void => {
        response.end(value);
      });
    }
  }

  protected _replyStream(
    _request: HttpRequest,
    response: HttpResponse,
    stream: Readable,
  ): void {
    pipeStreamOverResponse(
      response,
      stream,
      this.httpAdapterOptions.logger === false ? undefined : this._logger,
    );
  }

  protected _sendBodySeparator(
    _request: HttpRequest,
    _response: HttpResponse,
  ): void {
    /*
     * Once https://github.com/uNetworking/uWebSockets/pull/1897 is merged and released,
     * we can implement this method to use `response.beginWrite()`.
     * For now, we log a warning if logger is enabled.
     */
    if (this.httpAdapterOptions.logger !== false) {
      this._logger.warn(
        'Unable to send body separator. Headers will be delivered with the first chunk of the body.',
      );
    }
  }

  protected _setStatus(
    _request: HttpRequest,
    response: HttpResponse,
    statusCode: HttpStatusCode,
  ): void {
    response.cork((): void => {
      response.writeStatus(statusCode.toString());
    });
  }

  protected _setHeader(
    _request: HttpRequest,
    response: HttpResponse,
    key: string,
    value: string,
  ): void {
    response.cork((): void => {
      response.writeHeader(key, value);
    });
  }

  protected async _getBody(
    request: HttpRequest,
    response: HttpResponse,
    parameterName?: string,
  ): Promise<unknown> {
    const contentTypeHeader: string = request.getHeader('content-type');

    const body: unknown = await this.#parseBody(contentTypeHeader, response);

    if (parameterName === undefined) {
      return body;
    }

    if (!(parameterName in (body as Record<string, unknown>))) {
      throw new Error(`Body parameter '${parameterName}' not found.`);
    }

    return (body as Record<string, unknown>)[parameterName];
  }

  protected _getParams(request: HttpRequest): Record<string, string>;
  protected _getParams(
    request: HttpRequest,
    parameterName: string,
  ): string | undefined;
  protected _getParams(
    request: HttpRequest,
    parameterName?: string,
  ): Record<string, string> | string | undefined {
    if (parameterName === undefined) {
      throw new Error(
        'Getting all route parameters is not supported in uWebSockets.js adapter.',
      );
    }

    return request.getParameter(parameterName);
  }

  protected _getQuery(request: HttpRequest): Record<string, unknown>;
  protected _getQuery(request: HttpRequest, parameterName: string): unknown;
  protected _getQuery(request: HttpRequest, parameterName?: string): unknown {
    return parameterName === undefined
      ? this.#parseQuery(request)
      : request.getQuery(parameterName);
  }

  protected _getHeaders(
    request: HttpRequest,
  ): Record<string, string | string[] | undefined>;
  protected _getHeaders(
    request: HttpRequest,
    parameterName: string,
  ): string | string[] | undefined;
  protected _getHeaders(
    request: HttpRequest,
    parameterName?: string,
  ):
    | Record<string, string | string[] | undefined>
    | string
    | string[]
    | undefined {
    return parameterName === undefined
      ? this.#parseHeaders(request)
      : request.getHeader(parameterName);
  }

  protected _getCookies(
    request: HttpRequest,
    _response: HttpResponse,
    parameterName?: string,
  ): unknown {
    const cookies: Record<string, string> = this.#parseCookies(request);

    return parameterName === undefined ? cookies : cookies[parameterName];
  }

  #buildDefaultApp(): TemplatedApp {
    return App();
  }

  #getAppRouteHandler(
    requestMethodType: RequestMethodType,
  ): (
    pattern: RecognizedString,
    handler: (res: HttpResponse, req: HttpRequest) => void | Promise<void>,
  ) => TemplatedApp {
    switch (requestMethodType) {
      case RequestMethodType.All:
        return this.#app.any.bind(this.#app);
      case RequestMethodType.Delete:
        return this.#app.del.bind(this.#app);
      case RequestMethodType.Get:
        return this.#app.get.bind(this.#app);
      case RequestMethodType.Head:
        return this.#app.head.bind(this.#app);
      case RequestMethodType.Options:
        return this.#app.options.bind(this.#app);
      case RequestMethodType.Patch:
        return this.#app.patch.bind(this.#app);
      case RequestMethodType.Post:
        return this.#app.post.bind(this.#app);
      case RequestMethodType.Put:
        return this.#app.put.bind(this.#app);
    }
  }

  async #parseBody(
    contentTypeHeader: string,
    response: HttpResponse,
  ): Promise<unknown> {
    return new Promise<unknown>(
      (
        resolve: (value: unknown) => void,
        reject: (reason?: unknown) => void,
      ) => {
        const chunks: Buffer[] = [];
        let totalLength: number = 0;

        response.onAborted(() => {
          reject(new Error('Request aborted'));
        });

        response.onData((chunk: ArrayBuffer, isLast: boolean) => {
          const curBuf: Buffer<ArrayBuffer> = Buffer.from(chunk);
          chunks.push(curBuf);
          totalLength += curBuf.length;

          if (isLast) {
            const buffer: Buffer = Buffer.concat(chunks, totalLength);

            try {
              resolve(this.#parseStringifiedBody(contentTypeHeader, buffer));
            } catch (error: unknown) {
              reject(
                new Error('Failed to parse request body', {
                  cause: error,
                }),
              );
            }
          }
        });
      },
    );
  }

  #parseContentType(contentTypeHeader: string): string | undefined {
    const [contentType]: string[] = contentTypeHeader.split(';');

    if (contentType === undefined) {
      return contentType;
    }

    const normalizedContentType: string = contentType.trim().toLowerCase();

    return normalizedContentType === '' ? undefined : normalizedContentType;
  }

  #parseStringifiedBody(contentTypeHeader: string, buffer: Buffer): unknown {
    const contentType: string | undefined =
      this.#parseContentType(contentTypeHeader);

    switch (contentType) {
      case 'application/json':
        return JSON.parse(buffer.toString());
      case 'application/x-www-form-urlencoded':
        return this.#parseUrlEncodedBody(buffer.toString());
      case 'multipart/form-data':
        return getParts(buffer, contentTypeHeader);
      default:
        return buffer.toString();
    }
  }

  #parseCookies(request: HttpRequest): Record<string, string> {
    const cookieHeader: string = request.getHeader('cookie');

    if (cookieHeader === '') {
      return {};
    }

    const cookies: Record<string, string> = {};

    for (const cookie of cookieHeader.split(';')) {
      const [name, ...rest]: string[] = cookie.split('=');
      const value: string = rest.join('=').trim();

      if (name !== undefined) {
        cookies[name.trim()] = decodeURIComponent(value);
      }
    }

    return cookies;
  }

  #parseHeaders(request: HttpRequest): Record<string, string> {
    const headers: Record<string, string> = {};
    request.forEach((key: string, value: string) => {
      headers[key] = value;
    });
    return headers;
  }

  #parseQuery(request: HttpRequest): Record<string, string | string[]> {
    const queryEntries: URLSearchParamsIterator<[string, string]> =
      new URLSearchParams(request.getQuery()).entries();

    const result: Record<string, string | string[]> = {};

    for (const [key, value] of queryEntries) {
      if (result[key] !== undefined) {
        if (Array.isArray(result[key])) {
          result[key].push(value);
        } else {
          result[key] = [result[key], value];
        }
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  #parseUrlEncodedBody(
    stringifiedBody: string,
  ): Record<string, string | string[]> {
    const urlSearchParams: URLSearchParams = new URLSearchParams(
      stringifiedBody,
    );
    const parsedBody: Record<string, string | string[]> = {};

    urlSearchParams.forEach((value: string, key: string) => {
      if (parsedBody[key] === undefined) {
        parsedBody[key] = value;
      } else {
        if (Array.isArray(parsedBody[key])) {
          parsedBody[key].push(value);
        } else {
          parsedBody[key] = [parsedBody[key], value];
        }
      }
    });

    return parsedBody;
  }
}
