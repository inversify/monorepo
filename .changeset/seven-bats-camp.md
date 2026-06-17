---
"@inversifyjs/core": major
---

- Added `FactoryBindingNode` interface.
- Added `ResolvableBindingNode` interface.
- Updated non service redirection binding nodes with a `resolve` method.
- `resolve` performance on transient scoped services has been improved by caching the resolved value in the binding node and simplifying the core logic. Benchmarks show around 20% performance improvement on transient services with deep dependency graphs.
