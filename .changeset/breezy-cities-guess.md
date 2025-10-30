---
"@inversifyjs/http-core": major
---

- Updated `ErrorHttpResponse` without `is`.
- Updated `SuccessHttpResponse` without `is`.
- Updated `ErrorHttpResponse` based classes constructors with `body` and `message` params:

Before:

```ts
throw new BadRequestHttpResponse('Error message', undefined, {
  cause: new Error(),
});
```

After:

```ts
throw new BadRequestHttpResponse(
  { message: 'my http body content' },
  'Error message',
  {
    cause: new Error(),
  },
);
```
