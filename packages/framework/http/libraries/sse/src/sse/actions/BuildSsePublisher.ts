import { Readable } from 'node:stream';

import { Pipe } from '@inversifyjs/framework-core';
import {
  createCustomParameterDecorator,
  HttpResponse,
  HttpStatusCode,
  isHttpResponseSymbol,
} from '@inversifyjs/http-core';
import { ServiceIdentifier } from 'inversify';

import { stringifyMessageEvent } from '../calculations/stringifyMessageEvent';
import { MessageEvent } from '../models/MessageEvent';

export interface SsePublisherOptions {
  events: AsyncIterable<MessageEvent>;
  statusCode?: HttpStatusCode;
}

async function* mapMessageEventAsyncIterable(
  events: AsyncIterable<MessageEvent>,
): AsyncGenerator<string> {
  for await (const messageEvent of events) {
    yield stringifyMessageEvent(messageEvent);
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function BuildSsePublisher(
  ...parameterPipeList: (ServiceIdentifier<Pipe> | Pipe)[]
): ParameterDecorator {
  return createCustomParameterDecorator(
    (): ((sseOptions: SsePublisherOptions) => HttpResponse) => {
      return (sseOptions: SsePublisherOptions): HttpResponse => {
        return {
          body: Readable.from(mapMessageEventAsyncIterable(sseOptions.events)),
          headers: {
            'cache-control':
              'private, no-cache, no-store, must-revalidate, max-age=0, no-transform',
            connection: 'keep-alive',
            'content-type': 'text/event-stream',
            expire: '0',
            pragma: 'no-cache',
            'transfer-encoding': 'chunked',
            // NGINX support https://www.nginx.com/resources/wiki/start/topics/examples/x-accel/#x-accel-buffering
            'x-accel-buffering': 'no',
          },
          [isHttpResponseSymbol]: true,
          statusCode: sseOptions.statusCode ?? HttpStatusCode.OK,
        };
      };
    },
    ...parameterPipeList,
  );
}
