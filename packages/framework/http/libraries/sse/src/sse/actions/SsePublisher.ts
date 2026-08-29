import { Readable } from 'node:stream';

import {
  createCustomNativeParameterMethodDecorator,
  type CustomNativeParameterDecoratorHandlerOptions,
  HttpStatusCode,
} from '@inversifyjs/http-core';

import { SseStream } from '../../stream/models/SseStream.js';
import { stringifyMessageEvent } from '../calculations/stringifyMessageEvent.js';
import { type MessageEvent } from '../models/MessageEvent.js';
import { type SsePublisherOptions } from '../models/SsePublisherOptions.js';

async function* mapMessageEventAsyncIterable(
  events: AsyncIterable<MessageEvent>,
): AsyncGenerator<string> {
  for await (const messageEvent of events) {
    yield stringifyMessageEvent(messageEvent);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSseHandler<TResult = any>(): (
  request: unknown,
  response: unknown,
  options: CustomNativeParameterDecoratorHandlerOptions<unknown, unknown, TResult>,
) => (sseOptions: SsePublisherOptions) => Promise<TResult> {
  return (
    request: unknown,
    response: unknown,
    options: CustomNativeParameterDecoratorHandlerOptions<unknown, unknown, TResult>,
  ): ((sseOptions: SsePublisherOptions) => Promise<TResult>) => {
    return async (sseOptions: SsePublisherOptions): Promise<TResult> => {
      options.setStatus(request, response, sseOptions.statusCode ?? HttpStatusCode.OK);
      options.setHeader(request, response, 'cache-control', 'private, no-cache, no-store, must-revalidate, max-age=0, no-transform');
      options.setHeader(request, response, 'content-type', 'text/event-stream');
      options.setHeader(request, response, 'expires', '0');
      options.setHeader(request, response, 'pragma', 'no-cache');
      options.setHeader(request, response, 'connection', 'keep-alive');
      // NGINX support https://www.nginx.com/resources/wiki/start/topics/examples/x-accel/#x-accel-buffering
      options.setHeader(request, response, 'x-accel-buffering', 'no');
      await options.sendBodySeparator(request, response);
      const stream: Readable = SseStream.is(sseOptions.events)
        ? sseOptions.events
        : Readable.from(mapMessageEventAsyncIterable(sseOptions.events));
      return options.send(request, response, stream);
    };
  };
}

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
export function SsePublisher<TResult = any>(
  paramName: string,
): (value: Function, context: ClassMethodDecoratorContext) => void {
  return createCustomNativeParameterMethodDecorator(buildSseHandler<TResult>())(paramName);
}
