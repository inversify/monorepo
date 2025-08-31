export interface RequestParameter {
  readonly body: unknown;
  readonly queryParameters: Record<string, string[]>;
  readonly request: Request;
  readonly urlParameters: Record<string, string>;
}
