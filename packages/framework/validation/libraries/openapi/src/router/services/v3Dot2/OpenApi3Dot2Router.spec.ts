import { beforeAll, describe, expect, it } from 'vitest';

import { type OpenApi3Dot2Object } from '@inversifyjs/open-api-types/v3Dot2';

import { OpenApi3Dot2Router } from './OpenApi3Dot2Router.js';

describe(OpenApi3Dot2Router, () => {
  describe('having an OpenAPI object with paths', () => {
    let router: OpenApi3Dot2Router;

    beforeAll(() => {
      const openApiObject: OpenApi3Dot2Object = {
        info: { title: 'Test', version: '1.0.0' },
        openapi: '3.2.0',
        paths: {
          '/users': {
            get: { responses: {} },
            post: { responses: {} },
          },
          '/users/{userId}': {
            get: { responses: {} },
          },
        },
      };

      router = new OpenApi3Dot2Router(openApiObject);
    });

    describe('.findRoute', () => {
      describe('when called with a static path that matches', () => {
        let result: unknown;

        beforeAll(() => {
          result = router.findRoute('get', '/users');
        });

        it('should return the matched path', () => {
          expect(result).toBe('/users');
        });
      });

      describe('when called with a parameterized path', () => {
        let result: unknown;

        beforeAll(() => {
          result = router.findRoute('get', '/users/123');
        });

        it('should return the parameterized route', () => {
          expect(result).toBe('/users/{userId}');
        });
      });

      describe('when called with a method that has no routes', () => {
        let result: unknown;

        beforeAll(() => {
          result = router.findRoute('delete', '/users');
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });

      describe('when called with a path that has no match', () => {
        let result: unknown;

        beforeAll(() => {
          result = router.findRoute('get', '/posts');
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });
  });

  describe('having an OpenAPI object with no paths', () => {
    let router: OpenApi3Dot2Router;

    beforeAll(() => {
      const openApiObject: OpenApi3Dot2Object = {
        info: { title: 'Test', version: '1.0.0' },
        openapi: '3.2.0',
      };

      router = new OpenApi3Dot2Router(openApiObject);
    });

    describe('.findRoute', () => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = router.findRoute('get', '/users');
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });
  });

  describe('having an OpenAPI object with static and param paths that conflict', () => {
    let router: OpenApi3Dot2Router;

    beforeAll(() => {
      const openApiObject: OpenApi3Dot2Object = {
        info: { title: 'Test', version: '1.0.0' },
        openapi: '3.2.0',
        paths: {
          '/users/{userId}': {
            get: { responses: {} },
          },
          '/users/me': {
            get: { responses: {} },
          },
        },
      };

      router = new OpenApi3Dot2Router(openApiObject);
    });

    describe('.findRoute', () => {
      describe('when called with /users/me', () => {
        let result: unknown;

        beforeAll(() => {
          result = router.findRoute('get', '/users/me');
        });

        it('should return first registered route', () => {
          expect(result).toBe('/users/{userId}');
        });
      });

      describe('when called with /users/456', () => {
        let result: unknown;

        beforeAll(() => {
          result = router.findRoute('get', '/users/456');
        });

        it('should match the parameterized route', () => {
          expect(result).toBe('/users/{userId}');
        });
      });
    });
  });
});
