export interface ResponseParameter {
  readonly body: unknown;
  readonly response: Response;
  readonly statusCode: number;
}
