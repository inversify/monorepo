export interface HttpInstrumentationScope {
  readonly executionId: string;
  readonly parentExecutionId: string | undefined;
  readonly requestId: string;
}
