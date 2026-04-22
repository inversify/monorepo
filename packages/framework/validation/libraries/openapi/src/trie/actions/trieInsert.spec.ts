import { beforeAll, describe, expect, it } from 'vitest';

import { createTrieNode } from '../calculations/createTrieNode.js';
import { type TrieNode } from '../models/TrieNode.js';
import { trieInsert } from './trieInsert.js';

describe(trieInsert, () => {
  describe('having an empty trie', () => {
    describe('when called with a single-character key', () => {
      let root: TrieNode<string>;

      beforeAll(() => {
        root = createTrieNode();
        trieInsert(root, 'a', 'value-a');
      });

      it('should create a child node for the character', () => {
        expect(root.children.get('a'.charCodeAt(0))).toBeDefined();
      });

      it('should set the value on the terminal node', () => {
        expect(root.children.get('a'.charCodeAt(0))?.value).toBe('value-a');
      });

      it('should not set a value on the root', () => {
        expect(root.value).toBeUndefined();
      });
    });

    describe('when called with a multi-character key', () => {
      let root: TrieNode<string>;

      beforeAll(() => {
        root = createTrieNode();
        trieInsert(root, 'foo', 'bar');
      });

      it('should chain intermediate nodes for each character', () => {
        const fNode: TrieNode<string> | undefined = root.children.get(
          'f'.charCodeAt(0),
        );
        const foNode: TrieNode<string> | undefined = fNode?.children.get(
          'o'.charCodeAt(0),
        );
        const fooNode: TrieNode<string> | undefined = foNode?.children.get(
          'o'.charCodeAt(0),
        );

        expect(fooNode).toBeDefined();
        expect(fooNode?.value).toBe('bar');
      });

      it('should leave intermediate nodes without values', () => {
        const fNode: TrieNode<string> | undefined = root.children.get(
          'f'.charCodeAt(0),
        );
        const foNode: TrieNode<string> | undefined = fNode?.children.get(
          'o'.charCodeAt(0),
        );

        expect(fNode?.value).toBeUndefined();
        expect(foNode?.value).toBeUndefined();
      });
    });

    describe('when called with an empty key', () => {
      let root: TrieNode<string>;

      beforeAll(() => {
        root = createTrieNode();
        trieInsert(root, '', 'root-value');
      });

      it('should set the value on the root node', () => {
        expect(root.value).toBe('root-value');
      });
    });
  });

  describe('having a trie with an existing key', () => {
    describe('when called with the same key and a new value', () => {
      let root: TrieNode<string>;

      beforeAll(() => {
        root = createTrieNode();
        trieInsert(root, 'key', 'first');
        trieInsert(root, 'key', 'second');
      });

      it('should overwrite the existing value', () => {
        const kNode: TrieNode<string> | undefined = root.children.get(
          'k'.charCodeAt(0),
        );
        const keNode: TrieNode<string> | undefined = kNode?.children.get(
          'e'.charCodeAt(0),
        );
        const keyNode: TrieNode<string> | undefined = keNode?.children.get(
          'y'.charCodeAt(0),
        );

        expect(keyNode?.value).toBe('second');
      });
    });
  });

  describe('having a trie with a shared prefix', () => {
    describe('when called with two keys sharing a prefix', () => {
      let root: TrieNode<string>;

      beforeAll(() => {
        root = createTrieNode();
        trieInsert(root, 'foo', 'foo-value');
        trieInsert(root, 'foo/bar', 'foobar-value');
      });

      it('should preserve the first key value', () => {
        const fNode: TrieNode<string> | undefined = root.children.get(
          'f'.charCodeAt(0),
        );
        const foNode: TrieNode<string> | undefined = fNode?.children.get(
          'o'.charCodeAt(0),
        );
        const fooNode: TrieNode<string> | undefined = foNode?.children.get(
          'o'.charCodeAt(0),
        );

        expect(fooNode?.value).toBe('foo-value');
      });

      it('should set the second key value on its terminal node', () => {
        const fNode: TrieNode<string> | undefined = root.children.get(
          'f'.charCodeAt(0),
        );
        const foNode: TrieNode<string> | undefined = fNode?.children.get(
          'o'.charCodeAt(0),
        );
        const fooNode: TrieNode<string> | undefined = foNode?.children.get(
          'o'.charCodeAt(0),
        );
        const slashNode: TrieNode<string> | undefined = fooNode?.children.get(
          '/'.charCodeAt(0),
        );
        const bNode: TrieNode<string> | undefined = slashNode?.children.get(
          'b'.charCodeAt(0),
        );
        const baNode: TrieNode<string> | undefined = bNode?.children.get(
          'a'.charCodeAt(0),
        );
        const barNode: TrieNode<string> | undefined = baNode?.children.get(
          'r'.charCodeAt(0),
        );

        expect(barNode?.value).toBe('foobar-value');
      });
    });
  });
});
