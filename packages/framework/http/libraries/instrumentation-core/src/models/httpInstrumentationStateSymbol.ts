export const httpInstrumentationStateSymbol: unique symbol = Symbol.for(
  '@inversifyjs/http-instrumentation-core/httpInstrumentationState',
);

export interface HttpInstrumentationState {
  executionStack: string[];
  requestId: string;
}
