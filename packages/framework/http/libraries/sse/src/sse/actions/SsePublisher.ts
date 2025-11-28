import { Readable } from 'node:stream';

import { Pipe } from '@inversifyjs/framework-core';
import {
  createCustomNativeParameterDecorator,
  CustomNativeParameterDecoratorHandlerOptions,
  HttpStatusCode,
} from '@inversifyjs/http-core';
import { ServiceIdentifier } from 'inversify';

import { SseStream } from '../../stream/models/SseStream';
import { stringifyMessageEvent } from '../calculations/stringifyMessageEvent';
import { MessageEvent } from '../models/MessageEvent';
import { SsePublisherOptions } from '../models/SsePublisherOptions';

async function* mapMessageEventAsyncIterable(
  events: AsyncIterable<MessageEvent>,
): AsyncGenerator<string> {
  for await (const messageEvent of events) {
    yield stringifyMessageEvent(messageEvent);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unnecessary-type-parameters, @typescript-eslint/no-explicit-any
export function SsePublisher<TResult = any>(
  ...parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[]
): ParameterDecorator {
  return createCustomNativeParameterDecorator<
    unknown,
    unknown,
    (sseOptions: SsePublisherOptions) => Promise<TResult>,
    TResult
  >(
    (
      request: unknown,
      response: unknown,
      options: CustomNativeParameterDecoratorHandlerOptions<
        unknown,
        unknown,
        TResult
      >,
    ): ((sseOptions: SsePublisherOptions) => Promise<TResult>) => {
      return async (sseOptions: SsePublisherOptions): Promise<TResult> => {
        options.setStatus(
          request,
          response,
          sseOptions.statusCode ?? HttpStatusCode.OK,
        );

        options.setHeader(
          request,
          response,
          'cache-control',
          'private, no-cache, no-store, must-revalidate, max-age=0, no-transform',
        );
        options.setHeader(
          request,
          response,
          'content-type',
          'text/event-stream',
        );
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
    },
    ...parameterPipeList,
  );
}
