export function readStageKey(kind: string, id: string): string {
  return `${kind}-${id}`;
}
