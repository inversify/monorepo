---
"@inversifyjs/strongly-typed": major
---

- Migrated to inversify v8. Updated peer dependency from `^7.11.0` to `^8.0.0`.
- Adopted sync-first naming convention: `rebind` is now sync (was async), `rebindAsync` is the async variant (was `rebind`). Same for `unbind`/`unbindAsync` and `load`/`loadAsync`.
- Removed `rebindSync`, `unbindSync`, and `loadSync` methods (sync is now the default).
- Updated `TypedContainerModuleLoadOptions` to match v8 `ContainerModuleLoadOptions`.
- Replaced `Function` fallback in `ContainerBinding` type with `abstract new (...args: any[]) => infer C` to match v8 `ServiceIdentifier` constraints.
