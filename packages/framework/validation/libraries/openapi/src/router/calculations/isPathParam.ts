export function isPathParam(segment: string): boolean {
  return segment.startsWith('{') && segment.endsWith('}');
}
