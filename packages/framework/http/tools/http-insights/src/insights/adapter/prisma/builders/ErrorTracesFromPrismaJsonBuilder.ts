import { injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type Prisma } from '../../../../generated/prisma/client.js';
import {
  type ErrorTrace,
  type ErrorTraceLocation,
} from '../../../domain/models/ErrorTrace.js';

@injectable()
export class ErrorTracesFromPrismaJsonBuilder implements Builder<
  Prisma.JsonValue | null,
  readonly ErrorTrace[] | null
> {
  public build(value: Prisma.JsonValue | null): readonly ErrorTrace[] | null {
    if (!Array.isArray(value) || value.length === 0) {
      return null;
    }

    const traces: ErrorTrace[] = [];

    for (const item of value) {
      const trace: ErrorTrace | null = readErrorTrace(item);

      if (trace === null) {
        return null;
      }

      traces.push(trace);
    }

    return traces;
  }
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readErrorTrace(value: unknown): ErrorTrace | null {
  if (!isRecord(value)) {
    return null;
  }

  const location: ErrorTraceLocation | null = readLocation(value['location']);
  const nextStatements: readonly string[] | null = readStatements(
    value['nextStatements'],
  );
  const previousStatements: readonly string[] | null = readStatements(
    value['previousStatements'],
  );
  const traceStatement: string | null = readStatement(value['traceStatement']);

  if (
    location === null ||
    nextStatements === null ||
    previousStatements === null ||
    traceStatement === null
  ) {
    return null;
  }

  return {
    location,
    nextStatements,
    previousStatements,
    traceStatement,
  };
}

function readLocation(value: unknown): ErrorTraceLocation | null {
  if (!isRecord(value)) {
    return null;
  }

  const column: number | null = readPositiveInteger(value['column']);
  const file: string | null = readNonEmptyString(value['file']);
  const filename: string | null = readNonEmptyString(value['filename']);
  const functionName: unknown = value['functionName'];
  const line: number | null = readPositiveInteger(value['line']);

  if (
    column === null ||
    file === null ||
    filename === null ||
    line === null ||
    !isNullableString(functionName)
  ) {
    return null;
  }

  return {
    column,
    file,
    filename,
    functionName,
    line,
  };
}

function readNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }

  return value;
}

function readPositiveInteger(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    return null;
  }

  return value;
}

function readStatement(value: unknown): string | null {
  return readNonEmptyString(value);
}

function readStatements(value: unknown): readonly string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const statements: string[] = [];

  for (const item of value) {
    if (typeof item !== 'string') {
      return null;
    }

    statements.push(item);
  }

  return statements;
}
