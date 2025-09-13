export class NotImplementedOperationError extends Error {
  constructor(
    message: string = 'This operation is not implemented',
    options?: ErrorOptions,
  ) {
    super(`[NotImplementedOperationError]: ${message}`, options);
  }
}
