import { beforeAll, describe, expect, it } from 'vitest';

import { type RouterNode } from '../models/RouterNode.js';
import { wildcardKey } from '../models/wildcardKey.js';
import { findRoute } from './findRoute.js';

describe(findRoute, () => {
  describe('having a simple static tree', () => {
    let rootNode: RouterNode;

    beforeAll(() => {
      rootNode = {
        children: {
          '': {
            children: {
              users: {
                children: undefined,
                path: '/users',
              },
            },
            path: undefined,
          },
        },
        path: undefined,
      };
    });

    describe('when called with a matching path', () => {
      let result: unknown;

      beforeAll(() => {
        result = findRoute(rootNode, '/users');
      });

      it('should return the matched path', () => {
        expect(result).toBe('/users');
      });
    });

    describe('when called with a non-matching path', () => {
      let result: unknown;

      beforeAll(() => {
        result = findRoute(rootNode, '/posts');
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a tree with wildcard nodes', () => {
    let rootNode: RouterNode;

    beforeAll(() => {
      rootNode = {
        children: {
          '': {
            children: {
              users: {
                children: {
                  [wildcardKey]: {
                    children: undefined,
                    path: '/users/{userId}',
                  },
                },
                path: '/users',
              },
            },
            path: undefined,
          },
        },
        path: undefined,
      };
    });

    describe('when called with a path that matches the wildcard', () => {
      let result: unknown;

      beforeAll(() => {
        result = findRoute(rootNode, '/users/123');
      });

      it('should return the wildcard path', () => {
        expect(result).toBe('/users/{userId}');
      });
    });

    describe('when called with a path that matches the static node', () => {
      let result: unknown;

      beforeAll(() => {
        result = findRoute(rootNode, '/users');
      });

      it('should return the static path', () => {
        expect(result).toBe('/users');
      });
    });
  });

  describe('having a tree with static and wildcard at same level', () => {
    let rootNode: RouterNode;

    beforeAll(() => {
      rootNode = {
        children: {
          '': {
            children: {
              users: {
                children: {
                  me: {
                    children: undefined,
                    path: '/users/me',
                  },
                  [wildcardKey]: {
                    children: undefined,
                    path: '/users/{userId}',
                  },
                },
                path: undefined,
              },
            },
            path: undefined,
          },
        },
        path: undefined,
      };
    });

    describe('when called with /users/me', () => {
      let result: unknown;

      beforeAll(() => {
        result = findRoute(rootNode, '/users/me');
      });

      it('should prefer the static match over the wildcard', () => {
        expect(result).toBe('/users/me');
      });
    });

    describe('when called with /users/456', () => {
      let result: unknown;

      beforeAll(() => {
        result = findRoute(rootNode, '/users/456');
      });

      it('should fall back to the wildcard match', () => {
        expect(result).toBe('/users/{userId}');
      });
    });
  });

  describe('having a node with no children', () => {
    let rootNode: RouterNode;

    beforeAll(() => {
      rootNode = {
        children: undefined,
        path: undefined,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = findRoute(rootNode, '/anything');
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a deeply nested path with params', () => {
    let rootNode: RouterNode;

    beforeAll(() => {
      rootNode = {
        children: {
          '': {
            children: {
              users: {
                children: {
                  [wildcardKey]: {
                    children: {
                      posts: {
                        children: {
                          [wildcardKey]: {
                            children: undefined,
                            path: '/users/{userId}/posts/{postId}',
                          },
                        },
                        path: undefined,
                      },
                    },
                    path: undefined,
                  },
                },
                path: undefined,
              },
            },
            path: undefined,
          },
        },
        path: undefined,
      };
    });

    describe('when called with a full matching path', () => {
      let result: unknown;

      beforeAll(() => {
        result = findRoute(rootNode, '/users/abc/posts/xyz');
      });

      it('should return the nested path', () => {
        expect(result).toBe('/users/{userId}/posts/{postId}');
      });
    });

    describe('when called with a partial path', () => {
      let result: unknown;

      beforeAll(() => {
        result = findRoute(rootNode, '/users/abc/posts');
      });

      it('should return undefined since partial path has no path', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
