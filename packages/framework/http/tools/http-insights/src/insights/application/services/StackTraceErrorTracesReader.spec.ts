import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Buffer } from 'node:buffer';
import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { NodeSourceMapReader } from '../../adapter/node/services/NodeSourceMapReader.js';
import { NodeSourceTextReader } from '../../adapter/node/services/NodeSourceTextReader.js';
import { type ErrorTrace } from '../../domain/models/ErrorTrace.js';
import {
  type SourceText,
  type SourceTextReader,
} from '../ports/SourceTextReader.js';
import { StackTraceErrorTracesReader } from './StackTraceErrorTracesReader.js';

describe(StackTraceErrorTracesReader, () => {
  describe('.read', () => {
    describe('having a stack whose file can be read', () => {
      let filesFixture: Map<string, SourceText>;
      let reader: StackTraceErrorTracesReader;
      let sourceFixture: string;

      beforeAll(() => {
        sourceFixture =
          "const first=1;const second=2;throw new Error('boom');const fourth=4;const fifth=5;\n";
        filesFixture = new Map([
          [
            '/app/bundle.js',
            {
              path: '/app/bundle.js',
              source: sourceFixture,
              version: '1',
            },
          ],
        ]);
        reader = tracesReader(sourceReaderFrom(filesFixture));
      });

      describe('when called with a plain error object', () => {
        let result: readonly ErrorTrace[] | null;

        beforeAll(async () => {
          const column: number = sourceFixture.indexOf('throw') + 1;

          result = await reader.read({
            message: 'boom',
            stack: `Error: boom\n    at bundled (/app/bundle.js:1:${String(column)})\n`,
          });
        });

        it('should return the statements around that column', () => {
          expect(result).toStrictEqual([
            {
              location: {
                column: sourceFixture.indexOf('throw') + 1,
                file: '/app/bundle.js',
                filename: 'bundle.js',
                functionName: 'bundled',
                line: 1,
              },
              nextStatements: ['const fourth=4;', 'const fifth=5;'],
              previousStatements: ['const first=1;', 'const second=2;'],
              traceStatement: "throw new Error('boom');",
            },
          ]);
        });
      });

      describe('when called with a file URL and an unreadable frame', () => {
        let result: readonly ErrorTrace[] | null;

        beforeAll(async () => {
          const column: number = sourceFixture.indexOf('throw') + 1;
          const fileUrl: string = pathToFileURL('/app/bundle.js').href;

          filesFixture.set('/app/bundle.js', {
            path: '/app/bundle.js',
            source: sourceFixture,
            version: '1',
          });

          result = await reader.read({
            stack: [
              'Error: boom',
              '    at nativeMethod (native)',
              `    at bundled (${fileUrl}:1:${String(column)})`,
              '    at missing (/app/missing.js:1:1)',
              '',
            ].join('\n'),
          });
        });

        it('should keep only the frame whose statements can be read', () => {
          expect(result).toHaveLength(1);
          expect(result?.[0]?.traceStatement).toBe("throw new Error('boom');");
          expect(result?.[0]?.location.file).toBe('/app/bundle.js');
        });
      });

      describe('when called again before the file version changes', () => {
        let result: readonly ErrorTrace[] | null;

        beforeAll(async () => {
          const column: number = sourceFixture.indexOf('throw') + 1;

          filesFixture.set('/app/bundle.js', {
            path: '/app/bundle.js',
            source: 'throw new Error("changed");\n',
            version: '1',
          });
          result = await reader.read({
            stack: `Error: boom\n    at bundled (/app/bundle.js:1:${String(column)})\n`,
          });
        });

        it('should keep the statements from the cached parse', () => {
          expect(result?.[0]?.traceStatement).toBe("throw new Error('boom');");
        });
      });

      describe('when called after the file version changes', () => {
        let result: readonly ErrorTrace[] | null;

        beforeAll(async () => {
          filesFixture.set('/app/bundle.js', {
            path: '/app/bundle.js',
            source: 'throw new Error("changed");\n',
            version: '2',
          });
          result = await reader.read({
            stack: 'Error: boom\n    at bundled (/app/bundle.js:1:1)\n',
          });
        });

        it('should read the new statements', () => {
          expect(result?.[0]?.traceStatement).toBe(
            'throw new Error("changed");',
          );
        });
      });
    });

    describe('having an error without a stack', () => {
      let reader: StackTraceErrorTracesReader;

      beforeAll(() => {
        reader = tracesReader(sourceReaderFrom(new Map()));
      });

      describe('when called', () => {
        let result: readonly ErrorTrace[] | null;

        beforeAll(async () => {
          result = await reader.read({
            message: 'boom',
          });
        });

        it('should return null', () => {
          expect(result).toBeNull();
        });
      });
    });

    describe('having a real V8 stack', () => {
      let directoryFixture: string;
      let reader: StackTraceErrorTracesReader;

      beforeAll(async () => {
        directoryFixture = await mkdtemp(join(tmpdir(), 'insights-stack-'));
        reader = tracesReader(new NodeSourceTextReader());
      });

      afterAll(async () => {
        await rm(directoryFixture, {
          force: true,
          recursive: true,
        });
      });

      describe('when called', () => {
        let result: readonly ErrorTrace[] | null;

        beforeAll(async () => {
          const filePath: string = join(directoryFixture, 'bundle.js');

          await writeFile(
            filePath,
            [
              'function bundled() {',
              "  const first = 1; const second = 2; throw new Error('bundled'); const fourth = 4; const fifth = 5;",
              '}',
              'try {',
              '  bundled();',
              '} catch (error) {',
              '  process.stdout.write(error.stack ?? "");',
              '}',
              '',
            ].join('\n'),
            'utf8',
          );

          const child: SpawnSyncReturns<string> = spawnSync(
            process.execPath,
            [filePath],
            {
              encoding: 'utf8',
            },
          );

          if (typeof child.stdout !== 'string' || child.status !== 0) {
            throw new Error(
              child.stderr.length > 0
                ? child.stderr
                : 'Failed to capture a stack.',
            );
          }

          result = await reader.read({
            stack: child.stdout,
          });
        });

        it('should capture the bundled statements around the throw', () => {
          const trace: ErrorTrace | undefined = result?.find(
            (item: ErrorTrace): boolean =>
              item.traceStatement.includes('throw new Error'),
          );

          expect(trace).toMatchObject({
            nextStatements: ['const fourth = 4;', 'const fifth = 5;'],
            previousStatements: ['  const first = 1;', 'const second = 2;'],
            traceStatement: "throw new Error('bundled');",
          });
        });
      });

      describe('when called with a caused error', () => {
        let result: readonly ErrorTrace[] | null;

        beforeAll(async () => {
          const filePath: string = join(directoryFixture, 'cause.js');

          await writeFile(
            filePath,
            [
              'function inner() {',
              '  const first = 1;',
              '  const second = 2;',
              "  throw new Error('inner');",
              '  const fourth = 4;',
              '  const fifth = 5;',
              '}',
              'function outer() {',
              '  try {',
              '    inner();',
              '  } catch (caught) {',
              "    throw new Error('outer', { cause: caught });",
              '  }',
              '}',
              'try {',
              '  outer();',
              '} catch (error) {',
              '  const cause = error instanceof Error ? error.cause : undefined;',
              '  process.stdout.write(',
              '    JSON.stringify({',
              '      causeStack: cause instanceof Error ? cause.stack ?? null : null,',
              '      stack: error instanceof Error ? error.stack ?? null : null,',
              '    }),',
              '  );',
              '}',
              '',
            ].join('\n'),
            'utf8',
          );

          const child: SpawnSyncReturns<string> = spawnSync(
            process.execPath,
            [filePath],
            {
              encoding: 'utf8',
            },
          );

          if (typeof child.stdout !== 'string' || child.status !== 0) {
            throw new Error(
              child.stderr.length > 0
                ? child.stderr
                : 'Failed to capture a stack.',
            );
          }

          const captured: CapturedCause = readCapturedCause(child.stdout);
          const cause: Error = new Error('inner');

          cause.stack = captured.causeStack;

          const error: Error = new Error('outer', {
            cause,
          });

          error.stack = captured.stack;
          result = await reader.read(error);
        });

        it('should parse the outer stack before the cause stack', () => {
          const statements: readonly string[] = requireTraces(result).map(
            (trace: ErrorTrace): string => trace.traceStatement,
          );
          const outerIndex: number = statements.findIndex(
            (statement: string): boolean =>
              statement.includes("throw new Error('outer'"),
          );
          const innerIndex: number = statements.findIndex(
            (statement: string): boolean =>
              statement.includes("throw new Error('inner'"),
          );

          expect(outerIndex).toBeGreaterThanOrEqual(0);
          expect(innerIndex).toBeGreaterThan(outerIndex);
        });

        it('should keep the statements around the caused throw', () => {
          const trace: ErrorTrace | undefined = result?.find(
            (item: ErrorTrace): boolean =>
              item.traceStatement.includes("throw new Error('inner')"),
          );

          expect(trace).toMatchObject({
            nextStatements: ['  const fourth = 4;', '  const fifth = 5;'],
            previousStatements: ['  const first = 1;', '  const second = 2;'],
            traceStatement: "  throw new Error('inner');",
          });
        });
      });
    });

    describe('having an error cause and a readable file', () => {
      const filePath: string = '/app/cause.js';
      let fifthColumn: number;
      let fourthColumn: number;
      let reader: StackTraceErrorTracesReader;
      let throwColumn: number;

      beforeAll(() => {
        const source: string =
          "const first=1;const second=2;throw new Error('boom');const fourth=4;const fifth=5;\n";

        throwColumn = source.indexOf('throw') + 1;
        fourthColumn = source.indexOf('const fourth') + 1;
        fifthColumn = source.indexOf('const fifth') + 1;
        reader = readerFor(filePath, source);
      });

      describe('when called with a cause chain', () => {
        let result: readonly ErrorTrace[] | null;

        beforeAll(async () => {
          const root: Error = new Error('root');

          root.stack = stackAt(filePath, 'rootFn', fifthColumn);

          const middle: Error = new Error('middle', {
            cause: root,
          });

          middle.stack = stackAt(filePath, 'middleFn', fourthColumn);

          const outer: Error = new Error('outer', {
            cause: middle,
          });

          outer.stack = stackAt(filePath, 'outerFn', throwColumn);
          result = await reader.read(outer);
        });

        it('should parse each error stack from the outside in', () => {
          expect(
            result?.map((trace: ErrorTrace): string => trace.traceStatement),
          ).toStrictEqual([
            "throw new Error('boom');",
            'const fourth=4;',
            'const fifth=5;',
          ]);
        });
      });

      describe('when called with a cause cycle', () => {
        let result: readonly ErrorTrace[] | null;

        beforeAll(async () => {
          const outer: Error = new Error('outer');
          const cause: Error = new Error('cause');

          outer.stack = stackAt(filePath, 'outerFn', throwColumn);
          cause.stack = stackAt(filePath, 'causeFn', fourthColumn);
          outer.cause = cause;
          cause.cause = outer;
          result = await reader.read(outer);
        });

        it('should parse each error once', () => {
          expect(
            result?.map((trace: ErrorTrace): string => trace.traceStatement),
          ).toStrictEqual(["throw new Error('boom');", 'const fourth=4;']);
        });
      });

      describe('when called with a cause that is not an error', () => {
        let result: readonly ErrorTrace[] | null;

        beforeAll(async () => {
          const root: Error = new Error('root');
          const outer: Error = new Error('outer');

          root.stack = stackAt(filePath, 'rootFn', fifthColumn);
          outer.stack = stackAt(filePath, 'outerFn', throwColumn);
          outer.cause = {
            cause: root,
            stack: stackAt(filePath, 'causeFn', fourthColumn),
          };
          result = await reader.read(outer);
        });

        it('should parse only that error', () => {
          expect(
            result?.map((trace: ErrorTrace): string => trace.traceStatement),
          ).toStrictEqual(["throw new Error('boom');"]);
        });
      });

      describe('when called with a cause that has no stack', () => {
        let result: readonly ErrorTrace[] | null;

        beforeAll(async () => {
          const root: Error = new Error('root');

          root.stack = stackAt(filePath, 'rootFn', fifthColumn);

          const middle: Error = new Error('middle', {
            cause: root,
          });

          middle.stack = '';

          const outer: Error = new Error('outer', {
            cause: middle,
          });

          outer.stack = stackAt(filePath, 'outerFn', throwColumn);
          result = await reader.read(outer);
        });

        it('should continue with the next cause', () => {
          expect(
            result?.map((trace: ErrorTrace): string => trace.traceStatement),
          ).toStrictEqual(["throw new Error('boom');", 'const fifth=5;']);
        });
      });
    });

    describe('having a stack file with a source map to TypeScript', () => {
      let result: readonly ErrorTrace[] | null;

      beforeAll(async () => {
        const generatedPath: string = '/app/dist/bundle.js';
        const generatedSource: string =
          "const first=1;throw new Error('boom');const fourth=4;\n//# sourceMappingURL=bundle.js.map\n";
        const column: number = generatedSource.indexOf('throw') + 1;

        result = await readTrace({
          column,
          files: new Map([
            [
              generatedPath,
              {
                path: generatedPath,
                source: generatedSource,
                version: '1',
              },
            ],
            [
              '/app/dist/bundle.js.map',
              {
                path: '/app/dist/bundle.js.map',
                source: readSourceMap({
                  mappings: readMappings(
                    generatedSource.indexOf('throw'),
                    0,
                    "const first: number=1;throw new Error('boom');const fourth: number=4;\n".indexOf(
                      'throw',
                    ),
                  ),
                  sources: ['../src/handler.ts'],
                  sourcesContent: [
                    "const first: number=1;throw new Error('boom');const fourth: number=4;\n",
                  ],
                }),
                version: '1',
              },
            ],
          ]),
          functionName: 'bundled',
          line: 1,
          stackPath: generatedPath,
        });
      });

      it('should return the TypeScript statements at the original column', () => {
        expect(result).toStrictEqual([
          {
            location: {
              column: 23,
              file: '/app/src/handler.ts',
              filename: 'handler.ts',
              functionName: 'bundled',
              line: 1,
            },
            nextStatements: ['const fourth: number=4;'],
            previousStatements: ['const first: number=1;'],
            traceStatement: "throw new Error('boom');",
          },
        ]);
      });
    });

    describe('having a source map through an intermediate file', () => {
      let result: readonly ErrorTrace[] | null;

      beforeAll(async () => {
        const original: string = [
          'export function handle(): void {',
          "  throw new Error('original');",
          '}',
          '',
        ].join('\n');
        const originalMap: string = readSourceMap({
          mappings: 'AACE',
          sources: ['../src/handler.ts'],
          sourcesContent: [original],
        });
        const intermediate: string = `throw new Error('intermediate');\n//# sourceMappingURL=data:application/json;base64,${Buffer.from(originalMap).toString('base64')}\n`;
        const generatedPath: string = '/app/dist/bundle.js';

        result = await readTrace({
          column: 1,
          files: new Map([
            [
              generatedPath,
              {
                path: generatedPath,
                source:
                  "throw new Error('bundled');\n//# sourceMappingURL=bundle.js.map\n",
                version: '1',
              },
            ],
            [
              '/app/dist/bundle.js.map',
              {
                path: '/app/dist/bundle.js.map',
                source: readSourceMap({
                  mappings: 'AAAA',
                  sources: ['intermediate.js'],
                  sourcesContent: [intermediate],
                }),
                version: '1',
              },
            ],
          ]),
          functionName: 'bundled',
          line: 1,
          stackPath: generatedPath,
        });
      });

      it('should return the statements from the last TypeScript source', () => {
        expect(result).toStrictEqual([
          {
            location: {
              column: 3,
              file: '/app/src/handler.ts',
              filename: 'handler.ts',
              functionName: 'bundled',
              line: 2,
            },
            nextStatements: [],
            previousStatements: ['export', 'function handle(): void'],
            traceStatement: "  throw new Error('original');",
          },
        ]);
      });
    });

    describe('having a source map that only reaches JavaScript', () => {
      let result: readonly ErrorTrace[] | null;

      beforeAll(async () => {
        const generatedPath: string = '/app/dist/bundle.js';

        result = await readTrace({
          column: 1,
          files: new Map([
            [
              generatedPath,
              {
                path: generatedPath,
                source:
                  "throw new Error('bundled');\n//# sourceMappingURL=bundle.js.map\n",
                version: '1',
              },
            ],
            [
              '/app/dist/bundle.js.map',
              {
                path: '/app/dist/bundle.js.map',
                source: readSourceMap({
                  mappings: 'AAAA',
                  sources: ['library.js'],
                  sourcesContent: ["throw new Error('library');\n"],
                }),
                version: '1',
              },
            ],
          ]),
          functionName: 'bundled',
          line: 1,
          stackPath: generatedPath,
        });
      });

      it('should keep the statements from the stack file', () => {
        expect(result).toStrictEqual([
          {
            location: {
              column: 1,
              file: '/app/dist/bundle.js',
              filename: 'bundle.js',
              functionName: 'bundled',
              line: 1,
            },
            nextStatements: [],
            previousStatements: [],
            traceStatement: "throw new Error('bundled');",
          },
        ]);
      });
    });
  });
});

