import { beforeAll, describe, expect, it } from 'vitest';

import { type Response as PrismaResponse } from '../../../../generated/prisma/client.js';
import { type Response } from '../../../domain/models/Response.js';
import { PrismaResponseFixtures } from '../fixtures/PrismaResponseFixtures.js';
import { ResponseFromPrismaResponseBuilder } from './ResponseFromPrismaResponseBuilder.js';

describe(ResponseFromPrismaResponseBuilder, () => {
  let responseFromPrismaResponseBuilder: ResponseFromPrismaResponseBuilder;

  beforeAll(() => {
    responseFromPrismaResponseBuilder = new ResponseFromPrismaResponseBuilder();
  });

  describe('.build', () => {
    describe('when called', () => {
      let prismaResponseFixture: PrismaResponse;

      let result: unknown;

      beforeAll(() => {
        prismaResponseFixture = PrismaResponseFixtures.any;

        result = responseFromPrismaResponseBuilder.build(prismaResponseFixture);
      });

      it('should return a Response', () => {
        const expected: Response = {
          aborted: prismaResponseFixture.aborted,
          headers:
            prismaResponseFixture.headers as unknown as Response['headers'],
          id: prismaResponseFixture.id,
          sentAt: prismaResponseFixture.sent_at,
          statusCode: prismaResponseFixture.status_code,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
