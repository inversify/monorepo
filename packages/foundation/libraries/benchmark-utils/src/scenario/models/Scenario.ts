export interface Scenario<TPlatform extends string = string, TResult = void> {
  platform: TPlatform;
  execute(): Promise<TResult>;
  setUp(): Promise<void>;
  tearDown(): Promise<void>;
}
