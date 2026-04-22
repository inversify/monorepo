import { beforeAll, describe, expect, it } from 'vitest';

import { sortOpenApiPathTemplates } from './sortOpenApiPathTemplates.js';

describe(sortOpenApiPathTemplates, () => {
  describe('having two identical paths', () => {
    describe('when called', () => {
      let result: number;

      beforeAll(() => {
        result = sortOpenApiPathTemplates('/users', '/users');
      });

      it('should return 0', () => {
        expect(result).toBe(0);
      });
    });
  });

  describe('having two paths with no params, first alphabetically less than second', () => {
    describe('when called', () => {
      let result: number;

      beforeAll(() => {
        result = sortOpenApiPathTemplates('/posts', '/users');
      });

      it('should return a negative number', () => {
        expect(result).toBeLessThan(0);
      });
    });
  });

  describe('having two paths with no params, first alphabetically greater than second', () => {
    describe('when called', () => {
      let result: number;

      beforeAll(() => {
        result = sortOpenApiPathTemplates('/users', '/posts');
      });

      it('should return a positive number', () => {
        expect(result).toBeGreaterThan(0);
      });
    });
  });

  describe('having two paths with a param, literal slice before param is less in first', () => {
    describe('when called', () => {
      let result: number;

      beforeAll(() => {
        result = sortOpenApiPathTemplates('/api/v1/{id}', '/api/v2/{id}');
      });

      it('should return a negative number', () => {
        expect(result).toBeLessThan(0);
      });
    });
  });

  describe('having two paths with a param, literal slice before param is greater in first', () => {
    describe('when called', () => {
      let result: number;

      beforeAll(() => {
        result = sortOpenApiPathTemplates('/api/v2/{id}', '/api/v1/{id}');
      });

      it('should return a positive number', () => {
        expect(result).toBeGreaterThan(0);
      });
    });
  });

  describe('having two paths with a param at the same position and equal literal slices before the param', () => {
    describe('when called', () => {
      let result: number;

      beforeAll(() => {
        result = sortOpenApiPathTemplates('/users/{id}', '/users/{name}');
      });

      it('should fall back to full string comparison and return a negative number', () => {
        expect(result).toBeLessThan(0);
      });
    });
  });

  describe('having first path with a param and second path without any param', () => {
    describe('when called', () => {
      let result: number;

      beforeAll(() => {
        result = sortOpenApiPathTemplates('/users/{id}', '/users');
      });

      it('should return a positive number placing the param-less path first', () => {
        expect(result).toBeGreaterThan(0);
      });
    });
  });

  describe('having first path without a param and second path with a param', () => {
    describe('when called', () => {
      let result: number;

      beforeAll(() => {
        result = sortOpenApiPathTemplates('/users', '/users/{id}');
      });

      it('should return a negative number placing the param-less path first', () => {
        expect(result).toBeLessThan(0);
      });
    });
  });

  describe('having two paths with multiple params and different literal sections between params', () => {
    describe('when called', () => {
      let result: number;

      beforeAll(() => {
        result = sortOpenApiPathTemplates(
          '/api/v1/{userId}/posts/{postId}',
          '/api/v2/{userId}/posts/{postId}',
        );
      });

      it('should return a negative number based on the first differing literal section', () => {
        expect(result).toBeLessThan(0);
      });
    });
  });

  describe('having two paths with multiple params and equal literal sections between params', () => {
    describe('when called', () => {
      let result: number;

      beforeAll(() => {
        result = sortOpenApiPathTemplates(
          '/users/{userId}/posts/{postId}',
          '/users/{userId}/posts/{commentId}',
        );
      });

      it('should fall back to full string comparison', () => {
        expect(result).toBeGreaterThan(0);
      });
    });
  });

  describe('having two paths with params at different positions', () => {
    describe('when called', () => {
      let result: number;

      beforeAll(() => {
        result = sortOpenApiPathTemplates('/a/{x}/c', '/a/b/{y}');
      });

      it('should compare the literal slice before the first param', () => {
        // firstPathParamStartIndex = 3 ('{' in '/a/{x}/c')
        // secondPathParamStartIndex = 5 ('{' in '/a/b/{y}')
        // firstSlice = '/a/{x}/c'.slice(0, 3) = '/a/'
        // secondSlice = '/a/b/{y}'.slice(0, 5) = '/a/b/'
        // '/a/' < '/a/b/' → return -1 (negative)
        expect(result).toBeLessThan(0);
      });
    });
  });
});
