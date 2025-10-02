import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock('../calculations/getBetterAuthFromRequest');

import { BetterAuthOptions } from 'better-auth';
import express from 'express';

import { getBetterAuthFromRequest } from '../calculations/getBetterAuthFromRequest';
import { BetterAuth } from '../models/BetterAuth';
import { UserSession } from '../models/UserSession';
import { buildUserSessionFromExpressRequest } from './buildUserSessionFromExpressRequest';

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
