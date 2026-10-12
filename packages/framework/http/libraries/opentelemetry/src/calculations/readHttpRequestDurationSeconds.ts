const MILLISECONDS_PER_SECOND: number = 1000;

export function readHttpRequestDurationSeconds(
  startTimestamp: number,
  endTimestamp: number,
): number {
  return (endTimestamp - startTimestamp) / MILLISECONDS_PER_SECOND;
}
