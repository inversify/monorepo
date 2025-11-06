import { Readable } from 'node:stream';
import { URLSearchParamsIterator } from 'node:url';

import {
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
  HttpRequest,
  HttpResponse,
  RecognizedString,
  TemplatedApp,
} from 'uWebSockets.js';

import { pipeStreamOverResponse } from '../actions/pipeStreamOverResponse';
import { abortedSymbol } from '../data/abortedSymbol';
import { CustomHttpResponse } from '../models/CustomHttpResponse';
import { UwebSocketsHttpAdapterOptions } from '../models/UwebSocketsHttpAdapterOptions';

export class InversifyUwebSocketsHttpAdapter extends InversifyHttpAdapter<
  HttpRequest,
  HttpResponse,
  () => void,
  void,
  UwebSocketsHttpAdapterOptions
> {
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
        useJson: true,
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

      let routePath: string = `${routerParams.path}${routeParams.path}`;

      if (routePath.endsWith('/') && routePath.length > 1) {
        routePath = routePath.slice(0, -1);
      }

      this.#getAppRouteHandler(routeParams.requestMethodType)(
        routePath,
        async (res: HttpResponse, req: HttpRequest) => {
          res.onAborted(() => {
            (res as CustomHttpResponse)[abortedSymbol] = true;
          });

          let currentIndex: number = 0;
          let [currentHandler]: MiddlewareHandler<
            HttpRequest,
            HttpResponse,
            () => void,
            void
          >[] = orderedHandlers;
          let nextCalled: boolean = false;

          const next: () => void = (): void => {
            nextCalled = true;
          };

          while (currentHandler !== undefined) {
            await currentHandler(req, res, next);

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!nextCalled) {
              break;
            }

            nextCalled = false;
            currentHandler = orderedHandlers[++currentIndex];
          }
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
    _request: HttpRequest,
    response: HttpResponse,
    parameterName?: string,
  ): Promise<unknown> {
    const body: unknown = await this.#parseBody(response);

    if (parameterName === undefined) {
      return body;
    }

    if (!(parameterName in (body as Record<string, unknown>))) {
      throw new Error(`Body parameter '${parameterName}' not found.`);
    }

    return (body as Record<string, unknown>)[parameterName];
  }

  protected _getParams(request: HttpRequest, parameterName?: string): unknown {
    if (parameterName === undefined) {
      throw new Error(
        'Getting all route parameters is not supported in uWebSockets.js adapter.',
      );
    }

    return request.getParameter(parameterName);
  }

  protected _getQuery(request: HttpRequest, parameterName?: string): unknown {
    return parameterName === undefined
      ? this.#parseQuery(request)
      : request.getQuery(parameterName);
  }

  protected _getHeaders(request: HttpRequest, parameterName?: string): unknown {
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

  async #parseBody(res: HttpResponse): Promise<unknown> {
    return new Promise<unknown>(
      (
        resolve: (value: unknown) => void,
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

            if (this.httpAdapterOptions.useJson) {
              resolve(JSON.parse(stringifiedBody));
            } else {
              resolve(stringifiedBody);
            }
          }
        });
      },
    );
  }

  #parseCookies(request: HttpRequest): Record<string, string> {
    const cookieHeader: string = request.getHeader('cookie');

    if (cookieHeader === '') {
      return {};
    }

    // Parse cookies manually
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
}