interface CapturedCause {
  readonly causeStack: string;
  readonly stack: string;
}

function requireTraces(
  traces: readonly ErrorTrace[] | null,
): readonly ErrorTrace[] {
  if (traces === null) {
    throw new Error('Expected error traces');
  }

  return traces;
}

function readCapturedCause(stdout: string): CapturedCause {
  const parsed: unknown = JSON.parse(stdout);

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Failed to capture a cause stack.');
  }

  const record: Record<string, unknown> = parsed as Record<string, unknown>;
  const causeStack: unknown = record['causeStack'];
  const stack: unknown = record['stack'];

  if (typeof causeStack !== 'string' || typeof stack !== 'string') {
    throw new Error('Failed to capture a cause stack.');
  }

  return {
    causeStack,
    stack,
  };
}

const VLQ_CHARACTERS: string =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

interface TraceRead {
  readonly column: number;
  readonly files: ReadonlyMap<string, SourceText>;
  readonly functionName: string;
  readonly line: number;
  readonly stackPath: string;
}

function readerFor(
  filePath: string,
  source: string,
): StackTraceErrorTracesReader {
  return tracesReader(
    sourceReaderFrom(
      new Map([
        [
          filePath,
          {
            path: filePath,
            source,
            version: '1',
          },
        ],
      ]),
    ),
  );
}

