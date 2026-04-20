/**
 * RouterNode represents a node in the path tree used for OpenAPI
 * path matching. Each node can have children nodes corresponding to
 * the next segment in the path, and it may also store the full path
 * if it represents a complete path in the OpenAPI specification.
 *
 * Children nodes are stored in a record where the key is either a
 * path segment or a wildcard symbol (for path parameters). The value
 * is another RouterNode representing the next level in the path
 * hierarchy.
 *
 * This way, we can efficiently match incoming request paths against
 * the OpenAPI paths, including handling path parameters.
 *
 * For example, for the OpenAPI paths:
 * - /users/{userId}
 * - /users/{userId}/posts
 * - /users/{userId}/posts/{postId}
 *
 * The pathfinder tree would have a root node with a child for "users",
 * which in turn has a child for the wildcard key (representing
 * "{userId}"), which then has a child for "posts", and so on.
 *
 * Given a request path like "/users/123/posts/456", we can traverse the
 * tree by matching "users" to the first child, then matching "123" to
 * the wildcard key, then matching "posts" to the next child, and
 * finally matching "456" to the wildcard key at the end.
 *
 * Basically, the traverse algorithm is as follows:
 *
 * 1. Start at the root node with the full path segments.
 * 2. For each segment in the path, check if there is a matching child
 *    node.
 * 3. If a matching child node is found, move to that node and continue
 *    with the next segment.
 * 4. If no matching child node is found, check for a wildcard child node
 *    and move to it if available.
 * 5. Repeat steps 2-4 until all segments are processed or no matching
 *    node is found.
 * 6. If all segments are processed and a node with a path is found, the
 *    path is matched.
 *
 * Further optimizations can be made to avoid unnecessary string slice
 * operations, but so far it is good enough for our use case.
 */
export interface RouterNode {
  children: Record<string | symbol, RouterNode> | undefined;
  path: string | undefined;
}
