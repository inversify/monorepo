---
"@inversifyjs/core": patch
---

Fixed child container memory leak in most cases

Provided that there is a [job](https://tc39.es/ecma262/multipage/executable-code-and-execution-contexts.html#job) in the event loop after constructing a child container, its cache service will eventually be garbage collected along with the child container itself, rather than persisting until the parent container's garbage collection.
