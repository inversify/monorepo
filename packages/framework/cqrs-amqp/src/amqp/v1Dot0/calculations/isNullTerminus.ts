// rhea exposes the remote terminus as received, so an AMQP null terminus is a
// typed wrapper whose value is null rather than a plain null.
export function isNullTerminus(terminus: unknown): boolean {
  return (
    terminus === null ||
    terminus === undefined ||
    (typeof terminus === 'object' &&
      'value' in terminus &&
      terminus.value === null)
  );
}
