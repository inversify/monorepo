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
import { FastifyRequest } from 'fastify';

import { getBetterAuthFromRequest } from '../calculations/getBetterAuthFromRequest';
import { BetterAuth } from '../models/BetterAuth';
import { UserSession } from '../models/UserSession';
import { buildUserSessionFromFastifyRequest } from './buildUserSessionFromFastifyRequest';

describe(buildUserSessionFromFastifyRequest, () => {
  describe('having a request with no cookie', () => {
    let requestFixture: FastifyRequest;

    beforeAll(() => {
      requestFixture = {
        headers: {},
      } as Partial<FastifyRequest> as FastifyRequest;
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
          .mocked(authMock.api.getSession)
          .mockResolvedValueOnce(sessionFixture);

        result = await buildUserSessionFromFastifyRequest(requestFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getBetterAuthFromRequest()', () => {
        expect(getBetterAuthFromRequest).toHaveBeenCalledTimes(1);
        expect(getBetterAuthFromRequest).toHaveBeenCalledWith(requestFixture);
      });

      it('should call auth.api.getSession()', () => {
        expect(authMock.api.getSession).toHaveBeenCalledTimes(1);
        expect(authMock.api.getSession).toHaveBeenCalledWith({
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
    let requestFixture: FastifyRequest;

    beforeAll(() => {
      requestFixture = {
        headers: {
          cookie: 'cookie=value; another-cookie=another-value',
        },
      } as Partial<FastifyRequest> as FastifyRequest;
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
          .mocked(authMock.api.getSession)
          .mockResolvedValueOnce(sessionFixture);

        result = await buildUserSessionFromFastifyRequest(requestFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getBetterAuthFromRequest()', () => {
        expect(getBetterAuthFromRequest).toHaveBeenCalledTimes(1);
        expect(getBetterAuthFromRequest).toHaveBeenCalledWith(requestFixture);
      });

      it('should call auth.api.getSession()', () => {
        const headers: Headers = new Headers();

        headers.append('cookie', requestFixture.headers.cookie as string);

        expect(authMock.api.getSession).toHaveBeenCalledTimes(1);
        expect(authMock.api.getSession).toHaveBeenCalledWith({
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
