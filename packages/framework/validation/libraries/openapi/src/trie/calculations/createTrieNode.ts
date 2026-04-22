import { type TrieNode } from '../models/TrieNode.js';

export function createTrieNode<T>(): TrieNode<T> {
  return {
    children: new Map(),
    value: undefined,
  };
}
