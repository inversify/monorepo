import { type TrieNode } from '../models/TrieNode.js';

/**
 * Looks up a value in the trie by matching `str` from index `start` (inclusive)
 * to `end` (exclusive). Uses character codes internally to avoid string allocation
 * during traversal, keeping the hot path GC-friendly.
 */
export function trieLookup<T>(
  node: TrieNode<T>,
  str: string,
  start: number,
  end: number,
): T | undefined {
  let current: TrieNode<T> = node;

  for (let i: number = start; i < end; i++) {
    const child: TrieNode<T> | undefined = current.children.get(
      str.charCodeAt(i),
    );

    if (child === undefined) {
      return undefined;
    }

    current = child;
  }

  return current.value;
}
