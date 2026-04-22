import { beforeAll, describe, expect, it } from 'vitest';

import { trieInsert } from '../actions/trieInsert.js';
import { type TrieNode } from '../models/TrieNode.js';
import { createTrieNode } from './createTrieNode.js';
import { trieIterateEntries } from './trieIterateEntries.js';

describe(trieIterateEntries, () => {
  describe('having an empty trie', () => {
    describe('when called', () => {
      let result: [string, string][];

      beforeAll(() => {
        result = [...trieIterateEntries<string>(createTrieNode())];
      });

      it('should yield no entries', () => {
        expect(result).toStrictEqual([]);
      });
    });
  });

  describe('having a trie with a single entry', () => {
    describe('when called', () => {
      let result: [string, string][];

      beforeAll(() => {
        const root: TrieNode<string> = createTrieNode<string>();
        trieInsert(root, 'foo', 'foo-value');

        result = [...trieIterateEntries(root)];
      });

      it('should yield the single entry', () => {
        expect(result).toStrictEqual([['foo', 'foo-value']]);
      });
    });
  });

  describe('having a trie with multiple entries', () => {
    describe('when called', () => {
      let result: [string, string][];

      beforeAll(() => {
        const root: TrieNode<string> = createTrieNode<string>();
        trieInsert(root, 'a', 'value-a');
        trieInsert(root, 'b', 'value-b');
        trieInsert(root, 'ab', 'value-ab');

        result = [...trieIterateEntries(root)];
      });

      it('should yield all entries', () => {
        expect(result).toHaveLength(3);
        expect(result).toStrictEqual(
          expect.arrayContaining([
            ['a', 'value-a'],
            ['b', 'value-b'],
            ['ab', 'value-ab'],
          ]),
        );
      });
    });
  });

  describe('having a trie with an empty-string entry', () => {
    describe('when called', () => {
      let result: [string, string][];

      beforeAll(() => {
        const root: TrieNode<string> = createTrieNode<string>();
        trieInsert(root, '', 'root-value');
        trieInsert(root, 'x', 'x-value');

        result = [...trieIterateEntries(root)];
      });

      it('should yield the empty-string entry and the other entry', () => {
        expect(result).toHaveLength(2);
        expect(result).toStrictEqual(
          expect.arrayContaining([
            ['', 'root-value'],
            ['x', 'x-value'],
          ]),
        );
      });
    });
  });

  describe('having a trie with a custom prefix argument', () => {
    describe('when called with a non-empty prefix', () => {
      let result: [string, string][];

      beforeAll(() => {
        const root: TrieNode<string> = createTrieNode<string>();
        trieInsert(root, 'bar', 'bar-value');

        result = [...trieIterateEntries(root, 'foo/')];
      });

      it('should prepend the prefix to every yielded key', () => {
        expect(result).toStrictEqual([['foo/bar', 'bar-value']]);
      });
    });
  });
});
