export interface Guard {
  readonly id: string;
  readonly allowed: boolean | null;
  readonly endedAt: Date;
  readonly error: unknown;
  readonly guard: string;
  readonly startedAt: Date;
}
