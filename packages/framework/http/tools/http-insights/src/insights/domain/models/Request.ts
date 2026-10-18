export interface Request {
  readonly id: string;
  readonly headers: Readonly<Record<string, string | readonly string[]>>;
  readonly method: string;
  readonly startedAt: Date;
  readonly url: string;
}