function stackAt(
  filePath: string,
  functionName: string,
  column: number,
): string {
  return `Error: boom\n    at ${functionName} (${filePath}:1:${String(column)})\n`;
}

function sourceReaderFrom(
  files: ReadonlyMap<string, SourceText>,
): SourceTextReader {
  return {
    async read(filePath: string): Promise<SourceText | null> {
      return files.get(filePath) ?? null;
    },
  };
}

function readMappings(
  generatedColumn: number,
  originalLine: number,
  originalColumn: number,
): string {
  return `${readVlq(generatedColumn)}${readVlq(0)}${readVlq(originalLine)}${readVlq(originalColumn)}`;
}

function readSourceMap(input: {
  readonly mappings: string;
  readonly sources: readonly string[];
  readonly sourcesContent?: readonly string[];
}): string {
  return JSON.stringify({
    file: 'bundle.js',
    mappings: input.mappings,
    names: [],
    sourceRoot: '',
    sources: input.sources,
    sourcesContent: input.sourcesContent,
    version: 3,
  });
}

async function readTrace(
  request: TraceRead,
): Promise<readonly ErrorTrace[] | null> {
  return tracesReader(sourceReaderFrom(request.files)).read({
    stack: `Error: boom\n    at ${request.functionName} (${request.stackPath}:${String(request.line)}:${String(request.column)})\n`,
  });
}

function readVlq(value: number): string {
  let vlq: number = value < 0 ? (-value << 1) | 1 : value << 1;
  let encoded: string = '';

  do {
    let digit: number = vlq & 31;

    vlq >>>= 5;

    if (vlq > 0) {
      digit |= 32;
    }

    encoded += VLQ_CHARACTERS.charAt(digit);
  } while (vlq > 0);

  return encoded;
}

function tracesReader(
  sourceTextReader: SourceTextReader,
): StackTraceErrorTracesReader {
  return new StackTraceErrorTracesReader(
    sourceTextReader,
    new NodeSourceMapReader(sourceTextReader),
  );
}
