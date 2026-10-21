import { beforeAll, describe, expect, it } from 'vitest';

import {
  buildCallsUrl,
  type CallsPage,
  nextCallsPage,
  readCallsPage,
} from './callsApi.js';

describe(buildCallsUrl, () => {
  describe('having a URL fragment', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = buildCallsUrl({
          page: 2,
          requestMethod: undefined,
          requestUrlLike: '/users',
          responseStatusCode: undefined,
        });
      });

      it('should target the calls endpoint', () => {
        const url: URL = new URL(result, 'http://insights.local');

        expect(url.pathname).toBe('/.inversify/v1/calls');
        expect(url.searchParams.get('page')).toBe('2');
        expect(url.searchParams.get('pageSize')).toBe('20');
        expect(url.searchParams.get('requestUrlLike')).toBe('/users');
        expect(url.searchParams.get('sort')).toBe('startedAtDesc');
      });
    });
  });

  describe('having an empty URL fragment', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = buildCallsUrl({
          page: 1,
          requestMethod: undefined,
          requestUrlLike: '',
          responseStatusCode: undefined,
        });
      });

      it('should omit requestUrlLike', () => {
        const url: URL = new URL(result, 'http://insights.local');

        expect(url.searchParams.has('requestUrlLike')).toBe(false);
      });
    });
  });

  describe('having method and status filters', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = buildCallsUrl({
          page: 1,
          requestMethod: 'POST',
          requestUrlLike: '',
          responseStatusCode: 400,
        });
      });

      it('should set requestMethod and responseStatusCode', () => {
        const url: URL = new URL(result, 'http://insights.local');

        expect(url.searchParams.get('requestMethod')).toBe('POST');
        expect(url.searchParams.get('responseStatusCode')).toBe('400');
        expect(url.searchParams.has('requestUrlLike')).toBe(false);
      });
    });
  });
});

describe(readCallsPage, () => {
  describe('having a call payload', () => {
    describe('when called', () => {
      let result: CallsPage;

      beforeAll(() => {
        result = readCallsPage(
          {
            items: [
              {
                controller: undefined,
                id: 'call-1',
                request: {
                  method: 'GET',
                  startedAt: '2026-10-19T20:00:00.000Z',
                  url: '/users',
                },
                response: {
                  sentAt: '2026-10-19T20:00:00.018Z',
                  statusCode: 200,
                },
              },
            ],
            total: 1,
          },
          1,
        );
      });

      it('should map the call summary', () => {
        expect(result).toStrictEqual({
          items: [
            {
              durationMs: 18,
              id: 'call-1',
              method: 'GET',
              statusCode: 200,
              url: '/users',
            },
          ],
          page: 1,
          total: 1,
        });
      });
    });
  });

  describe('having a payload without items', () => {
    describe('when called', () => {
      it('should throw', () => {
        expect(() => {
          readCallsPage({ total: 0 }, 1);
        }).toThrow('Calls response has an unexpected shape.');
      });
    });
  });

  describe('having a call without a status code', () => {
    describe('when called', () => {
      it('should throw', () => {
        expect(() => {
          readCallsPage(
            {
              items: [
                {
                  id: 'call-1',
                  request: {
                    method: 'GET',
                    startedAt: '2026-10-19T20:00:00.000Z',
                    url: '/users',
                  },
                  response: {
                    sentAt: '2026-10-19T20:00:00.018Z',
                  },
                },
              ],
              total: 1,
            },
            1,
          );
        }).toThrow('Call item has an unexpected shape.');
      });
    });
  });
});

describe(nextCallsPage, () => {
  describe('having a full page and a larger total', () => {
    describe('when called', () => {
      let result: number | undefined;

      beforeAll(() => {
        result = nextCallsPage({
          items: Array.from(
            { length: 20 },
            (_unused: unknown, index: number) => ({
              durationMs: 1,
              id: String(index),
              method: 'GET',
              statusCode: 200,
              url: '/users',
            }),
          ),
          page: 1,
          total: 21,
        });
      });

      it('should return the following page', () => {
        expect(result).toBe(2);
      });
    });
  });

  describe('having loaded every call', () => {
    describe('when called', () => {
      let result: number | undefined;

      beforeAll(() => {
        result = nextCallsPage({
          items: [
            {
              durationMs: 1,
              id: 'call-1',
              method: 'GET',
              statusCode: 200,
              url: '/users',
            },
          ],
          page: 1,
          total: 1,
        });
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having an empty page', () => {
    describe('when called', () => {
      let result: number | undefined;

      beforeAll(() => {
        result = nextCallsPage({
          items: [],
          page: 2,
          total: 40,
        });
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
