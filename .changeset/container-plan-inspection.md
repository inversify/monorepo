---
"@inversifyjs/core": minor
"@inversifyjs/container": minor
"inversify": minor
---

- Added `Container.inspectCurrentPlan`. It returns a snapshot of the plan the container would use for a `get` or `getAll` request, without resolving any service. The snapshot describes the request constraints, the selected bindings and their planned dependencies.
- Added `PlanInspection`, `PlanServiceInspection` and `PlanBindingInspection` types.
