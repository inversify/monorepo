import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

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
        reader = new StackTraceErrorTracesReader(
          sourceReaderFrom(filesFixture),
        );
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
        reader = new StackTraceErrorTracesReader(sourceReaderFrom(new Map()));
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
        reader = new StackTraceErrorTracesReader(new NodeSourceTextReader());
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
            previousStatements: ['const first = 1;', 'const second = 2;'],
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
          const statements: readonly string[] = (result ?? []).map(
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
            nextStatements: ['const fourth = 4;', 'const fifth = 5;'],
            previousStatements: ['const first = 1;', 'const second = 2;'],
            traceStatement: "throw new Error('inner');",
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
  });
});

interface CapturedCause {
  readonly causeStack: string;
  readonly stack: string;
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

function readerFor(
  filePath: string,
  source: string,
): StackTraceErrorTracesReader {
  return new StackTraceErrorTracesReader(
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
