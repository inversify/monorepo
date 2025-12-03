# @inversifyjs/http-core

## 4.8.0

### Minor Changes

- Updated adapter with `id` property

### Patch Changes

- Updated dependencies
  - inversify@7.10.5

## 4.7.0

### Minor Changes

- Added `SuccessHttpResponse`

## 4.6.0

### Minor Changes

- Updated HTTP adapter with `_sendBodySeparator`

### Patch Changes

Add support for custom native parameter decorators

## 4.5.0

### Minor Changes

- Updated `CustomParameterDecoratorHandler` with options param
- Added `ControllerOptions`
- Added `ControllerResponse`
- Added `isHttpResponseSymbol`
- Updated `InversifyHttpAdapter.applyGlobalMiddleware` to allow passing service identifiers

## 4.4.0

### Minor Changes

- Updated `ControllerOptions` with optional `priority`
  Added `handleMiddlewareList`

### Patch Changes

- Updated `InversifyHttpAdapter.useGlobalPipe` to avoid applying pipes after build
  Updated header metadata to be an object

## 4.3.0

## 4.2.0

### Minor Changes

- Updated `HttpResponse` with optional headers

## 4.1.0

### Minor Changes

Updated `InversifyHttpAdapter` with protected `_logger`

### Patch Changes

- Updated `InversifyHttpAdapter._getBody` with missing response param

## 4.0.0

### Major Changes

- Updated `ErrorHttpResponse` without `is`.
- Updated `SuccessHttpResponse` without `is`.
- Updated `ErrorHttpResponse` based classes constructors with `body` and `message` params:

Before:

```ts
throw new BadRequestHttpResponse("Error message", undefined, {
  cause: new Error(),
});
```

After:

```ts
throw new BadRequestHttpResponse(
  { message: "my http body content" },
  "Error message",
  {
    cause: new Error(),
  }
);
```

### Minor Changes

- Updated InversifyHttpAdapter with default `ErrorHttpResponse` ErrorFilter

## 3.3.0

### Minor Changes

- Updated `HttpAdapter` to build controller routes on top of parent controller class metadata, allowing route extension

### Patch Changes

- Updated dependencies
  - @inversifyjs/prototype-utils@0.1.3
  - inversify@7.10.4

## 3.2.0

### Patch Changes

- Updated dependencies
  - inversify@7.10.3

## 3.1.0

## 3.0.1

### Patch Changes

- Updated dependencies
  - @inversifyjs/reflect-metadata-utils@1.4.1
  - @inversifyjs/framework-core@1.0.1
  - inversify@7.10.2

## 3.0.0

## 2.0.0

### Minor Changes

- Added `ApplyMiddleware` decorator
- Added `AlreadyReportedHttpResponse`
- Added `ContentDifferentHttpResponse`
- Added `ConflictHttpResponse`
- Added `BadRequestHttpResponse`
- Added `BadGatewayHttpResponse`
- Added `Controller` decorator
- Added `All` decorator
- Added `AcceptedHttpResponse`
- Added `Body` decorator
- Added `CreatedHttpResponse`
- Added `CatchError` decorator
- Added `Delete` decorator
- Added `buildNormalizedPath`
- Added `createCustomParameterDecorator`
- Added `Cookies` decorator
- Added `ErrorHttpResponse`
- Added `ForbiddenHttpResponse`
- Added `GatewayTimeoutHttpResponse`
- Added `Get` decorator
- Added `getControllerMetadataList`
- Added `getControllerMethodMetadataList`
- Added `GoneHttpResponse`
- Added `Head` decorator
- Added `Headers` decorator
- Added `HttpResponse` decorator
- Added `HttpStatusCode` decorator
- Added `HttpVersionNotSupportedHttpResponse`
- Added `InsufficientStorageHttpResponse`
- Added `InternalServerErrorHttpResponse`
- Added `InversifyHttpAdapter`
- Added `isHttpResponse`
- Added `LoopDetectedHttpResponse`
- Added `MethodNotAllowedHttpResponse`
- Added `MiddlewarePhase`
- Added `MultiStatusHttpResponse`
- Added `Next` decorator
- Added `NoContentHttpResponse`
- Added `NonAuthoritativeInformationHttpResponse`
- Added `NotAcceptableHttpResponse`
- Added `NotFoundHttpResponse`
- Added `NotImplementedHttpResponse`
- Added `OkHttpResponse`
- Added `Options` decorator
- Added `Params` decorator
- Added `PartialContentHttpResponse`
- Added `Patch` decorator
- Added `PaymentRequiredHttpResponse`
- Added `Post` decorator
- Added `Put` decorator
- Added `Query` decorator
- Added `Request` decorator
- Added `RequestMethodParameterType`
- Added `RequestMethodType`
- Added `ResetContentHttpResponse`
- Added `Response` decorator
- Added `ServiceUnavailableHttpResponse`
- Added `SetHeader` decorator
- Added `StatusCode` decorator
- Added `UnauthorizedHttpResponse`
- Added `UnprocessableEntityHttpResponse`
- Added `UseErrorFilter` decorator
- Added `UseGuard` decorator
- Added `UseInterceptor` decorator
- Added `CatchErrorOptions` type
- Added `ControllerMetadata` type
- Added `ControllerMethodMetadata` type
- Added `ErrorFilter` type
- Added `Guard` type
- Added `HttpAdapterOptions` type
- Added `Interceptor` type
- Added `InterceptorTransformObject` type
- Added `Middleware` type
- Added `MiddlewareHandler` type
- Added `Pipe` type
- Added `PipeMetadata` type
- Added `RequestHandler` type
- Added `RequiredOptions` type
- Added `RouteParamOptions` type
- Added `RouteParams` type
- Added `RouterParams` type

### Patch Changes

- Updated dependencies
  - @inversifyjs/framework-core@1.0.0
  - @inversifyjs/logger@1.1.0
