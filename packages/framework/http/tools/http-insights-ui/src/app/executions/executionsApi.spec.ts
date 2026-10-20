import { beforeAll, describe, expect, it } from 'vitest';

import {
  buildExecutionsUrl,
  type ExecutionsPage,
  nextExecutionsPage,
  readExecutionsPage,
} from './executionsApi.js';

describe(buildExecutionsUrl, () => {
  describe('having a URL fragment', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = buildExecutionsUrl({
          page: 2,
          requestUrlLike: '/users',
        });
      });

      it('should target the executions endpoint', () => {
        const url: URL = new URL(result, 'http://insights.local');

        expect(url.pathname).toBe('/.inversify/v1/executions');
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
        result = buildExecutionsUrl({
          page: 1,
          requestUrlLike: '',
        });
      });

      it('should omit requestUrlLike', () => {
        const url: URL = new URL(result, 'http://insights.local');

        expect(url.searchParams.has('requestUrlLike')).toBe(false);
      });
    });
  });
});

describe(readExecutionsPage, () => {
  describe('having an execution payload', () => {
    describe('when called', () => {
      let result: ExecutionsPage;

      beforeAll(() => {
        result = readExecutionsPage(
          {
            items: [
              {
                controller: undefined,
                id: 'execution-1',
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
      });

      it('should map the execution summary', () => {
        expect(result).toStrictEqual({
          items: [
            {
              durationMs: 18,
              id: 'execution-1',
              method: 'GET',
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
          readExecutionsPage({ total: 0 }, 1);
        }).toThrow('Executions response has an unexpected shape.');
      });
    });
  });
});

describe(nextExecutionsPage, () => {
  describe('having a full page and a larger total', () => {
    describe('when called', () => {
      let result: number | undefined;

      beforeAll(() => {
        result = nextExecutionsPage({
          items: Array.from(
            { length: 20 },
            (_unused: unknown, index: number) => ({
              durationMs: 1,
              id: String(index),
              method: 'GET',
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

  describe('having loaded every execution', () => {
    describe('when called', () => {
      let result: number | undefined;

      beforeAll(() => {
        result = nextExecutionsPage({
          items: [
            {
              durationMs: 1,
              id: 'execution-1',
              method: 'GET',
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
        result = nextExecutionsPage({
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
