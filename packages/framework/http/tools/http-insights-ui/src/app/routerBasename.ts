export function routerBasename(baseUrl: string): string {
  if (baseUrl.length > 1 && baseUrl.endsWith('/')) {
    return baseUrl.slice(0, -1);
  }

  return baseUrl;
}
