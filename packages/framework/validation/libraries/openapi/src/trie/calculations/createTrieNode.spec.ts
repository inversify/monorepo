import { beforeAll, describe, expect, it } from 'vitest';

import { type TrieNode } from '../models/TrieNode.js';
import { createTrieNode } from './createTrieNode.js';

describe(createTrieNode, () => {
  describe('when called', () => {
    let result: TrieNode<unknown>;

    beforeAll(() => {
      result = createTrieNode();
    });

    it('should return a node with an empty children map', () => {
      expect(result.children).toBeInstanceOf(Map);
      expect(result.children.size).toBe(0);
    });

    it('should return a node with an undefined value', () => {
      expect(result.value).toBeUndefined();
    });
  });
});
