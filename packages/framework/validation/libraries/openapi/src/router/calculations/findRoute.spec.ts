import { beforeAll, describe, expect, it } from 'vitest';

import { trieInsert } from '../../trie/actions/trieInsert.js';
import { createTrieNode } from '../../trie/calculations/createTrieNode.js';
import { type RouterNode } from '../models/RouterNode.js';
import { RouterNodeMatchKind } from '../models/RouterNodeMatchKind.js';
import { findRoute } from './findRoute.js';

describe(findRoute, () => {
  describe('having a simple static tree', () => {
    let rootNode: RouterNode;

    beforeAll(() => {
      const usersNode: RouterNode = {
        match: { kind: RouterNodeMatchKind.literal, route: '/users' },
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };

      const emptySegmentNode: RouterNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };
      trieInsert(emptySegmentNode.nextLiterals, 'users', usersNode);

      rootNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };
      trieInsert(rootNode.nextLiterals, '', emptySegmentNode);
    });

    describe('when called with a matching path', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = findRoute(rootNode, '/users');
      });

      it('should return the matched path', () => {
        expect(result).toBe('/users');
      });
    });

    describe('when called with a non-matching path', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = findRoute(rootNode, '/posts');
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called with a prefix-only path', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = findRoute(rootNode, '/use');
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called with a path longer than the tree', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = findRoute(rootNode, '/users/extra');
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a tree with a param node', () => {
    let rootNode: RouterNode;

    beforeAll(() => {
      const userIdParamNode: RouterNode = {
        match: {
          kind: RouterNodeMatchKind.param,
          routes: [{ constraints: [[2, /.+/]], route: '/users/{userId}' }],
        },
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };

      const usersNode: RouterNode = {
        match: { kind: RouterNodeMatchKind.literal, route: '/users' },
        nextLiterals: createTrieNode(),
        nextParam: userIdParamNode,
      };

      const emptySegmentNode: RouterNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };
      trieInsert(emptySegmentNode.nextLiterals, 'users', usersNode);

      rootNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };
      trieInsert(rootNode.nextLiterals, '', emptySegmentNode);
    });

    describe('when called with a path that matches the param', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = findRoute(rootNode, '/users/123');
      });

      it('should return the param route', () => {
        expect(result).toBe('/users/{userId}');
      });
    });

    describe('when called with the literal path', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = findRoute(rootNode, '/users');
      });

      it('should return the literal route', () => {
        expect(result).toBe('/users');
      });
    });
  });

  describe('having literal and param at the same level', () => {
    let rootNode: RouterNode;

    beforeAll(() => {
      const userIdParamNode: RouterNode = {
        match: {
          kind: RouterNodeMatchKind.param,
          routes: [{ constraints: [[2, /.+/]], route: '/users/{userId}' }],
        },
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };

      const meNode: RouterNode = {
        match: { kind: RouterNodeMatchKind.literal, route: '/users/me' },
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };

      const usersNode: RouterNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: userIdParamNode,
      };
      trieInsert(usersNode.nextLiterals, 'me', meNode);

      const emptySegmentNode: RouterNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };
      trieInsert(emptySegmentNode.nextLiterals, 'users', usersNode);

      rootNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };
      trieInsert(rootNode.nextLiterals, '', emptySegmentNode);
    });

    describe('when called with /users/me', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = findRoute(rootNode, '/users/me');
      });

      it('should prefer the literal match over the param', () => {
        expect(result).toBe('/users/me');
      });
    });

    describe('when called with /users/456', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = findRoute(rootNode, '/users/456');
      });

      it('should fall back to the param match', () => {
        expect(result).toBe('/users/{userId}');
      });
    });
  });

  describe('having a param route with a rejecting constraint', () => {
    let rootNode: RouterNode;

    beforeAll(() => {
      const idParamNode: RouterNode = {
        match: {
          kind: RouterNodeMatchKind.param,
          routes: [{ constraints: [[2, /^\d+$/]], route: '/items/{id}' }],
        },
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };

      const itemsNode: RouterNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: idParamNode,
      };

      const emptySegmentNode: RouterNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };
      trieInsert(emptySegmentNode.nextLiterals, 'items', itemsNode);

      rootNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };
      trieInsert(rootNode.nextLiterals, '', emptySegmentNode);
    });

    describe('when called with a segment that satisfies the constraint', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = findRoute(rootNode, '/items/42');
      });

      it('should return the route', () => {
        expect(result).toBe('/items/{id}');
      });
    });

    describe('when called with a segment that fails the constraint', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = findRoute(rootNode, '/items/abc');
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having multiple param routes at the same node', () => {
    let rootNode: RouterNode;

    beforeAll(() => {
      const nameParamNode: RouterNode = {
        match: {
          kind: RouterNodeMatchKind.param,
          routes: [
            {
              constraints: [[2, /^.+\..+$/]],
              route: '/files/{name}.{ext}',
            },
            { constraints: [[2, /^.+$/]], route: '/files/{name}' },
          ],
        },
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };

      const filesNode: RouterNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: nameParamNode,
      };

      const emptySegmentNode: RouterNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };
      trieInsert(emptySegmentNode.nextLiterals, 'files', filesNode);

      rootNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };
      trieInsert(rootNode.nextLiterals, '', emptySegmentNode);
    });

    describe('when the first route constraint matches', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = findRoute(rootNode, '/files/report.pdf');
      });

      it('should return the first matching route', () => {
        expect(result).toBe('/files/{name}.{ext}');
      });
    });

    describe('when only the second route constraint matches', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = findRoute(rootNode, '/files/report');
      });

      it('should return the second matching route', () => {
        expect(result).toBe('/files/{name}');
      });
    });
  });

  describe('having a deeply nested path with multiple params', () => {
    let rootNode: RouterNode;

    beforeAll(() => {
      const postIdParamNode: RouterNode = {
        match: {
          kind: RouterNodeMatchKind.param,
          routes: [
            {
              constraints: [
                [2, /^\d+$/],
                [4, /^\d+$/],
              ],
              route: '/users/{userId}/posts/{postId}',
            },
          ],
        },
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };

      const postsNode: RouterNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: postIdParamNode,
      };

      const userIdParamNode: RouterNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };
      trieInsert(userIdParamNode.nextLiterals, 'posts', postsNode);

      const usersNode: RouterNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: userIdParamNode,
      };

      const emptySegmentNode: RouterNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };
      trieInsert(emptySegmentNode.nextLiterals, 'users', usersNode);

      rootNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };
      trieInsert(rootNode.nextLiterals, '', emptySegmentNode);
    });

    describe('when all params satisfy their constraints', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = findRoute(rootNode, '/users/1/posts/2');
      });

      it('should return the nested route', () => {
        expect(result).toBe('/users/{userId}/posts/{postId}');
      });
    });

    describe('when the last param does not satisfy its constraint', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = findRoute(rootNode, '/users/1/posts/xyz');
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when the first param does not satisfy its constraint', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = findRoute(rootNode, '/users/abc/posts/2');
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called with a partial path', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = findRoute(rootNode, '/users/1/posts');
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having an empty node', () => {
    let rootNode: RouterNode;

    beforeAll(() => {
      rootNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };
    });

    describe('when called', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = findRoute(rootNode, '/anything');
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a node whose match is undefined at the terminal segment', () => {
    let rootNode: RouterNode;

    beforeAll(() => {
      const usersNode: RouterNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };

      const emptySegmentNode: RouterNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };
      trieInsert(emptySegmentNode.nextLiterals, 'users', usersNode);

      rootNode = {
        match: undefined,
        nextLiterals: createTrieNode(),
        nextParam: undefined,
      };
      trieInsert(rootNode.nextLiterals, '', emptySegmentNode);
    });

    describe('when called', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = findRoute(rootNode, '/users');
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
