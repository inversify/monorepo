---
slug: uwebsockets-adapter-unleashed
title: uWebSockets.js Adapter - When Speed Actually Matters
authors: [notaphplover]
tags: [adapter]
---

Remember when you started optimizing your API and realized the framework itself was the bottleneck? Yeah, us too.

<!-- truncate -->

![Speed banner](./speed-banner.jpg)

## Why We Built This

Let's be honest - Express is great. Fastify is fast. But sometimes you need **absurd** performance. The kind that makes you question if your monitoring tools are broken because the numbers seem too good.

That's where uWebSockets.js comes in. It's written in C++ and can handle orders of magnitude more requests than traditional Node.js frameworks. And now, it plays nicely with InversifyJS.

## What You Get

### 🚀 Blazing Fast by Default

uWebSockets.js doesn't just claim to be fast - it's benchmarked as one of the fastest HTTP servers in existence. Not just in Node.js. **In existence**. We're talking microsecond response times.

```typescript
import { InversifyUwebSocketsHttpAdapter } from '@inversifyjs/http-uwebsockets';
import { Container } from 'inversify';

const adapter = new InversifyUwebSocketsHttpAdapter(container, {
  logger: true,
  useJson: true,
});

const app = await adapter.build();

app.listen('0.0.0.0', 3000, (socket) => {
  console.log('Server running at lightning speed 🚀');
});
```

### 💧 Smart Stream Handling

File uploads? Video streaming? Large data transfers? The adapter handles backpressure automatically, so your server won't choke on large payloads:

```typescript
import { Controller, Get } from '@inversifyjs/http-core';
import { createReadStream } from 'node:fs';

@Controller({ path: '/api' })
export class VideoController {
  @Get('/stream-video')
  public streamVideo() {
    const stream = createReadStream('./video.mp4');
    return stream; // That's it. Really.
  }
}
```

The adapter automatically:
- Pauses the stream when the client's buffer is full
- Resumes when the client is ready
- Cleans up on disconnections
- Handles errors gracefully

### 🎯 Full Framework Support

You don't lose any InversifyJS superpowers:

- **Guards** for authorization checks
- **Middleware** for request processing
- **Interceptors** for response transformation
- **Error filters** for unified error handling
- Full dependency injection with decorators

```typescript
@Controller({ path: '/secure' })
@UseGuard(AuthGuard)
export class SecureController {
  @Post('/data')
  @ApplyMiddleware(RateLimitMiddleware)
  public async handleData(@Body() data: DataDto) {
    // Your business logic here
    return { success: true };
  }
}
```

## When Should You Use It?

### ✅ Perfect For:

- **High-throughput APIs** - Handling thousands of requests per second
- **Real-time applications** - WebSockets support built-in
- **Streaming services** - Video, audio, or large file transfers
- **Microservices** - Where every millisecond counts
- **IoT backends** - Managing thousands of device connections

### 🤔 Maybe Not For:

- Prototypes where speed isn't critical

## The DX Is Still Smooth

We know what you're thinking: "High performance usually means horrible developer experience."

Not here. The adapter integrates seamlessly with InversifyJS's decorator-based API:

```typescript
import { UwebSocketsMiddleware } from '@inversifyjs/http-uwebsockets';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';

export class CustomHeaderMiddleware implements UwebSocketsMiddleware {
  public async handle(
    req: HttpRequest,
    res: HttpResponse,
    next: () => void
  ): Promise<void> {
    res.writeHeader('X-Powered-By', 'InversifyJS + uWebSockets.js');
    next();
  }
}
```

Same patterns, same decorators, same dependency injection. Just faster.

## Getting Started

```bash
npm install @inversifyjs/http-uwebsockets
```

That's it. Check out the [docs](https://inversify.io/docs/introduction/getting-started) for the full guide.

## Real Talk

Is uWebSockets.js the right choice for every project? No. 

Is Express still perfectly fine for most APIs? Absolutely.

But when you need to handle serious traffic, when every millisecond matters, when you're tired of scaling horizontally because your framework can't keep up - this adapter is here for you.

Built with the same InversifyJS patterns you know. Just faster.

---

**Try it out and let us know what you build.** We're especially curious about the throughput improvements you see in production. Drop your stories in our [discussions](https://github.com/inversify/monorepo/discussions). 

Happy coding! ⚡
