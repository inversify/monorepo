import { type TrieNode } from '../../trie/models/TrieNode.js';
import { type RouterNodeMatch } from './RouterNodeMatch.js';

/**
 * Represents a node in the router tree.
 * A param can now include multiple param based routes with different constraints,
 * supporting routes with multiple parameters at the same segment.
 */
export interface RouterNode {
  match: RouterNodeMatch | undefined;
  nextLiterals: TrieNode<RouterNode>;
  nextParam: RouterNode | undefined;
}
