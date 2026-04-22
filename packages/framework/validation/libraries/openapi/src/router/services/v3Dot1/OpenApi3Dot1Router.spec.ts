import { beforeAll, describe, expect, it } from 'vitest';

import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';

import { OpenApi3Dot1Router } from './OpenApi3Dot1Router.js';

describe(OpenApi3Dot1Router, () => {
  describe('having an OpenAPI object with paths', () => {
    let router: OpenApi3Dot1Router;

    beforeAll(() => {
      const openApiObject: OpenApi3Dot1Object = {
        info: { title: 'Test', version: '1.0.0' },
        openapi: '3.1.0',
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

      router = new OpenApi3Dot1Router(openApiObject);
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
    let router: OpenApi3Dot1Router;

    beforeAll(() => {
      const openApiObject: OpenApi3Dot1Object = {
        info: { title: 'Test', version: '1.0.0' },
        openapi: '3.1.0',
      };

      router = new OpenApi3Dot1Router(openApiObject);
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
    let router: OpenApi3Dot1Router;

    beforeAll(() => {
      const openApiObject: OpenApi3Dot1Object = {
        info: { title: 'Test', version: '1.0.0' },
        openapi: '3.1.0',
        paths: {
          '/users/{userId}': {
            get: { responses: {} },
          },
          '/users/me': {
            get: { responses: {} },
          },
        },
      };

      router = new OpenApi3Dot1Router(openApiObject);
    });

    describe('.findRoute', () => {
      describe('when called with /users/me', () => {
        let result: unknown;

        beforeAll(() => {
          result = router.findRoute('get', '/users/me');
        });

        it('should return the concrete route', () => {
          expect(result).toBe('/users/me');
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

  describe('having an OpenAPI object with a root path', () => {
    let router: OpenApi3Dot1Router;

    beforeAll(() => {
      const openApiObject: OpenApi3Dot1Object = {
        info: { title: 'Test', version: '1.0.0' },
        openapi: '3.1.0',
        paths: {
          '/': {
            get: { responses: {} },
          },
        },
      };

      router = new OpenApi3Dot1Router(openApiObject);
    });

    describe('.findRoute', () => {
      describe('when called with /', () => {
        let result: unknown;

        beforeAll(() => {
          result = router.findRoute('get', '/');
        });

        it('should return the root route', () => {
          expect(result).toBe('/');
        });
      });
    });
  });
});
