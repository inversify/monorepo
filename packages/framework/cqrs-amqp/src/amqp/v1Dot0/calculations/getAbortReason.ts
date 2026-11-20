export function getAbortReason(signal: AbortSignal): Error {
  const reason: unknown = signal.reason;

  return reason instanceof Error ? reason : new Error('Aborted');
}
