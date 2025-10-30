import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Controller, Get, Params, Query } from '@inversifyjs/http-core';
import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer';
import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer';
import { Server } from '../../server/models/Server';
import { ParseNumberPipe } from './pipeApiParseNumber';

interface SumResult {
  sum: number;
}

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpress4Server],
  [buildExpressServer],
  [buildFastifyServer],
  [buildHonoServer],
])(
  'Pipe API (ParseNumberPipe + Query/Params)',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      @Controller('/math')
      class MathController {
        @Get('/sum/:a/:b')
        public async sum(
          @Params(
            {
              name: 'a',
            },
            ParseNumberPipe,
          )
          a: number,
          @Params(
            {
              name: 'b',
            },
            ParseNumberPipe,
          )
          b: number,
        ): Promise<SumResult> {
          return { sum: a + b };
        }

        @Get('/double')
        public async double(
          @Query(
            {
              name: 'v',
            },
            ParseNumberPipe,
          )
          v: number,
        ): Promise<SumResult> {
          return { sum: v * 2 };
        }
      }

      const container: Container = new Container();
      container.bind(MathController).toSelf().inSingletonScope();
      container.bind(ParseNumberPipe).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    it('parses Params as numbers and sums them', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/math/sum/2/5`,
      );
      const body: SumResult = (await response.json()) as SumResult;

      expect(response.status).toBe(200);
      expect(body).toStrictEqual({ sum: 7 });
    });

    it('parses Query as number and doubles it', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/math/double?v=11`,
      );
      const body: SumResult = (await response.json()) as SumResult;

      expect(response.status).toBe(200);
      expect(body).toStrictEqual({ sum: 22 });
    });

    it('returns 400 Bad Request when not a number (Params)', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/math/sum/x/1`,
      );
      const body: unknown = await response.json();

      expect(response.status).toBe(400);
      expect(body).toMatchObject({ message: 'Invalid number' });
    });

    it('returns 400 Bad Request when not a number (Query)', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/math/double?v=abc`,
      );
      const body: unknown = await response.json();

      expect(response.status).toBe(400);
      expect(body).toMatchObject({ message: 'Invalid number' });
    });
  },
);
