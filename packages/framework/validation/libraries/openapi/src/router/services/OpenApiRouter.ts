export interface OpenApiRouter {
  findRoute(method: string, path: string): string | undefined;
}
