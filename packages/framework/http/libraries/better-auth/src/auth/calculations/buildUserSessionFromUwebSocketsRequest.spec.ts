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
import { HttpRequest } from 'uWebSockets.js';

import { BetterAuth } from '../models/BetterAuth';
import { UserSession } from '../models/UserSession';
import { buildUserSessionFromUwebSocketsRequest } from './buildUserSessionFromUwebSocketsRequest';
import { getBetterAuthFromRequest } from './getBetterAuthFromRequest';

describe(buildUserSessionFromUwebSocketsRequest, () => {
  let requestMock: Mocked<HttpRequest>;

  beforeAll(() => {
    requestMock = {
      getHeader: vitest.fn() as unknown,
    } as Partial<Mocked<HttpRequest>> as Mocked<HttpRequest>;
  });

  describe('when called, and request.getHeader() returns empty string', () => {
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

      requestMock.getHeader.mockReturnValueOnce('');

      vitest
        .mocked(
          authMock.api
            .getSession as unknown as () => Promise<UserSession<BetterAuthOptions> | null>,
        )
        .mockResolvedValueOnce(sessionFixture);

      result = await buildUserSessionFromUwebSocketsRequest(requestMock);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getBetterAuthFromRequest()', () => {
      expect(getBetterAuthFromRequest).toHaveBeenCalledExactlyOnceWith(
        requestMock,
      );
    });

    it('should call request.getHeader()', () => {
      expect(requestMock.getHeader).toHaveBeenCalledExactlyOnceWith('cookie');
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

  describe('when called, and request.header() returns a value', () => {
    let authMock: Mocked<BetterAuth<BetterAuthOptions>>;
    let sessionFixture: UserSession<BetterAuthOptions> | null;

    let cookieValueFixture: string;

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

      cookieValueFixture = 'cookie=value; another-cookie=another-value';

      requestMock.getHeader.mockReturnValueOnce(cookieValueFixture);

      vitest.mocked(getBetterAuthFromRequest).mockReturnValueOnce(authMock);

      vitest
        .mocked(
          authMock.api
            .getSession as unknown as () => Promise<UserSession<BetterAuthOptions> | null>,
        )
        .mockResolvedValueOnce(sessionFixture);

      result = await buildUserSessionFromUwebSocketsRequest(requestMock);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getBetterAuthFromRequest()', () => {
      expect(getBetterAuthFromRequest).toHaveBeenCalledExactlyOnceWith(
        requestMock,
      );
    });

    it('should call auth.api.getSession()', () => {
      const headers: Headers = new Headers();

      headers.append('cookie', cookieValueFixture);

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
