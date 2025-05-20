---
'@inversifyjs/container': minor
'@inversifyjs/core': minor
---

Added `Container#dispose` method to clean up memory from child containers

Child containers subscribe their plan cache to the parent container for cache invalidation.
This would leak memory as the child plan cache would never be unsubscribed, growing the memory usage of the parent container with each new child container instantiation.

The `Container#dispose` method should be called on child containers once they are no longer in use to free this memory.
