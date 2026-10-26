import { extname } from 'node:path';

import { parse } from '@babel/parser';

const CONTEXT_STATEMENT_COUNT: number = 2;
const ELLIPSIS: string = '…';
const LINE_FEED: number = 10;
const MAX_STATEMENT_TEXT_LENGTH: number = 500;
const STATEMENT_TEXT_CENTER_DIVISOR: number = 2;

type ParserPlugins = NonNullable<
  NonNullable<Parameters<typeof parse>[1]>['plugins']
>;

interface CodeSpan {
  readonly end: number;
  readonly start: number;
}

interface IndexedStatement {
  readonly end: number;
  readonly index: number;
  readonly start: number;
}

interface NearestStatement {
  readonly index: number;
  readonly list: readonly IndexedStatement[];
  readonly size: number;
  readonly start: number;
}

interface StatementMatch {
  readonly index: number;
  readonly list: readonly IndexedStatement[];
}

interface SyntaxNode {
  readonly [key: string]: unknown;
  readonly end: number;
  readonly start: number;
  readonly type: string;
}

export interface StatementContext {
  readonly nextStatements: readonly string[];
  readonly previousStatements: readonly string[];
  readonly traceStatement: string;
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

export function readStatementContext(
  index: StatementIndex,
  line: number,
  column: number,
): StatementContext | null {
  const offset: number | null = readOffset(
    index.lineStarts,
    index.source.length,
    line,
    column,
  );

  if (offset === null) {
    return null;
  }

  const match: StatementMatch | null = findStatement(
    index.lists,
    index.source,
    offset,
  );

  if (match === null) {
    return null;
  }

  const statement: IndexedStatement | undefined = match.list[match.index];

  if (statement === undefined) {
    return null;
  }

  const traceStatement: string = readStatementText(
    index.source,
    statement.start,
    statement.end,
    offset,
  );

  if (traceStatement.length === 0) {
    return null;
  }

  return {
    nextStatements: readNeighborStatements(
      index.source,
      match.list,
      match.index + 1,
      match.index + 1 + CONTEXT_STATEMENT_COUNT,
    ),
    previousStatements: readPreviousCode(
      index.source,
      index.spans,
      statement.start,
    ),
    traceStatement,
  };
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

function compareNearestSpan(left: CodeSpan, right: CodeSpan): number {
  return right.end - left.end || right.start - left.start;
}

function compareOuterSpan(left: CodeSpan, right: CodeSpan): number {
  return left.start - right.start || right.end - left.end;
}

function compareSourceOrder(left: CodeSpan, right: CodeSpan): number {
  return left.start - right.start;
}

function findStatement(
  lists: readonly (readonly IndexedStatement[])[],
  source: string,
  offset: number,
): StatementMatch | null {
  const containing: StatementMatch | null = findInnermostStatement(
    lists,
    offset,
  );
  // A column in the indent or the gap before a statement is outside that
  // statement. Prefer the statement the whitespace leads into.
  const upcoming: StatementMatch | null = findUpcomingStatement(
    lists,
    source,
    offset,
    readMatchedStatement(containing),
  );

  if (upcoming !== null) {
    return upcoming;
  }

  return containing;
}

function findInnermostStatement(
  lists: readonly (readonly IndexedStatement[])[],
  offset: number,
): StatementMatch | null {
  let best: (StatementMatch & { readonly size: number }) | null = null;

  for (const list of lists) {
    for (const statement of list) {
      if (offset < statement.start || offset >= statement.end) {
        continue;
      }

      const size: number = statement.end - statement.start;

      if (best === null || size < best.size) {
        best = {
          index: statement.index,
          list,
          size,
        };
      }
    }
  }

  if (best === null) {
    return null;
  }

  return {
    index: best.index,
    list: best.list,
  };
}

function findUpcomingStatement(
  lists: readonly (readonly IndexedStatement[])[],
  source: string,
  offset: number,
  containing: IndexedStatement | null,
): StatementMatch | null {
  let nearest: NearestStatement | null = null;

  for (const list of lists) {
    for (const statement of list) {
      if (
        statement.start <= offset ||
        !isInsideContaining(statement, containing)
      ) {
        continue;
      }

      const size: number = statement.end - statement.start;

      if (
        nearest !== null &&
        (statement.start > nearest.start ||
          (statement.start === nearest.start && size >= nearest.size))
      ) {
        continue;
      }

      nearest = {
        index: statement.index,
        list,
        size,
        start: statement.start,
      };
    }
  }

  if (
    nearest === null ||
    !isOnlyWhitespace(source.slice(offset, nearest.start))
  ) {
    return null;
  }

  return {
    index: nearest.index,
    list: nearest.list,
  };
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

function isMeaningfulCode(text: string): boolean {
  return text.length > 0 && !/^[{}()[\];,\s]+$/u.test(text);
}

function isInsideContaining(
  statement: IndexedStatement,
  containing: IndexedStatement | null,
): boolean {
  if (containing === null) {
    return true;
  }

  return (
    statement.start >= containing.start &&
    statement.end <= containing.end &&
    statement.end - statement.start < containing.end - containing.start
  );
}

function isOnlyWhitespace(value: string): boolean {
  return value.trim().length === 0;
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

function readMatchedStatement(
  match: StatementMatch | null,
): IndexedStatement | null {
  if (match === null) {
    return null;
  }

  return match.list[match.index] ?? null;
}

function readNeighborStatements(
  source: string,
  list: readonly IndexedStatement[],
  from: number,
  to: number,
): readonly string[] {
  const statements: string[] = [];

  for (const statement of list.slice(from, to)) {
    const text: string = readStatementText(
      source,
      statement.start,
      statement.end,
      statement.start,
    );

    if (text.length > 0) {
      statements.push(text);
    }
  }

  return statements;
}

function readPreviousCode(
  source: string,
  spans: readonly CodeSpan[],
  statementStart: number,
): readonly string[] {
  const candidates: CodeSpan[] = spans.filter(
    (span: CodeSpan): boolean =>
      span.start < statementStart && span.end <= statementStart,
  );
  const visible: CodeSpan[] = [];
  let maxEnd: number | null = null;

  for (const span of candidates.sort(compareOuterSpan)) {
    if (maxEnd !== null && span.end <= maxEnd) {
      continue;
    }

    visible.push(span);
    maxEnd = span.end;
  }

  const nearest: CodeSpan[] = [];

  for (const span of visible.sort(compareNearestSpan)) {
    const text: string = readStatementText(
      source,
      span.start,
      span.end,
      span.end,
    );

    if (!isMeaningfulCode(text)) {
      continue;
    }

    nearest.push(span);

    if (nearest.length === CONTEXT_STATEMENT_COUNT) {
      break;
    }
  }

  return nearest
    .sort(compareSourceOrder)
    .map((span: CodeSpan): string =>
      readStatementText(source, span.start, span.end, span.end),
    );
}

function readOffset(
  lineStarts: readonly number[],
  sourceLength: number,
  line: number,
  column: number,
): number | null {
  if (
    !Number.isInteger(line) ||
    !Number.isInteger(column) ||
    line < 1 ||
    column < 1
  ) {
    return null;
  }

  const lineStart: number | undefined = lineStarts[line - 1];

  if (lineStart === undefined) {
    return null;
  }

  const nextLineStart: number | undefined = lineStarts[line];
  const lineEnd: number =
    nextLineStart === undefined ? sourceLength : nextLineStart;
  const offset: number = lineStart + (column - 1);

  if (offset < lineStart || offset >= lineEnd) {
    return null;
  }

  return offset;
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

function readStatementText(
  source: string,
  start: number,
  end: number,
  focus: number,
): string {
  if (end - start <= MAX_STATEMENT_TEXT_LENGTH) {
    return source.slice(start, end).trim();
  }

  const half: number = Math.floor(
    MAX_STATEMENT_TEXT_LENGTH / STATEMENT_TEXT_CENTER_DIVISOR,
  );
  const clampedFocus: number = Math.min(Math.max(focus, start), end);
  let windowStart: number = Math.max(start, clampedFocus - half);
  const windowEnd: number = Math.min(
    end,
    windowStart + MAX_STATEMENT_TEXT_LENGTH,
  );

  windowStart = Math.max(start, windowEnd - MAX_STATEMENT_TEXT_LENGTH);

  const prefix: string = windowStart > start ? ELLIPSIS : '';
  const suffix: string = windowEnd < end ? ELLIPSIS : '';

  return `${prefix}${source.slice(windowStart, windowEnd).trim()}${suffix}`;
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
