import { extname } from 'node:path';

import { parse } from '@babel/parser';

const LINE_FEED: number = 10;

type ParserPlugins = NonNullable<
  NonNullable<Parameters<typeof parse>[1]>['plugins']
>;

export interface CodeSpan {
  readonly end: number;
  readonly start: number;
}

export interface IndexedStatement {
  readonly end: number;
  readonly index: number;
  readonly start: number;
}

interface SyntaxNode {
  readonly [key: string]: unknown;
  readonly end: number;
  readonly start: number;
  readonly type: string;
}

export interface StatementIndex {
  readonly lineStarts: readonly number[];
  readonly lists: readonly (readonly IndexedStatement[])[];
  readonly source: string;
  readonly spans: readonly CodeSpan[];
}

export function buildStatementIndex(
  source: string,
  filePath: string,
): StatementIndex | null {
  try {
    const lists: IndexedStatement[][] = [];
    const spans: CodeSpan[] = [];
    const spanKeys: Set<string> = new Set<string>();

    walk(
      parse(source, {
        allowAwaitOutsideFunction: true,
        allowImportExportEverywhere: true,
        allowNewTargetOutsideFunction: true,
        allowReturnOutsideFunction: true,
        allowSuperOutsideMethod: true,
        allowUndeclaredExports: true,
        allowYieldOutsideFunction: true,
        attachComment: false,
        errorRecovery: false,
        plugins: readParserPlugins(filePath),
        sourceType: 'unambiguous',
        strictMode: false,
      }),
      lists,
      spans,
      spanKeys,
    );

    return {
      lineStarts: readLineStarts(source),
      lists,
      source,
      spans,
    };
  } catch (_error: unknown) {
    return null;
  }
}

function collectBoundaries(boundaries: SyntaxNode[], value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectBoundaries(boundaries, item);
    }

    return;
  }

  if (isSyntaxNode(value) && isBoundary(value)) {
    boundaries.push(value);
  }
}

function compareBoundaryOrder(left: SyntaxNode, right: SyntaxNode): number {
  return left.start - right.start || left.end - right.end;
}

function isBodyPart(node: SyntaxNode): boolean {
  if (readStatementList(node) !== null) {
    return true;
  }

  return (
    node.type.endsWith('Declaration') ||
    node.type.endsWith('Statement') ||
    node.type === 'ClassBody'
  );
}

function isBoundary(node: SyntaxNode): boolean {
  return isBodyPart(node) || node.type === 'CatchClause';
}

function isSyntaxNode(value: unknown): value is SyntaxNode {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record: Record<string, unknown> = value as Record<string, unknown>;

  return (
    typeof record['end'] === 'number' &&
    typeof record['start'] === 'number' &&
    typeof record['type'] === 'string'
  );
}

function pushBoundarySpans(
  spans: CodeSpan[],
  spanKeys: Set<string>,
  node: SyntaxNode,
): void {
  const boundaries: readonly SyntaxNode[] = readBoundaries(node);
  let previous: SyntaxNode | null = null;

  for (const boundary of boundaries) {
    if (previous === null) {
      pushSpan(spans, spanKeys, node.start, boundary.start);
    } else {
      pushSpan(spans, spanKeys, previous.end, boundary.start);
    }

    previous = boundary;
  }
}

function pushSpan(
  spans: CodeSpan[],
  spanKeys: Set<string>,
  start: number,
  end: number,
): void {
  if (end <= start) {
    return;
  }

  const key: string = `${String(start)}:${String(end)}`;

  if (spanKeys.has(key)) {
    return;
  }

  spanKeys.add(key);
  spans.push({
    end,
    start,
  });
}

function readBoundaries(node: SyntaxNode): readonly SyntaxNode[] {
  const boundaries: SyntaxNode[] = [];

  for (const child of Object.values(node)) {
    collectBoundaries(boundaries, child);
  }

  return boundaries.sort(compareBoundaryOrder);
}

function readLineStarts(source: string): readonly number[] {
  const lineStarts: number[] = [0];

  for (let index: number = 0; index < source.length; index += 1) {
    if (source.charCodeAt(index) === LINE_FEED) {
      lineStarts.push(index + 1);
    }
  }

  return lineStarts;
}

function readParserPlugins(filePath: string): ParserPlugins {
  switch (extname(filePath)) {
    case '.cts':
    case '.mts':
    case '.ts':
      return [['typescript', {}], 'decorators-legacy'];
    case '.jsx':
      return ['jsx'];
    case '.tsx':
      return [['typescript', {}], 'decorators-legacy', 'jsx'];
    default:
      return [];
  }
}

function readStatementList(node: SyntaxNode): readonly SyntaxNode[] | null {
  switch (node.type) {
    case 'BlockStatement':
    case 'Program':
    case 'StaticBlock':
    case 'TSModuleBlock':
      return readStatementNodes(node['body']);
    case 'SwitchCase':
      return readStatementNodes(node['consequent']);
    default:
      return null;
  }
}

function readStatementNodes(value: unknown): readonly SyntaxNode[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const statements: SyntaxNode[] = [];

  for (const item of value) {
    if (!isSyntaxNode(item) || item.end <= item.start) {
      continue;
    }

    statements.push(item);
  }

  return statements;
}

function walk(
  value: unknown,
  lists: IndexedStatement[][],
  spans: CodeSpan[],
  spanKeys: Set<string>,
): void {
  if (!isSyntaxNode(value)) {
    return;
  }

  const statements: readonly SyntaxNode[] | null = readStatementList(value);

  if (statements !== null) {
    lists.push(
      statements.map(
        (statement: SyntaxNode, index: number): IndexedStatement => ({
          end: statement.end,
          index,
          start: statement.start,
        }),
      ),
    );

    for (const statement of statements) {
      pushSpan(spans, spanKeys, statement.start, statement.end);
    }

    const firstStatement: SyntaxNode | undefined = statements[0];

    if (firstStatement !== undefined) {
      pushSpan(spans, spanKeys, value.start, firstStatement.start);
    }
  } else {
    pushBoundarySpans(spans, spanKeys, value);
  }

  for (const child of Object.values(value)) {
    if (Array.isArray(child)) {
      for (const item of child) {
        walk(item, lists, spans, spanKeys);
      }

      continue;
    }

    walk(child, lists, spans, spanKeys);
  }
}
