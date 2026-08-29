---
slug: announcing-inversify-7-0-0-alpha-2-prerelease
title: Announcing 7.0.0-alpha.2
authors: [notaphplover]
tags: [releases]
---

In this version, we are announcing significant performance improvements! Let's see how caches can assist us in accomplishing such a feat!

{/* truncate */}

## Context

### The current container design

Like previous versions of Inversify, when a service resolution is requested by calling `container.get`, a planner schedules the bindings to be used in a tree structure, which is then used to build the instances that compose the requested service.

### Adding a caching strategy

Previous versions of Inversify don't cache plans. It might sound surprising, but it's the way it is. Previous versions of Inversify expose too many internal APIs, making it impossible for plans to be deterministic. For example, previous versions of Inversify give `container` access via context to binding constraints, allowing the possibility to cause side effects in the planning phase!

With some reasonable restrictions, `inversify@7` keeps the same degree of flexibility with deterministic internal plans. But, wait, if plans are deterministic, they can be cached!

#### Why cache plans?

You don't need to compute a cached plan again, and the garbage collector doesn't need to clear memory of a non-computed cached plan, which is an operation heavier than you might expect when optimizing these micro tasks.

## Results

After running some benchmarks, Inversify 7 is faster than Inversify 6 when working with singleton scope services and way faster when working with transient scoped services.

We will use a faster container for reference. Tsyringe is the perfect candidate: their simplicity allows resolving services without any planning phase, and therefore it's going to be way faster than Inversify.

Benchmark implementation can be observed at the `@inversifyjs/container-benchmarks` package. Feel free to run them or have a look at any of the latest monorepo PRs which include benchmark results.

As of today, the latest benchmark results are as follows:

