---
"@inversifyjs/framework-core": minor
"@inversifyjs/http-core": minor
---

- Added the `@Discriminated` decorator for discriminator-based error filter matching.
- Re-exported `Discriminated` from `@inversifyjs/http-core`.
- Added `getErrorDiscriminatorMetadata` calculation that reads own discriminator metadata only.
- Updated `getErrorFilterForError` and `setErrorFilterToErrorFilterMap` to support discriminator-based error lookup, checking each constructor level's own discriminators before its type filter so more specific handlers win.
