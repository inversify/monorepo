import { beforeAll, describe, expect, it } from 'vitest';

import {
  buildStatementIndex,
  readStatementContext,
  type StatementContext,
  type StatementIndex,
} from './statementIndex.js';

describe(buildStatementIndex, () => {
  describe('having source that is not valid JavaScript', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildStatementIndex('const =', 'handler.js');
      });

      it('should return null', () => {
        expect(result).toBeNull();
      });
    });
  });
});

describe(readStatementContext, () => {
  describe('having several statements on one line', () => {
    let sourceFixture: string;

    beforeAll(() => {
      sourceFixture =
        "const first=1;const second=2;throw new Error('boom');const fourth=4;const fifth=5;\n";
    });

    describe('when called at the throw', () => {
      let result: StatementContext | null;

      beforeAll(() => {
        result = readContext(sourceFixture, 'bundle.js', 'throw');
      });

      it('should return the throw and the two statements on each side', () => {
        expect(result).toStrictEqual({
          nextStatements: ['const fourth=4;', 'const fifth=5;'],
          previousStatements: ['const first=1;', 'const second=2;'],
          traceStatement: "throw new Error('boom');",
        });
      });
    });
  });

  describe('having a throw nested inside a function', () => {
    let sourceFixture: string;

    beforeAll(() => {
      sourceFixture = [
        'function outer() {',
        '  const before = 1;',
        '  function inner() {',
        '    const first = 1;',
        '    const second = 2;',
        "    throw new Error('boom');",
        '    const fourth = 4;',
        '  }',
        '  const after = 2;',
        '}',
        '',
      ].join('\n');
    });

    describe('when called at the throw', () => {
      let result: StatementContext | null;

      beforeAll(() => {
        result = readContext(sourceFixture, 'handler.js', 'throw');
      });

      it('should use the statements inside the inner function', () => {
        expect(result).toStrictEqual({
          nextStatements: ['const fourth = 4;'],
          previousStatements: ['const first = 1;', 'const second = 2;'],
          traceStatement: "throw new Error('boom');",
        });
      });
    });

    describe('when called in the space before the throw', () => {
      let result: StatementContext | null;

      beforeAll(() => {
        result = readContext(sourceFixture, 'handler.js', 'throw', 1);
      });

      it('should use the statements inside the inner function', () => {
        expect(result).toStrictEqual({
          nextStatements: ['const fourth = 4;'],
          previousStatements: ['const first = 1;', 'const second = 2;'],
          traceStatement: "throw new Error('boom');",
        });
      });
    });

    describe('when called inside the throw expression', () => {
      let result: StatementContext | null;

      beforeAll(() => {
        result = readContext(sourceFixture, 'handler.js', 'new');
      });

      it('should keep the throw and the statements beside it', () => {
        expect(result).toStrictEqual({
          nextStatements: ['const fourth = 4;'],
          previousStatements: ['const first = 1;', 'const second = 2;'],
          traceStatement: "throw new Error('boom');",
        });
      });
    });

    describe('when called at the function keyword', () => {
      let result: StatementContext | null;

      beforeAll(() => {
        result = readContext(sourceFixture, 'handler.js', 'function inner');
      });

      it('should keep the function and the code before it', () => {
        expect(result?.nextStatements).toStrictEqual(['const after = 2;']);
        expect(result?.previousStatements).toStrictEqual([
          'function outer()',
          'const before = 1;',
        ]);
        expect(result?.traceStatement.startsWith('function inner()')).toBe(
          true,
        );
      });
    });
  });

  describe('having no statements before the trace', () => {
    let sourceFixture: string;

    beforeAll(() => {
      sourceFixture = [
        "throw new Error('boom');",
        'const next = 1;',
        'const after = 2;',
        '',
      ].join('\n');
    });

    describe('when called at the throw', () => {
      let result: StatementContext | null;

      beforeAll(() => {
        result = readContext(sourceFixture, 'handler.js', 'throw');
      });

      it('should return an empty previous list and the next two statements', () => {
        expect(result).toStrictEqual({
          nextStatements: ['const next = 1;', 'const after = 2;'],
          previousStatements: [],
          traceStatement: "throw new Error('boom');",
        });
      });
    });
  });

  describe('having one statement before the trace', () => {
    let sourceFixture: string;

    beforeAll(() => {
      sourceFixture = [
        'const first = 1;',
        "throw new Error('boom');",
        'const third = 3;',
        '',
      ].join('\n');
    });

    describe('when called at the throw', () => {
      let result: StatementContext | null;

      beforeAll(() => {
        result = readContext(sourceFixture, 'handler.js', 'throw');
      });

      it('should return that single previous statement', () => {
        expect(result).toStrictEqual({
          nextStatements: ['const third = 3;'],
          previousStatements: ['const first = 1;'],
          traceStatement: "throw new Error('boom');",
        });
      });
    });
  });

  describe('having a TypeScript source file', () => {
    let sourceFixture: string;

    beforeAll(() => {
      sourceFixture = [
        'export function handle(value: string): void {',
        '  const first: number = 1;',
        '  const second: number = 2;',
        '  throw new Error(value);',
        '  const fourth: number = 4;',
        '}',
        '',
      ].join('\n');
    });

    describe('when called at the throw', () => {
      let result: StatementContext | null;

      beforeAll(() => {
        result = readContext(sourceFixture, 'handler.ts', 'throw');
      });

      it('should return the TypeScript statements around the throw', () => {
        expect(result).toStrictEqual({
          nextStatements: ['const fourth: number = 4;'],
          previousStatements: [
            'const first: number = 1;',
            'const second: number = 2;',
          ],
          traceStatement: 'throw new Error(value);',
        });
      });
    });
  });

  describe('having a statement longer than the stored window', () => {
    let sourceFixture: string;

    beforeAll(() => {
      sourceFixture = `const value = '${'a'.repeat(400)}FOCUS_TOKEN${'b'.repeat(400)}';\n`;
    });

    describe('when called at the focus token', () => {
      let result: StatementContext;

      beforeAll(() => {
        const context: StatementContext | null = readContext(
          sourceFixture,
          'bundle.js',
          'FOCUS_TOKEN',
        );

        if (context === null) {
          throw new Error('Expected a statement context.');
        }

        result = context;
      });

      it('should keep the focus token and shorten the statement', () => {
        expect(result.traceStatement).toContain('FOCUS_TOKEN');
        expect(result.traceStatement.startsWith('…')).toBe(true);
        expect(result.traceStatement.endsWith('…')).toBe(true);
        expect(result.traceStatement.length).toBeLessThan(sourceFixture.length);
      });
    });
  });

  describe('having a blank line before the trace', () => {
    let sourceFixture: string;

    beforeAll(() => {
      sourceFixture = [
        'const first = 1;',
        '',
        "throw new Error('boom');",
        'const third = 3;',
        '',
      ].join('\n');
    });

    describe('when called on that blank line', () => {
      let result: StatementContext | null;

      beforeAll(() => {
        const index: StatementIndex | null = buildStatementIndex(
          sourceFixture,
          'handler.js',
        );

        if (index === null) {
          throw new Error('Expected the source to parse.');
        }

        const line: number =
          sourceFixture
            .split('\n')
            .findIndex((lineText: string): boolean => lineText.length === 0) +
          1;

        result = readStatementContext(index, line, 1);
      });

      it('should use the statement that follows the blank line', () => {
        expect(result).toStrictEqual({
          nextStatements: ['const third = 3;'],
          previousStatements: ['const first = 1;'],
          traceStatement: "throw new Error('boom');",
        });
      });
    });
  });

  describe('having a decorated TypeScript method', () => {
    let sourceFixture: string;

    beforeAll(() => {
      sourceFixture = [
        '@Controller("/warriors")',
        'export class WarriorsController {',
        '  @Get()',
        '  public get(@Param() id: string): void {',
        '    const first = 1;',
        '    const second = 2;',
        "    throw new Error('boom');",
        '    const fourth = 4;',
        '    const fifth = 5;',
        '  }',
        '}',
        '',
      ].join('\n');
    });

    describe('when called in the space before the throw', () => {
      let result: StatementContext | null;

      beforeAll(() => {
        result = readContext(sourceFixture, 'handler.ts', 'throw', 1);
      });

      it('should use the statements inside the method', () => {
        expect(result).toStrictEqual({
          nextStatements: ['const fourth = 4;', 'const fifth = 5;'],
          previousStatements: ['const first = 1;', 'const second = 2;'],
          traceStatement: "throw new Error('boom');",
        });
      });
    });
  });

  describe('having a throw as the only statement in a case', () => {
    let sourceFixture: string;

    beforeAll(() => {
      sourceFixture = [
        'function catchError(error) {',
        '  switch (error.kind) {',
        '    case Kind.failed:',
        '      throw new Error(error.message);',
        '    default:',
        '      throw new Error("other");',
        '  }',
        '}',
        '',
      ].join('\n');
    });

    describe('when called at the throw', () => {
      let result: StatementContext | null;

      beforeAll(() => {
        result = readContext(
          sourceFixture,
          'handler.js',
          'throw new Error(error',
        );
      });

      it('should include the code before the throw', () => {
        expect(result).toStrictEqual({
          nextStatements: [],
          previousStatements: ['switch (error.kind) {', 'case Kind.failed:'],
          traceStatement: 'throw new Error(error.message);',
        });
      });
    });
  });

  describe('having a throw in an else branch', () => {
    let sourceFixture: string;

    beforeAll(() => {
      sourceFixture = [
        'function run(flag) {',
        '  if (flag) {',
        '    doA();',
        '  } else {',
        '    throw new Error("boom");',
        '  }',
        '}',
        '',
      ].join('\n');
    });

    describe('when called at the throw', () => {
      let result: StatementContext | null;

      beforeAll(() => {
        result = readContext(sourceFixture, 'handler.js', 'throw');
      });

      it('should include the else before the throw', () => {
        expect(result).toStrictEqual({
          nextStatements: [],
          previousStatements: ['doA();', 'else'],
          traceStatement: 'throw new Error("boom");',
        });
      });
    });
  });

  describe('having a throw in an else if branch', () => {
    let sourceFixture: string;

    beforeAll(() => {
      sourceFixture = [
        'function run(flag) {',
        '  if (flag) {',
        '    doA();',
        '  } else if (other) {',
        '    throw new Error("boom");',
        '  }',
        '}',
        '',
      ].join('\n');
    });

    describe('when called at the throw', () => {
      let result: StatementContext | null;

      beforeAll(() => {
        result = readContext(sourceFixture, 'handler.js', 'throw');
      });

      it('should include the else and the following condition', () => {
        expect(result).toStrictEqual({
          nextStatements: [],
          previousStatements: ['else', 'if (other)'],
          traceStatement: 'throw new Error("boom");',
        });
      });
    });
  });

  describe('having a throw in a finally block', () => {
    let sourceFixture: string;

    beforeAll(() => {
      sourceFixture = [
        'function run() {',
        '  try {',
        '    read();',
        '  } finally {',
        '    throw new Error("boom");',
        '  }',
        '}',
        '',
      ].join('\n');
    });

    describe('when called at the throw', () => {
      let result: StatementContext | null;

      beforeAll(() => {
        result = readContext(sourceFixture, 'handler.js', 'throw');
      });

      it('should include the finally before the throw', () => {
        expect(result).toStrictEqual({
          nextStatements: [],
          previousStatements: ['read();', 'finally'],
          traceStatement: 'throw new Error("boom");',
        });
      });
    });
  });

  describe('having a column past the end of the line', () => {
    describe('when called', () => {
      let result: StatementContext | null;

      beforeAll(() => {
        const index: StatementIndex | null = buildStatementIndex(
          "throw new Error('boom');\n",
          'handler.js',
        );

        if (index === null) {
          throw new Error('Expected the source to parse.');
        }

        result = readStatementContext(index, 1, 500);
      });

      it('should return null', () => {
        expect(result).toBeNull();
      });
    });
  });
});

function readContext(
  source: string,
  filePath: string,
  needle: string,
  column?: number,
): StatementContext | null {
  const index: StatementIndex | null = buildStatementIndex(source, filePath);

  if (index === null) {
    throw new Error('Expected the source to parse.');
  }

  const offset: number = source.indexOf(needle);

  if (offset < 0) {
    throw new Error(`Expected to find "${needle}".`);
  }

  const before: string = source.slice(0, offset);
  const line: number = before.split('\n').length;
  const lineStart: number = before.lastIndexOf('\n') + 1;
  const resolvedColumn: number = column ?? offset - lineStart + 1;

  return readStatementContext(index, line, resolvedColumn);
}
