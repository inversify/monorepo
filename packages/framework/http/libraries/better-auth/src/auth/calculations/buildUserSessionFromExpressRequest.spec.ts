import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('../calculations/getBetterAuthFromRequest.js'));

import { type BetterAuthOptions } from 'better-auth';
import type express from 'express';

import { getBetterAuthFromRequest } from '../calculations/getBetterAuthFromRequest.js';
import { type BetterAuth } from '../models/BetterAuth.js';
import { type UserSession } from '../models/UserSession.js';
import { buildUserSessionFromExpressRequest } from './buildUserSessionFromExpressRequest.js';

describe(buildUserSessionFromExpressRequest, () => {
  describe('having a request with no cookie', () => {
    let requestFixture: express.Request;

    beforeAll(() => {
      requestFixture = {
        headers: {},
      } as Partial<express.Request> as express.Request;
    });

    describe('when called', () => {
      let authMock: Mocked<BetterAuth<BetterAuthOptions>>;
      let sessionFixture: UserSession<BetterAuthOptions> | null;

      let result: unknown;

      beforeAll(async () => {
        authMock = {
          api: {
            getSession: vitest.fn(),
          } as unknown,
        } as Partial<Mocked<BetterAuth<BetterAuthOptions>>> as Mocked<
          BetterAuth<BetterAuthOptions>
        >;
        sessionFixture = null;

        vitest.mocked(getBetterAuthFromRequest).mockReturnValueOnce(authMock);

        vitest
          .mocked(
            authMock.api
              .getSession as unknown as () => Promise<UserSession<BetterAuthOptions> | null>,
          )
          .mockResolvedValueOnce(sessionFixture);

        result = await buildUserSessionFromExpressRequest(requestFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getBetterAuthFromRequest()', () => {
        expect(getBetterAuthFromRequest).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
        );
      });

      it('should call auth.api.getSession()', () => {
        expect(authMock.api.getSession).toHaveBeenCalledExactlyOnceWith({
          asResponse: false,
          headers: new Headers(),
        });
      });

      it('should return the session', () => {
        expect(result).toBe(sessionFixture);
      });
    });
  });

  describe('having a request with cookie', () => {
    let requestFixture: express.Request;

    beforeAll(() => {
      requestFixture = {
        headers: {
          cookie: 'cookie=value; another-cookie=another-value',
        },
      } as Partial<express.Request> as express.Request;
    });

    describe('when called', () => {
      let authMock: Mocked<BetterAuth<BetterAuthOptions>>;
      let sessionFixture: UserSession<BetterAuthOptions> | null;

      let result: unknown;

      beforeAll(async () => {
        authMock = {
          api: {
            getSession: vitest.fn(),
          } as unknown,
        } as Partial<Mocked<BetterAuth<BetterAuthOptions>>> as Mocked<
          BetterAuth<BetterAuthOptions>
        >;
        sessionFixture = null;

        vitest.mocked(getBetterAuthFromRequest).mockReturnValueOnce(authMock);

        vitest
          .mocked(
            authMock.api
              .getSession as unknown as () => Promise<UserSession<BetterAuthOptions> | null>,
          )
          .mockResolvedValueOnce(sessionFixture);

        result = await buildUserSessionFromExpressRequest(requestFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getBetterAuthFromRequest()', () => {
        expect(getBetterAuthFromRequest).toHaveBeenCalledExactlyOnceWith(
          requestFixture,
        );
      });

      it('should call auth.api.getSession()', () => {
        const headers: Headers = new Headers();

        headers.append('cookie', requestFixture.headers.cookie as string);

        expect(authMock.api.getSession).toHaveBeenCalledExactlyOnceWith({
          asResponse: false,
          headers,
        });
      });

      it('should return the session', () => {
        expect(result).toBe(sessionFixture);
      });
    });
  });
});
