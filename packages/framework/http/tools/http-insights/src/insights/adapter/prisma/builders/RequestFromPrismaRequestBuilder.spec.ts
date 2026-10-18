import { beforeAll, describe, expect, it } from 'vitest';

import { type Request as PrismaRequest } from '../../../../generated/prisma/client.js';
import { type Request } from '../../../domain/models/Request.js';
import { PrismaRequestFixtures } from '../fixtures/PrismaRequestFixtures.js';
import { RequestFromPrismaRequestBuilder } from './RequestFromPrismaRequestBuilder.js';

describe(RequestFromPrismaRequestBuilder, () => {
  let requestFromPrismaRequestBuilder: RequestFromPrismaRequestBuilder;

  beforeAll(() => {
    requestFromPrismaRequestBuilder = new RequestFromPrismaRequestBuilder();
  });

  describe('.build', () => {
    describe('when called', () => {
      let prismaRequestFixture: PrismaRequest;

      let result: unknown;

      beforeAll(() => {
        prismaRequestFixture = PrismaRequestFixtures.any;

        result = requestFromPrismaRequestBuilder.build(prismaRequestFixture);
      });

      it('should return a Request', () => {
        const expected: Request = {
          headers:
            prismaRequestFixture.headers as unknown as Request['headers'],
          id: prismaRequestFixture.id,
          method: prismaRequestFixture.method,
          startedAt: prismaRequestFixture.started_at,
          url: prismaRequestFixture.url,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
