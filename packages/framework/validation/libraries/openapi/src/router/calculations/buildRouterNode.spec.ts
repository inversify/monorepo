import { beforeAll, describe, expect, it } from 'vitest';

import { trieLookup } from '../../trie/calculations/trieLookup.js';
import { type RouterNode } from '../models/RouterNode.js';
import { RouterNodeMatchKind } from '../models/RouterNodeMatchKind.js';
import {
  type RouterNodeParamMatch,
  type RouterNodeParamMatchRoute,
} from '../models/RouterNodeParamMatch.js';
import { buildRouterNode } from './buildRouterNode.js';

describe(buildRouterNode, () => {
  describe('having an empty paths array', () => {
    describe('when called', () => {
      let result: RouterNode;

      beforeAll(() => {
        result = buildRouterNode([]);
      });

      it('should return an empty router node', () => {
        expect(result.match).toBeUndefined();
        expect(result.nextLiterals.children.size).toBe(0);
        expect(result.nextLiterals.value).toBeUndefined();
        expect(result.nextParam).toBeUndefined();
      });
    });
  });

  describe('having a single static path', () => {
    describe('when called', () => {
      let result: RouterNode;

      beforeAll(() => {
        result = buildRouterNode(['/users']);
      });

      it('should build a literal match at the terminal node', () => {
        const leadingEmpty: RouterNode | undefined = trieLookup(
          result.nextLiterals,
          '',
          0,
          0,
        );
        const usersNode: RouterNode | undefined =
          leadingEmpty !== undefined
            ? trieLookup(leadingEmpty.nextLiterals, 'users', 0, 5)
            : undefined;

        expect(usersNode).toBeDefined();
        expect(usersNode?.match).toStrictEqual({
          kind: RouterNodeMatchKind.literal,
          route: '/users',
        });
        expect(usersNode?.nextLiterals.children.size).toBe(0);
        expect(usersNode?.nextParam).toBeUndefined();
      });
    });
  });

  describe('having a single path with a param', () => {
    describe('when called', () => {
      let result: RouterNode;

      beforeAll(() => {
        result = buildRouterNode(['/users/{userId}']);
      });

      it('should build a param match under a nextParam node', () => {
        const leadingEmpty: RouterNode | undefined = trieLookup(
          result.nextLiterals,
          '',
          0,
          0,
        );
        const usersNode: RouterNode | undefined =
          leadingEmpty !== undefined
            ? trieLookup(leadingEmpty.nextLiterals, 'users', 0, 5)
            : undefined;
        const paramNode: RouterNode | undefined = usersNode?.nextParam;

        expect(paramNode).toBeDefined();
        expect(paramNode?.match?.kind).toBe(RouterNodeMatchKind.param);

        const paramMatch: RouterNodeParamMatch =
          paramNode?.match as RouterNodeParamMatch;

        expect(paramMatch.routes).toHaveLength(1);
        expect(paramMatch.routes[0]?.route).toBe('/users/{userId}');
        expect(paramMatch.routes[0]?.constraints).toHaveLength(1);
      });
    });
  });

  describe('having multiple sibling static paths', () => {
    describe('when called', () => {
      let result: RouterNode;

      beforeAll(() => {
        result = buildRouterNode(['/users', '/posts']);
      });

      it('should build literal nodes for each path', () => {
        const leadingEmpty: RouterNode | undefined = trieLookup(
          result.nextLiterals,
          '',
          0,
          0,
        );

        const usersNode: RouterNode | undefined =
          leadingEmpty !== undefined
            ? trieLookup(leadingEmpty.nextLiterals, 'users', 0, 5)
            : undefined;
        const postsNode: RouterNode | undefined =
          leadingEmpty !== undefined
            ? trieLookup(leadingEmpty.nextLiterals, 'posts', 0, 5)
            : undefined;

        expect(usersNode?.match).toStrictEqual({
          kind: RouterNodeMatchKind.literal,
          route: '/users',
        });
        expect(postsNode?.match).toStrictEqual({
          kind: RouterNodeMatchKind.literal,
          route: '/posts',
        });
      });
    });
  });

  describe('having a shared prefix with a literal and a param branch', () => {
    describe('when called', () => {
      let result: RouterNode;

      beforeAll(() => {
        result = buildRouterNode(['/users/me', '/users/{userId}']);
      });

      it('should expose both the literal child and the nextParam child', () => {
        const leadingEmpty: RouterNode | undefined = trieLookup(
          result.nextLiterals,
          '',
          0,
          0,
        );
        const usersNode: RouterNode | undefined =
          leadingEmpty !== undefined
            ? trieLookup(leadingEmpty.nextLiterals, 'users', 0, 5)
            : undefined;

        const meNode: RouterNode | undefined =
          usersNode !== undefined
            ? trieLookup(usersNode.nextLiterals, 'me', 0, 2)
            : undefined;

        expect(meNode?.match).toStrictEqual({
          kind: RouterNodeMatchKind.literal,
          route: '/users/me',
        });

        const paramNode: RouterNode | undefined = usersNode?.nextParam;

        expect(paramNode?.match?.kind).toBe(RouterNodeMatchKind.param);

        const paramMatch: RouterNodeParamMatch =
          paramNode?.match as RouterNodeParamMatch;

        expect(paramMatch.routes[0]?.route).toBe('/users/{userId}');
      });
    });
  });

  describe('having a literal sibling that also matches the param regex', () => {
    describe('when called', () => {
      let result: RouterNode;

      beforeAll(() => {
        result = buildRouterNode(['/users/admin/settings', '/users/{userId}']);
      });

      it('should set the param match as a fallback on the literal branch', () => {
        const leadingEmpty: RouterNode | undefined = trieLookup(
          result.nextLiterals,
          '',
          0,
          0,
        );
        const usersNode: RouterNode | undefined =
          leadingEmpty !== undefined
            ? trieLookup(leadingEmpty.nextLiterals, 'users', 0, 5)
            : undefined;
        const adminNode: RouterNode | undefined =
          usersNode !== undefined
            ? trieLookup(usersNode.nextLiterals, 'admin', 0, 5)
            : undefined;

        // `/users/admin` is not itself a registered route, but it should
        // match `/users/{userId}` — so the admin node needs a param match.
        expect(adminNode?.match?.kind).toBe(RouterNodeMatchKind.param);

        const adminMatch: RouterNodeParamMatch =
          adminNode?.match as RouterNodeParamMatch;

        expect(adminMatch.routes[0]?.route).toBe('/users/{userId}');

        const settingsNode: RouterNode | undefined =
          adminNode !== undefined
            ? trieLookup(adminNode.nextLiterals, 'settings', 0, 8)
            : undefined;

        expect(settingsNode?.match).toStrictEqual({
          kind: RouterNodeMatchKind.literal,
          route: '/users/admin/settings',
        });
      });
    });
  });

  describe('having a deeply nested path with multiple params', () => {
    describe('when called', () => {
      let result: RouterNode;

      beforeAll(() => {
        result = buildRouterNode(['/users/{userId}/posts/{postId}']);
      });

      it('should build the expected nextParam chain', () => {
        const leadingEmpty: RouterNode | undefined = trieLookup(
          result.nextLiterals,
          '',
          0,
          0,
        );
        const usersNode: RouterNode | undefined =
          leadingEmpty !== undefined
            ? trieLookup(leadingEmpty.nextLiterals, 'users', 0, 5)
            : undefined;
        const userIdNode: RouterNode | undefined = usersNode?.nextParam;
        const postsNode: RouterNode | undefined =
          userIdNode !== undefined
            ? trieLookup(userIdNode.nextLiterals, 'posts', 0, 5)
            : undefined;
        const postIdNode: RouterNode | undefined = postsNode?.nextParam;

        expect(postIdNode?.match?.kind).toBe(RouterNodeMatchKind.param);

        const [route]: RouterNodeParamMatchRoute[] = (
          postIdNode?.match as RouterNodeParamMatch
        ).routes;

        expect(route?.route).toBe('/users/{userId}/posts/{postId}');
        expect(route?.constraints).toHaveLength(2);
      });
    });
  });

  describe('having a segment with more than one param', () => {
    describe('when called', () => {
      let result: RouterNode;

      beforeAll(() => {
        result = buildRouterNode(['/files/{name}.{ext}']);
      });

      it('should attach a param route with a single constraint at the param segment', () => {
        const leadingEmpty: RouterNode | undefined = trieLookup(
          result.nextLiterals,
          '',
          0,
          0,
        );
        const filesNode: RouterNode | undefined =
          leadingEmpty !== undefined
            ? trieLookup(leadingEmpty.nextLiterals, 'files', 0, 5)
            : undefined;
        const paramNode: RouterNode | undefined = filesNode?.nextParam;

        expect(paramNode?.match?.kind).toBe(RouterNodeMatchKind.param);

        const paramMatch: RouterNodeParamMatch =
          paramNode?.match as RouterNodeParamMatch;
        const [route]: RouterNodeParamMatchRoute[] = paramMatch.routes;

        expect(route?.route).toBe('/files/{name}.{ext}');
        expect(route?.constraints).toHaveLength(1);
      });
    });
  });

  describe('having a path where the segment literal suffix contains a special regex character', () => {
    describe('when called', () => {
      let result: RouterNode;

      beforeAll(() => {
        result = buildRouterNode(['/{param}+']);
      });

      it('should build a param route whose constraint matches a value ending with a literal "+" but not without it', () => {
        const leadingEmpty: RouterNode | undefined = trieLookup(
          result.nextLiterals,
          '',
          0,
          0,
        );
        const paramNode: RouterNode | undefined = leadingEmpty?.nextParam;

        expect(paramNode?.match?.kind).toBe(RouterNodeMatchKind.param);

        const paramMatch: RouterNodeParamMatch =
          paramNode?.match as RouterNodeParamMatch;
        const [route]: RouterNodeParamMatchRoute[] = paramMatch.routes;

        expect(route?.constraints).toHaveLength(1);

        const constraintEntry: [number, RegExp] = (
          route?.constraints as [number, RegExp][]
        )[0] as [number, RegExp];
        const constraint: RegExp = constraintEntry[1];

        expect(constraint.test('abc+')).toBe(true);
        expect(constraint.test('abc')).toBe(false);
      });
    });
  });

  describe('having two param paths that converge at the same node', () => {
    describe('when called with /files/{name} and /files/{name}.{ext}', () => {
      let result: RouterNode;

      beforeAll(() => {
        result = buildRouterNode(['/files/{name}', '/files/{name}.{ext}']);
      });

      it('should aggregate both routes on the same param match', () => {
        const leadingEmpty: RouterNode | undefined = trieLookup(
          result.nextLiterals,
          '',
          0,
          0,
        );
        const filesNode: RouterNode | undefined =
          leadingEmpty !== undefined
            ? trieLookup(leadingEmpty.nextLiterals, 'files', 0, 5)
            : undefined;
        const paramNode: RouterNode | undefined = filesNode?.nextParam;

        expect(paramNode?.match?.kind).toBe(RouterNodeMatchKind.param);

        const paramMatch: RouterNodeParamMatch =
          paramNode?.match as RouterNodeParamMatch;
        const routes: readonly string[] = paramMatch.routes.map(
          ({ route }: RouterNodeParamMatchRoute) => route,
        );

        expect(routes).toStrictEqual(
          expect.arrayContaining(['/files/{name}', '/files/{name}.{ext}']),
        );
      });
    });
  });

  describe('having the same path registered twice', () => {
    describe('when called', () => {
      let result: RouterNode;

      beforeAll(() => {
        result = buildRouterNode(['/users', '/users']);
      });

      it('should keep a single literal match', () => {
        const leadingEmpty: RouterNode | undefined = trieLookup(
          result.nextLiterals,
          '',
          0,
          0,
        );
        const usersNode: RouterNode | undefined =
          leadingEmpty !== undefined
            ? trieLookup(leadingEmpty.nextLiterals, 'users', 0, 5)
            : undefined;

        expect(usersNode?.match).toStrictEqual({
          kind: RouterNodeMatchKind.literal,
          route: '/users',
        });
      });
    });
  });
});
