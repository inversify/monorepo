---
"@inversifyjs/core": patch
---

Fix `injectFromHierarchy` to ignore Object in prototype traversal, preventing missing metadata errors when extending undecorated Object.
