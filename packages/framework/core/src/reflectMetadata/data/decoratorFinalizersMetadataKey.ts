// Well-known key for storing decorator finalizer callbacks in context.metadata.
// Method decorators push callbacks here; @Controller runs them at class definition time.
export const decoratorFinalizersMetadataKey: symbol = Symbol.for(
  '@inversifyjs/framework-core/decoratorFinalizers',
);
