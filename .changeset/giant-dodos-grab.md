---
"@inversifyjs/core": major
---

- Added `ConstructorNoParamNode`.
- Updated `InstanceBindingNode.constructorParams` to rely on `ConstructorNoParamNode` instead of `undefined` to represent constructor parameters that have no injections.
