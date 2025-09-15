// Begin-example
export class InvalidOperationError extends Error {
  constructor(message: string = 'Invalid operation', options?: ErrorOptions) {
    super(`[InvalidOperationError]: ${message}`, options);
  }
}
// End-example