```bash
[CJS] Running benchmarks...

Get service in singleton scope
┌─────────┬────────────────────┬──────────────────────┬─────────────────────┬────────────────────────────┬───────────────────────────┬─────────┐
│ (index) │ Task name          │ Latency average (ns) │ Latency median (ns) │ Throughput average (ops/s) │ Throughput median (ops/s) │ Samples │
├─────────┼────────────────────┼──────────────────────┼─────────────────────┼────────────────────────────┼───────────────────────────┼─────────┤
│ 0       │ 'inversifyCurrent' │ '582.96 ± 0.80%'     │ '561.00'            │ '1758258 ± 0.01%'          │ '1782531'                 │ 1715395 │
│ 1       │ 'inversify6'       │ '1136.19 ± 0.35%'    │ '982.00'            │ '961212 ± 0.03%'           │ '1018330'                 │ 880137  │
│ 2       │ 'tsyringe'         │ '329.02 ± 1.10%'     │ '291.00'            │ '3271688 ± 0.01%'          │ '3436426'                 │ 3039353 │
└─────────┴────────────────────┴──────────────────────┴─────────────────────┴────────────────────────────┴───────────────────────────┴─────────┘
Get service in transient scope
┌─────────┬────────────────────┬──────────────────────┬─────────────────────┬────────────────────────────┬───────────────────────────┬─────────┐
│ (index) │ Task name          │ Latency average (ns) │ Latency median (ns) │ Throughput average (ops/s) │ Throughput median (ops/s) │ Samples │
├─────────┼────────────────────┼──────────────────────┼─────────────────────┼────────────────────────────┼───────────────────────────┼─────────┤
│ 0       │ 'inversifyCurrent' │ '1023.52 ± 0.29%'    │ '992.00'            │ '1003603 ± 0.01%'          │ '1008065'                 │ 977022  │
│ 1       │ 'inversify6'       │ '5181.39 ± 0.41%'    │ '4960.00'           │ '198404 ± 0.03%'           │ '201613'                  │ 192999  │
│ 2       │ 'tsyringe'         │ '466.06 ± 0.85%'     │ '441.00'            │ '2261272 ± 0.01%'          │ '2267574'                 │ 2145645 │
└─────────┴────────────────────┴──────────────────────┴─────────────────────┴────────────────────────────┴───────────────────────────┴─────────┘
Get complex service in singleton scope
┌─────────┬────────────────────┬──────────────────────┬─────────────────────┬────────────────────────────┬───────────────────────────┬─────────┐
│ (index) │ Task name          │ Latency average (ns) │ Latency median (ns) │ Throughput average (ops/s) │ Throughput median (ops/s) │ Samples │
├─────────┼────────────────────┼──────────────────────┼─────────────────────┼────────────────────────────┼───────────────────────────┼─────────┤
│ 0       │ 'inversifyCurrent' │ '614.26 ± 1.74%'     │ '591.00'            │ '1673265 ± 0.01%'          │ '1692047'                 │ 1627989 │
│ 1       │ 'inversify6'       │ '1061.52 ± 0.48%'    │ '1001.00'           │ '989393 ± 0.01%'           │ '999001'                  │ 942048  │
│ 2       │ 'tsyringe'         │ '335.53 ± 0.58%'     │ '311.00'            │ '3171618 ± 0.01%'          │ '3215434'                 │ 2980330 │
└─────────┴────────────────────┴──────────────────────┴─────────────────────┴────────────────────────────┴───────────────────────────┴─────────┘
Get complex service in transient scope
┌─────────┬────────────────────┬──────────────────────┬────────────────────────┬────────────────────────────┬───────────────────────────┬─────────┐
│ (index) │ Task name          │ Latency average (ns) │ Latency median (ns)    │ Throughput average (ops/s) │ Throughput median (ops/s) │ Samples │
├─────────┼────────────────────┼──────────────────────┼────────────────────────┼────────────────────────────┼───────────────────────────┼─────────┤
│ 0       │ 'inversifyCurrent' │ '349104.25 ± 0.51%'  │ '340334.00'            │ '2893 ± 0.28%'             │ '2938'                    │ 2865    │
│ 1       │ 'inversify6'       │ '5023278.98 ± 1.16%' │ '4783030.50 ± 4958.50' │ '200 ± 1.00%'              │ '209'                     │ 200     │
│ 2       │ 'tsyringe'         │ '249415.89 ± 0.59%'  │ '237333.00'            │ '4088 ± 0.32%'             │ '4213'                    │ 4011    │
└─────────┴────────────────────┴──────────────────────┴────────────────────────┴────────────────────────────┴───────────────────────────┴─────────┘
```
```bash
[ESM] Running benchmarks...

Get service in singleton scope
┌─────────┬────────────────────┬──────────────────────┬─────────────────────┬────────────────────────────┬───────────────────────────┬─────────┐
│ (index) │ Task name          │ Latency average (ns) │ Latency median (ns) │ Throughput average (ops/s) │ Throughput median (ops/s) │ Samples │
├─────────┼────────────────────┼──────────────────────┼─────────────────────┼────────────────────────────┼───────────────────────────┼─────────┤
│ 0       │ 'inversifyCurrent' │ '578.15 ± 0.88%'     │ '541.00'            │ '1809935 ± 0.01%'          │ '1848429'                 │ 1729642 │
│ 1       │ 'inversify6'       │ '904.50 ± 0.33%'     │ '851.00'            │ '1159099 ± 0.01%'          │ '1175088'                 │ 1105586 │
│ 2       │ 'tsyringe'         │ '287.15 ± 1.12%'     │ '261.00'            │ '3722553 ± 0.01%'          │ '3831418'                 │ 3482456 │
└─────────┴────────────────────┴──────────────────────┴─────────────────────┴────────────────────────────┴───────────────────────────┴─────────┘
Get service in transient scope
┌─────────┬────────────────────┬──────────────────────┬─────────────────────┬────────────────────────────┬───────────────────────────┬─────────┐
│ (index) │ Task name          │ Latency average (ns) │ Latency median (ns) │ Throughput average (ops/s) │ Throughput median (ops/s) │ Samples │
├─────────┼────────────────────┼──────────────────────┼─────────────────────┼────────────────────────────┼───────────────────────────┼─────────┤
│ 0       │ 'inversifyCurrent' │ '837.39 ± 0.28%'     │ '802.00'            │ '1232351 ± 0.01%'          │ '1246883'                 │ 1194187 │
│ 1       │ 'inversify6'       │ '4868.25 ± 0.32%'    │ '4679.00'           │ '211104 ± 0.03%'           │ '213721'                  │ 205413  │
│ 2       │ 'tsyringe'         │ '494.17 ± 0.40%'     │ '461.00'            │ '2118431 ± 0.01%'          │ '2169197'                 │ 2023611 │
└─────────┴────────────────────┴──────────────────────┴─────────────────────┴────────────────────────────┴───────────────────────────┴─────────┘
Get complex service in singleton scope
┌─────────┬────────────────────┬──────────────────────┬─────────────────────┬────────────────────────────┬───────────────────────────┬─────────┐
│ (index) │ Task name          │ Latency average (ns) │ Latency median (ns) │ Throughput average (ops/s) │ Throughput median (ops/s) │ Samples │
├─────────┼────────────────────┼──────────────────────┼─────────────────────┼────────────────────────────┼───────────────────────────┼─────────┤
│ 0       │ 'inversifyCurrent' │ '606.92 ± 1.72%'     │ '571.00'            │ '1739723 ± 0.01%'          │ '1751313'                 │ 1647652 │
│ 1       │ 'inversify6'       │ '924.23 ± 2.51%'     │ '852.00'            │ '1153936 ± 0.01%'          │ '1173709'                 │ 1081983 │
│ 2       │ 'tsyringe'         │ '307.19 ± 0.48%'     │ '290.00'            │ '3432297 ± 0.01%'          │ '3448276'                 │ 3255286 │
└─────────┴────────────────────┴──────────────────────┴─────────────────────┴────────────────────────────┴───────────────────────────┴─────────┘
Get complex service in transient scope
┌─────────┬────────────────────┬──────────────────────┬─────────────────────────┬────────────────────────────┬───────────────────────────┬─────────┐
│ (index) │ Task name          │ Latency average (ns) │ Latency median (ns)     │ Throughput average (ops/s) │ Throughput median (ops/s) │ Samples │
├─────────┼────────────────────┼──────────────────────┼─────────────────────────┼────────────────────────────┼───────────────────────────┼─────────┤
│ 0       │ 'inversifyCurrent' │ '249696.67 ± 0.47%'  │ '241791.00'             │ '4047 ± 0.24%'             │ '4136'                    │ 4005    │
│ 1       │ 'inversify6'       │ '4596691.40 ± 1.18%' │ '4710800.50 ± 16420.50' │ '219 ± 0.99%'              │ '212 ± 1'                 │ 218     │
│ 2       │ 'tsyringe'         │ '235461.28 ± 0.43%'  │ '227424.00'             │ '4296 ± 0.25%'             │ '4397'                    │ 4247    │
└─────────┴────────────────────┴──────────────────────┴─────────────────────────┴────────────────────────────┴───────────────────────────┴─────────┘
```

As you can see, `inversify@7` performs way better than `inversify@6` in every scenario, especially when working with transient scopes. It's slower than `tsyringe`, but now I honestly believe Inversify is fast enough while providing a more flexible API.

## What's next

Further performance optimizations can be accomplished. It's out of the scope of `inversify@7`, but let me say that we will make Inversify faster than `tsyringe` while providing the same flexible API. If you want to be part of it, don't hesitate to open a discussion in the [monorepo](https://github.com/inversify/monorepo/) and join us in this adventure!
