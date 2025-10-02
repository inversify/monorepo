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
import { HonoRequest } from 'hono';

import { BetterAuth } from '../models/BetterAuth';
import { UserSession } from '../models/UserSession';
import { buildUserSessionFromHonoRequest } from './buildUserSessionFromHonoRequest';
import { getBetterAuthFromRequest } from './getBetterAuthFromRequest';

describe(buildUserSessionFromHonoRequest, () => {
  let requestMock: Mocked<HonoRequest>;

  beforeAll(() => {
    requestMock = {
      header: vitest.fn() as unknown,
    } as Partial<Mocked<HonoRequest>> as Mocked<HonoRequest>;
  });

  describe('when called, and request.header() returns undefined', () => {
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

      result = await buildUserSessionFromHonoRequest(requestMock);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getBetterAuthFromRequest()', () => {
      expect(getBetterAuthFromRequest).toHaveBeenCalledExactlyOnceWith(
        requestMock,
      );
    });

    it('should call request.header()', () => {
      expect(requestMock.header).toHaveBeenCalledExactlyOnceWith('cookie');
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

      vitest
        .mocked(requestMock.header as (name: string) => string | undefined)
        .mockReturnValueOnce(cookieValueFixture);

      vitest.mocked(getBetterAuthFromRequest).mockReturnValueOnce(authMock);

      vitest
        .mocked(
          authMock.api
            .getSession as unknown as () => Promise<UserSession<BetterAuthOptions> | null>,
        )
        .mockResolvedValueOnce(sessionFixture);

      result = await buildUserSessionFromHonoRequest(requestMock);
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
