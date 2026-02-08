---
"@inversifyjs/common": major
"inversify": major
---

- Updated `ServiceIdentifier` type. Now, a `Function` is a valid `ServiceIdentifier<T>` if and only if it satisfies `AbstractNewable<T> | Newable<T>`
