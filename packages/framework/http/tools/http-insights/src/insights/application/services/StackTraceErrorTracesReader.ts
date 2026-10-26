import { basename, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { inject, injectable } from 'inversify';
import { parse as parseStackTrace, type StackFrame } from 'stack-trace';

import {
  buildStatementIndex,
  readStatementContext,
  type StatementContext,
  type StatementIndex,
} from '../../adapter/babel/calculations/statementIndex.js';
import { type ErrorTrace } from '../../domain/models/ErrorTrace.js';
import { type ErrorTracesReader } from '../ports/ErrorTracesReader.js';
import {
  type SourceText,
  type SourceTextReader,
  sourceTextReaderService,
} from '../ports/SourceTextReader.js';

interface CachedIndex {
  readonly statementIndex: StatementIndex | null;
  readonly version: string;
}

interface IndexedSource {
  readonly sourceText: SourceText;
  readonly statementIndex: StatementIndex;
}

@injectable()
export class StackTraceErrorTracesReader implements ErrorTracesReader {
  readonly #indexes: Map<string, CachedIndex> = new Map();
  readonly #sourceTextReader: SourceTextReader;

  constructor(
    @inject(sourceTextReaderService)
    sourceTextReader: SourceTextReader,
  ) {
    this.#sourceTextReader = sourceTextReader;
  }

  public async read(error: unknown): Promise<readonly ErrorTrace[] | null> {
    try {
      return await this.#read(error);
    } catch (_readError: unknown) {
      return null;
    }
  }

  async #read(error: unknown): Promise<readonly ErrorTrace[] | null> {
    const traces: ErrorTrace[] = [];

    await this.#readError(error, traces, new WeakSet<Error>());

    if (traces.length === 0) {
      return null;
    }

    return traces;
  }

  async #readError(
    error: unknown,
    traces: ErrorTrace[],
    seen: WeakSet<Error>,
  ): Promise<void> {
    if (typeof error !== 'object' || error === null) {
      return;
    }

    if (error instanceof Error) {
      if (seen.has(error)) {
        return;
      }

      seen.add(error);
    }

    const frames: readonly StackFrame[] | null = readFrames(error);

    if (frames !== null) {
      for (const frame of frames) {
        const trace: ErrorTrace | null = await this.#readFrame(frame);

        if (trace !== null) {
          traces.push(trace);
        }
      }
    }

    if (!(error instanceof Error)) {
      return;
    }

    const cause: Error | null = readCause(error);

    if (cause === null) {
      return;
    }

    await this.#readError(cause, traces, seen);
  }

  async #readFrame(frame: StackFrame): Promise<ErrorTrace | null> {
    if (frame.isNative()) {
      return null;
    }

    const fileName: string | null = readFrameString(frame.getFileName());
    const line: number | null = readPositiveInteger(frame.getLineNumber());
    const column: number | null = readPositiveInteger(frame.getColumnNumber());

    if (fileName === null || line === null || column === null) {
      return null;
    }

    const filePath: string | null = readStackFilePath(fileName);

    if (filePath === null) {
      return null;
    }

    const indexedSource: IndexedSource | null = await this.#readIndex(filePath);

    if (indexedSource === null) {
      return null;
    }

    const context: StatementContext | null = readStatementContext(
      indexedSource.statementIndex,
      line,
      column,
    );

    if (context === null) {
      return null;
    }

    return {
      location: {
        column,
        file: indexedSource.sourceText.path,
        filename: basename(indexedSource.sourceText.path),
        functionName: readFunctionName(frame),
        line,
      },
      nextStatements: context.nextStatements,
      previousStatements: context.previousStatements,
      traceStatement: context.traceStatement,
    };
  }

  async #readIndex(filePath: string): Promise<IndexedSource | null> {
    const sourceText: SourceText | null =
      await this.#sourceTextReader.read(filePath);

    if (sourceText === null) {
      return null;
    }

    const cached: CachedIndex | undefined = this.#indexes.get(sourceText.path);

    if (cached !== undefined && cached.version === sourceText.version) {
      if (cached.statementIndex === null) {
        return null;
      }

      return {
        sourceText,
        statementIndex: cached.statementIndex,
      };
    }

    const statementIndex: StatementIndex | null = buildStatementIndex(
      sourceText.source,
      sourceText.path,
    );

    this.#indexes.set(sourceText.path, {
      statementIndex,
      version: sourceText.version,
    });

    if (statementIndex === null) {
      return null;
    }

    return {
      sourceText,
      statementIndex,
    };
  }
}

function readCause(error: Error): Error | null {
  const cause: unknown = error.cause;

  if (cause instanceof Error) {
    return cause;
  }

  return null;
}

function readErrorStack(error: unknown): string | null {
  if (typeof error !== 'object' || error === null) {
    return null;
  }

  const stack: unknown = (error as Record<string, unknown>)['stack'];

  if (typeof stack !== 'string' || stack.length === 0) {
    return null;
  }

  return stack;
}

function readFrameString(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }

  return value;
}

function readFrames(error: unknown): readonly StackFrame[] | null {
  if (error instanceof Error) {
    if (typeof error.stack !== 'string' || error.stack.length === 0) {
      return null;
    }

    return parseStackTrace(error);
  }

  const stack: string | null = readErrorStack(error);

  if (stack === null) {
    return null;
  }

  const carrier: Error = new Error('stack');

  carrier.stack = stack;

  return parseStackTrace(carrier);
}

function readFunctionName(frame: StackFrame): string | null {
  const functionName: unknown = frame.getFunctionName();

  if (typeof functionName === 'string' && functionName.length > 0) {
    return functionName;
  }

  const methodName: unknown = frame.getMethodName();

  if (typeof methodName === 'string' && methodName.length > 0) {
    return methodName;
  }

  return null;
}

function readPositiveInteger(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    return null;
  }

  return value;
}

function readStackFilePath(fileName: string): string | null {
  if (fileName.startsWith('node:')) {
    return null;
  }

  if (fileName.startsWith('file:')) {
    try {
      return fileURLToPath(fileName);
    } catch (_error: unknown) {
      return null;
    }
  }

  if (isAbsolute(fileName)) {
    return fileName;
  }

  return resolve(fileName);
}
