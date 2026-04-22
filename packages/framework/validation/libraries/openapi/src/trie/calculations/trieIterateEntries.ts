import { type TrieNode } from '../models/TrieNode.js';

/**
 * Yields all [key, value] pairs stored in the trie rooted at `node`.
 * Intended for build-time iteration; not performance-critical.
 */
export function* trieIterateEntries<T>(
  node: TrieNode<T>,
  prefix: string = '',
): Generator<[string, T]> {
  if (node.value !== undefined) {
    yield [prefix, node.value];
  }

  for (const [charCode, child] of node.children) {
    yield* trieIterateEntries(child, prefix + String.fromCharCode(charCode));
  }
}
