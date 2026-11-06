import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import http, { type RequestListener } from 'node:http';
import { type AddressInfo } from 'node:net';

import type express from 'express';

import { bootstrap } from './ecosystemHttpInsights.js';

const CALL_POLL_ATTEMPTS: number = 40;
const CALL_POLL_INTERVAL_MS: number = 25;

interface RecordedCall {
  readonly request: {
    readonly method: string;
    readonly url: string;
  };
  readonly response: {
    readonly statusCode: number;
  };
}

interface CallsResponse {
  readonly items: readonly RecordedCall[];
}

describe('ecosystem HTTP insights', () => {
  let origin: string;
  let server: http.Server;

  beforeAll(async () => {
    const application: express.Application = await bootstrap();
    const httpServer: http.Server = http.createServer(
      application as RequestListener,
    );

    origin = await listen(httpServer);
    server = httpServer;
  });

  afterAll(async () => {
    await closeServer(server);
  });

  describe('when a request is served', () => {
    let calls: readonly RecordedCall[];
    let pingBody: string;
    let pingStatus: number;

    beforeAll(async () => {
      const pingResponse: Response = await fetch(`${origin}/ping`);

      pingStatus = pingResponse.status;
      pingBody = await pingResponse.text();
      await fetch(`${origin}/.inversify/http-insights-ui`);
      calls = await readCalls(origin);
    });

    it('should serve the controller', () => {
      expect(pingStatus).toBe(200);
      expect(pingBody).toBe('pong');
    });

    it('should record the call', () => {
      expect(calls).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            request: expect.objectContaining({
              method: 'GET',
              url: '/ping',
            }),
            response: expect.objectContaining({
              statusCode: 200,
            }),
          }),
        ]),
      );
    });

    it('should leave insights URLs out of the recorded calls', () => {
      expect(
        calls.some((call: RecordedCall): boolean =>
          isInsightsUrl(call.request.url),
        ),
      ).toBe(false);
    });
  });
});

async function closeServer(server: http.Server): Promise<void> {
  await new Promise<void>(
    (
      resolve: (value: void | PromiseLike<void>) => void,
      reject: (reason?: unknown) => void,
    ): void => {
      server.close((error: Error | undefined): void => {
        if (error === undefined) {
          resolve();
        } else {
          reject(error);
        }
      });
    },
  );
}

async function delay(milliseconds: number): Promise<void> {
  await new Promise<void>((resolve: () => void): void => {
    setTimeout((): void => {
      resolve();
    }, milliseconds);
  });
}

function isInsightsUrl(url: string): boolean {
  return url === '/.inversify' || url.startsWith('/.inversify/');
}

async function listen(server: http.Server): Promise<string> {
  return new Promise<string>(
    (
      resolve: (value: string | PromiseLike<string>) => void,
      reject: (reason?: unknown) => void,
    ): void => {
      server.listen(0, '127.0.0.1', (): void => {
        const address: AddressInfo | string | null = server.address();

        if (address === null || typeof address === 'string') {
          reject(new Error('Failed to get server address'));

          return;
        }

        resolve(`http://${address.address}:${address.port.toString()}`);
      });
    },
  );
}

async function readCalls(origin: string): Promise<readonly RecordedCall[]> {
  let latestCalls: readonly RecordedCall[] = [];

  for (let attempt: number = 0; attempt < CALL_POLL_ATTEMPTS; attempt += 1) {
    const response: Response = await fetch(`${origin}/.inversify/v1/calls`);
    const body: CallsResponse = (await response.json()) as CallsResponse;

    latestCalls = body.items;

    if (
      latestCalls.some(
        (call: RecordedCall): boolean => call.request.url === '/ping',
      )
    ) {
      return latestCalls;
    }

    await delay(CALL_POLL_INTERVAL_MS);
  }

  return latestCalls;
}
