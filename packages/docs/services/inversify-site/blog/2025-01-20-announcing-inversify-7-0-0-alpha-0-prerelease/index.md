---
slug: announcing-inversify-7-0-0-alpha-0-prerelease
title: Announcing 7.0.0-alpha.0
authors: [notaphplover]
tags: [releases]
---

It's been a while since the last time `inversify` released a major version. Some exciting changes are on their way, and we are announcing them in a prerelease so you can participate and [discuss](https://github.com/inversify/InversifyJS/discussions/1712) them before it's finally released.

{/* truncate */}

Feel free to check out the [next version docs](/docs/next/introduction/getting-started).

## Notable changes

### Injection inheritance

Previous versions of inversify provided implicit injection inheritance. However, this approach was deprecated in favor of the `@injectFromBase` decorator. This decorator allows you to inject dependencies from the base class.

Refer to the [inheritance docs](/docs/next/fundamentals/inheritance) for more information.

### Factory-like bindings

`Factory`, `Provider`, and `DynamicValue` bindings now receive a `ResolutionContext`. Refer to the [API docs](/docs/next/api/binding-syntax#tofactory) for more information.

#### Motivation

Previous `Context` and `Request` exposed objects provided internal data which should never be accessed by users. `ResolutionContext` allows resolving services in the same way `Context.container` previously allowed.

### Binding constraints

Some methods have been renamed. No `context` is passed to the constraint in favor of a `BindingConstraints` parameter.

#### Motivation

Previous `Context` and `Request` exposed objects provided internal data which should never be accessed by users. In this specific case, binding constraints are invoked in the planning phase. No resolution-related APIs should be exposed whatsoever, just the metadata used to compute binding constraints such as names, tags, and service IDs in the planning nodes.

### Binding activations

Binding activations now receive a `ResolutionContext`. Refer to the [API docs](/docs/next/api/binding-syntax#onactivation) for more information.

#### Motivation

Previous `Context` and `Request` exposed objects provided internal data which should never be accessed by users. `ResolutionContext` allows resolving services in the same way `Context.container` previously allowed.

## Incoming changes

Some additional changes will be shipped in the `inversify@7` release.

### Performance optimizations

With these binding constraint models, it's now reasonable to assume a service plan is cacheable. Planning caches should dramatically improve container performance when providing services.
