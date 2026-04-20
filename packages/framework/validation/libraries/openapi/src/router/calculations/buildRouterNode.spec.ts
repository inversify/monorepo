import { beforeAll, describe, expect, it } from 'vitest';

import { type RouterNode } from '../models/RouterNode.js';
import { wildcardKey } from '../models/wildcardKey.js';
import { buildRouterNode } from './buildRouterNode.js';

describe(buildRouterNode, () => {
  describe('having an empty paths array', () => {
    describe('when called', () => {
      let result: RouterNode;

      beforeAll(() => {
        result = buildRouterNode([]);
      });

      it('should return a node with no children and no path', () => {
        expect(result).toStrictEqual({
          children: undefined,
          path: undefined,
        });
      });
    });
  });

  describe('having a single static path', () => {
    describe('when called', () => {
      let result: RouterNode;

      beforeAll(() => {
        result = buildRouterNode(['/users']);
      });

      it('should build a tree for the path', () => {
        const usersNode: RouterNode | undefined =
          result.children?.['']?.children?.['users'];

        expect(usersNode).toBeDefined();
        expect(usersNode?.path).toBe('/users');
      });
    });
  });

  describe('having a path with a param', () => {
    describe('when called', () => {
      let result: RouterNode;

      beforeAll(() => {
        result = buildRouterNode(['/users/{userId}']);
      });

      it('should build a tree with a wildcard node for the param', () => {
        const wildcardNode: RouterNode | undefined =
          result.children?.['']?.children?.['users']?.children?.[wildcardKey];

        expect(wildcardNode).toBeDefined();
        expect(wildcardNode?.path).toBe('/users/{userId}');
      });
    });
  });

  describe('having multiple paths with shared prefix', () => {
    describe('when called', () => {
      let result: RouterNode;

      beforeAll(() => {
        result = buildRouterNode(['/users', '/users/{userId}']);
      });

      it('should build a tree with shared prefix nodes', () => {
        const usersNode: RouterNode | undefined =
          result.children?.['']?.children?.['users'];

        expect(usersNode).toBeDefined();
        expect(usersNode?.path).toBe('/users');

        const wildcardNode: RouterNode | undefined =
          usersNode?.children?.[wildcardKey];

        expect(wildcardNode).toBeDefined();
        expect(wildcardNode?.path).toBe('/users/{userId}');
      });
    });
  });

  describe('having paths where first registered route takes priority on conflict', () => {
    describe('when called with /users/{userId} before /users/{id}', () => {
      let result: RouterNode;

      beforeAll(() => {
        result = buildRouterNode(['/users/{userId}', '/users/{id}']);
      });

      it('should use the first registered path for the wildcard node', () => {
        const wildcardNode: RouterNode | undefined =
          result.children?.['']?.children?.['users']?.children?.[wildcardKey];

        expect(wildcardNode).toBeDefined();
        expect(wildcardNode?.path).toBe('/users/{userId}');
      });
    });
  });

  describe('having a complex nested path', () => {
    describe('when called', () => {
      let result: RouterNode;

      beforeAll(() => {
        result = buildRouterNode(['/users/{userId}/posts/{postId}']);
      });

      it('should build a deeply nested tree', () => {
        const postsWildcardNode: RouterNode | undefined =
          result.children?.['']?.children?.['users']?.children?.[wildcardKey]
            ?.children?.['posts']?.children?.[wildcardKey];

        expect(postsWildcardNode).toBeDefined();
        expect(postsWildcardNode?.path).toBe('/users/{userId}/posts/{postId}');
      });
    });
  });

  describe('having a param path registered before a static path that competes', () => {
    describe('when called with /users/{userId} and /users/me', () => {
      let result: RouterNode;

      beforeAll(() => {
        result = buildRouterNode(['/users/{userId}', '/users/me']);
      });

      it('should have both static and wildcard children with first registered winning', () => {
        const usersNode: RouterNode | undefined =
          result.children?.['']?.children?.['users'];

        expect(usersNode).toBeDefined();
        expect(usersNode?.children?.['me']?.path).toBe('/users/{userId}');
        expect(usersNode?.children?.[wildcardKey]?.path).toBe(
          '/users/{userId}',
        );
      });
    });
  });

  describe('having a static path registered before a param path that competes', () => {
    describe('when called with /users/me and /users/{userId}', () => {
      let result: RouterNode;

      beforeAll(() => {
        result = buildRouterNode(['/users/me', '/users/{userId}']);
      });

      it('should have both static and wildcard children with first registered winning', () => {
        const usersNode: RouterNode | undefined =
          result.children?.['']?.children?.['users'];

        expect(usersNode).toBeDefined();
        expect(usersNode?.children?.['me']?.path).toBe('/users/me');
        expect(usersNode?.children?.[wildcardKey]?.path).toBe(
          '/users/{userId}',
        );
      });
    });
  });
});
