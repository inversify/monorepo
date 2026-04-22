import { createTrieNode } from '../calculations/createTrieNode.js';
import { type TrieNode } from '../models/TrieNode.js';

/**
 * Inserts a key-value pair into the trie rooted at `node`.
 * Overwrites any existing value at that key.
 */
export function trieInsert<T>(node: TrieNode<T>, key: string, value: T): void {
  let current: TrieNode<T> = node;

  for (let i: number = 0; i < key.length; i++) {
    const charCode: number = key.charCodeAt(i);
    let child: TrieNode<T> | undefined = current.children.get(charCode);

    if (child === undefined) {
      child = createTrieNode<T>();
      current.children.set(charCode, child);
    }

    current = child;
  }

  current.value = value;
}
