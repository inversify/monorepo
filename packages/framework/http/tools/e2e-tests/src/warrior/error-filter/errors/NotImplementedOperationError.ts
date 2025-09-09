export class NotImplementedOperationError extends Error {
  constructor(
    message: string = 'This operation is not implemented',
    options?: ErrorOptions,
  ) {
    super(`[NotImplementedFeatureError]: ${message}`, options);
  }
}
