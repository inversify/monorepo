import { beforeAll, describe, expect, it } from 'vitest';

import { trieInsert } from '../actions/trieInsert.js';
import { createTrieNode } from './createTrieNode.js';
import { trieLookup } from './trieLookup.js';

describe(trieLookup, () => {
  describe('having an empty trie', () => {
    describe('when called with any range', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = trieLookup(createTrieNode<string>(), 'anything', 0, 8);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a trie with a single entry', () => {
    let root: ReturnType<typeof createTrieNode<string>>;

    beforeAll(() => {
      root = createTrieNode<string>();
      trieInsert(root, 'users', 'users-value');
    });

    describe('when called with a matching full-string range', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = trieLookup(root, 'users', 0, 5);
      });

      it('should return the stored value', () => {
        expect(result).toBe('users-value');
      });
    });

    describe('when called with a matching sub-range inside a longer string', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = trieLookup(root, '/users/123', 1, 6);
      });

      it('should return the stored value', () => {
        expect(result).toBe('users-value');
      });
    });

    describe('when called with a non-matching key', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = trieLookup(root, 'posts', 0, 5);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called with a range that is only a prefix of a stored key', () => {
      let result: string | undefined;

      beforeAll(() => {
        // 'use' is a prefix of 'users' but not a stored key
        result = trieLookup(root, 'users', 0, 3);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called with a range longer than the stored key', () => {
      let result: string | undefined;

      beforeAll(() => {
        // 'usersx' is longer than 'users'
        result = trieLookup(root, 'usersx', 0, 6);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a trie with multiple entries sharing a prefix', () => {
    let root: ReturnType<typeof createTrieNode<string>>;

    beforeAll(() => {
      root = createTrieNode<string>();
      trieInsert(root, 'users', 'users-value');
      trieInsert(root, 'posts', 'posts-value');
      trieInsert(root, 'users/me', 'users-me-value');
    });

    describe('when called with the first key', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = trieLookup(root, 'users', 0, 5);
      });

      it('should return the first value', () => {
        expect(result).toBe('users-value');
      });
    });

    describe('when called with the second key', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = trieLookup(root, 'posts', 0, 5);
      });

      it('should return the second value', () => {
        expect(result).toBe('posts-value');
      });
    });

    describe('when called with the third key', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = trieLookup(root, 'users/me', 0, 8);
      });

      it('should return the third value', () => {
        expect(result).toBe('users-me-value');
      });
    });
  });

  describe('having a trie with an empty-string entry', () => {
    let root: ReturnType<typeof createTrieNode<string>>;

    beforeAll(() => {
      root = createTrieNode<string>();
      trieInsert(root, '', 'empty-value');
    });

    describe('when called with a zero-length range', () => {
      let result: string | undefined;

      beforeAll(() => {
        result = trieLookup(root, 'anything', 0, 0);
      });

      it('should return the value stored at the empty key', () => {
        expect(result).toBe('empty-value');
      });
    });
  });
});
