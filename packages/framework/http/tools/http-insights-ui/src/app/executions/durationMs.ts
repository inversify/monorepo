export function durationMs(startedAt: string, sentAt: string): number {
  const started: number = Date.parse(startedAt);
  const sent: number = Date.parse(sentAt);

  if (Number.isNaN(started) || Number.isNaN(sent)) {
    throw new Error('Execution timestamps are not valid dates.');
  }

  return sent - started;
}
