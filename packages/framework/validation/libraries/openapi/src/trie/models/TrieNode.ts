/**
 * Represents a node in a trie data structure.
 * Children are indexed by character codes for O(1) lookup without string allocation.
 */
export interface TrieNode<T> {
  children: Map<number, TrieNode<T>>;
  value: T | undefined;
}
