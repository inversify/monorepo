---
"@inversifyjs/framework-core": minor
"@inversifyjs/http-core": minor
---

- Added `@Discriminated` decorator and `DiscriminatedError` interface for discriminated error filter matching.
- Added `getErrorDiscriminatorMetadata` calculation.
- Updated `getErrorFilterForError` and `setErrorFilterToErrorFilterMap` to support discriminator-based error lookup.
