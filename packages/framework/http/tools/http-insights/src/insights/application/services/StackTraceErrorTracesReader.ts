import { basename, extname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { inject, injectable } from 'inversify';
import { parse as parseStackTrace, type StackFrame } from 'stack-trace';

import {
  buildStatementIndex,
  type StatementIndex,
} from '../../adapter/babel/calculations/buildStatementIndex.js';
import {
  readStatementContext,
  type StatementContext,
} from '../../adapter/babel/calculations/readStatementContext.js';
import { type ErrorTrace } from '../../domain/models/ErrorTrace.js';
import { type ErrorTracesReader } from '../ports/ErrorTracesReader.js';
import {
  type MappedSource,
  type SourceMapReader,
  sourceMapReaderService,
} from '../ports/SourceMapReader.js';
import {
  type SourceText,
  type SourceTextReader,
  sourceTextReaderService,
} from '../ports/SourceTextReader.js';

const MAX_SOURCE_MAP_HOPS: number = 8;

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
  readonly #sourceMapReader: SourceMapReader;
  readonly #sourceTextReader: SourceTextReader;

  constructor(
    @inject(sourceTextReaderService)
    sourceTextReader: SourceTextReader,
    @inject(sourceMapReaderService)
    sourceMapReader: SourceMapReader,
  ) {
    this.#sourceMapReader = sourceMapReader;
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

    const sourceText: SourceText | null =
      await this.#sourceTextReader.read(filePath);

    if (sourceText === null) {
      return null;
    }

    const supported: MappedSource | null = await this.#readSupportedSource(
      sourceText,
      line,
      column,
    );

    if (supported !== null) {
      const trace: ErrorTrace | null = this.#readTrace(
        frame,
        supported.sourceText,
        supported.line,
        supported.column,
      );

      if (trace !== null) {
        return trace;
      }

      if (
        supported.sourceText === sourceText &&
        supported.line === line &&
        supported.column === column
      ) {
        return null;
      }
    }

    return this.#readTrace(frame, sourceText, line, column);
  }

  #readIndexedSource(sourceText: SourceText): IndexedSource | null {
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

  async #readSupportedSource(
    sourceText: SourceText,
    line: number,
    column: number,
  ): Promise<MappedSource | null> {
    let candidate: MappedSource | null = isSupportedSource(sourceText.path)
      ? {
          column,
          line,
          sourceText,
        }
      : null;
    const seen: Set<string> = new Set();
    let current: MappedSource = {
      column,
      line,
      sourceText,
    };

    for (let hop: number = 0; hop < MAX_SOURCE_MAP_HOPS; hop += 1) {
      const key: string = readLocationKey(current);

      if (seen.has(key)) {
        break;
      }

      seen.add(key);

      const next: MappedSource | null = await this.#sourceMapReader.read(
        current.sourceText,
        current.line,
        current.column,
      );

      if (next === null) {
        break;
      }

      current = next;

      if (isSupportedSource(current.sourceText.path)) {
        candidate = current;
      }
    }

    return candidate;
  }

  #readTrace(
    frame: StackFrame,
    sourceText: SourceText,
    line: number,
    column: number,
  ): ErrorTrace | null {
    const indexedSource: IndexedSource | null =
      this.#readIndexedSource(sourceText);

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
        file: sourceText.path,
        filename: basename(sourceText.path),
        functionName: readFunctionName(frame),
        line,
      },
      nextStatements: context.nextStatements,
      previousStatements: context.previousStatements,
      traceStatement: context.traceStatement,
    };
  }
}

function isSupportedSource(filePath: string): boolean {
  switch (extname(filePath)) {
    case '.cts':
    case '.mts':
    case '.ts':
    case '.tsx':
      return true;
    default:
      return false;
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

function readLocationKey(location: MappedSource): string {
  return `${location.sourceText.path}\0${String(location.line)}\0${String(location.column)}`;
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
