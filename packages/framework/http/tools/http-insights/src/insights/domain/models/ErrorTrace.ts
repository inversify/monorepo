export interface ErrorTraceLocation {
  readonly column: number;
  readonly file: string;
  readonly filename: string;
  readonly functionName: string | null;
  readonly line: number;
}

export interface ErrorTrace {
  readonly location: ErrorTraceLocation;
  readonly nextStatements: readonly string[];
  readonly previousStatements: readonly string[];
  readonly traceStatement: string;
}
