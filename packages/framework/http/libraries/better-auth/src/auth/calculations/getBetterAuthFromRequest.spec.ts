import { beforeAll, describe, expect, it } from 'vitest';

import { InternalServerErrorHttpResponse } from '@inversifyjs/http-core';
import { BetterAuthOptions } from 'better-auth';

import { BetterAuth } from '../models/BetterAuth';
import { betterAuthProperty } from '../models/betterAuthProperty';
import { getBetterAuthFromRequest } from './getBetterAuthFromRequest';

describe(getBetterAuthFromRequest, () => {
  describe('having a request with no betterAuthProperty', () => {
    let requestFixture: object;

    beforeAll(() => {
      requestFixture = {};
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          getBetterAuthFromRequest(requestFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an InternalServerErrorHttpResponse', () => {
        const expectedErrorProperties: Partial<InternalServerErrorHttpResponse> =
          {
            message:
              'BetterAuth auth not found when accessing user session. Did you forget to apply the BetterAuth middleware?',
            statusCode: 500,
          };

        expect(result).toBeInstanceOf(InternalServerErrorHttpResponse);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having a request with a betterAuthProperty', () => {
    let requestFixture: object;
    let betterAuthFixture: BetterAuth<BetterAuthOptions>;

    beforeAll(() => {
      betterAuthFixture = Symbol() as unknown as BetterAuth<BetterAuthOptions>;
      requestFixture = {
        [betterAuthProperty]: betterAuthFixture,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getBetterAuthFromRequest(requestFixture);
      });

      it('should return the BetterAuth instance', () => {
        expect(result).toBe(betterAuthFixture);
      });
    });
  });
});
