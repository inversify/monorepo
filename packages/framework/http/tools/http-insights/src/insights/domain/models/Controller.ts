export interface Controller {
  readonly id: string;
  readonly controller: string;
  readonly endedAt: Date;
  readonly error: unknown;
  readonly method: string;
  readonly startedAt: Date;
}
