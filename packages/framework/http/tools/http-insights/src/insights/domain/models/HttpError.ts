export interface HttpError {
  readonly id: string;
  readonly endedAt: Date;
  readonly error: unknown;
  readonly filter: string | null;
  readonly startedAt: Date;
}
