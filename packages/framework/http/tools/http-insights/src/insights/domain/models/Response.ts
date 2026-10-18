export interface Response {
  readonly id: string;
  readonly aborted: boolean;
  readonly headers: Readonly<Record<string, string | readonly string[]>>;
  readonly sentAt: Date;
  readonly statusCode: number;
}
