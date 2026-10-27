import {
  type CodeSpan,
  type IndexedStatement,
  type StatementIndex,
} from './buildStatementIndex.js';

const CONTEXT_STATEMENT_COUNT: number = 2;
const ELLIPSIS: string = '…';
const MAX_STATEMENT_TEXT_LENGTH: number = 500;
const STATEMENT_TEXT_CENTER_DIVISOR: number = 2;

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

export interface StatementContext {
  readonly nextStatements: readonly string[];
  readonly previousStatements: readonly string[];
  readonly traceStatement: string;
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

function isIndentCharacter(character: string): boolean {
  return character === ' ' || character === '\t';
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

function isLineBreak(character: string): boolean {
  return character === '\n' || character === '\r';
}

function isMeaningfulCode(text: string): boolean {
  return text.length > 0 && !/^[{}()[\];,\s]+$/u.test(text);
}

function isOnlyWhitespace(value: string): boolean {
  return value.trim().length === 0;
}

function readExtraLineBreakCount(source: string, indentStart: number): number {
  let cursor: number = indentStart;
  let lineBreakCount: number = 0;

  while (cursor > 0) {
    const character: string = source.charAt(cursor - 1);

    if (character === '\n') {
      lineBreakCount += 1;
      cursor -= 1;

      if (source.charAt(cursor - 1) === '\r') {
        cursor -= 1;
      }

      continue;
    }

    if (character === '\r') {
      lineBreakCount += 1;
      cursor -= 1;
      continue;
    }

    break;
  }

  // Each snippet is already rendered on its own line.
  if (lineBreakCount <= 1) {
    return 0;
  }

  return lineBreakCount - 1;
}

function readLeadingWhitespace(source: string, start: number): string {
  let indentStart: number = start;

  while (indentStart > 0) {
    const character: string = source.charAt(indentStart - 1);

    if (isLineBreak(character)) {
      break;
    }

    if (!isIndentCharacter(character)) {
      return '';
    }

    indentStart -= 1;
  }

  const blankLineCount: number = readExtraLineBreakCount(source, indentStart);
  const indent: string = source.slice(indentStart, start);

  if (blankLineCount === 0) {
    return indent;
  }

  return `${'\n'.repeat(blankLineCount)}${indent}`;
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

function readStatementText(
  source: string,
  start: number,
  end: number,
  focus: number,
): string {
  if (end - start <= MAX_STATEMENT_TEXT_LENGTH) {
    return `${readLeadingWhitespace(source, start)}${trimSameLinePadding(
      source.slice(start, end).trimEnd(),
    )}`;
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

  const prefix: string =
    windowStart > start ? ELLIPSIS : readLeadingWhitespace(source, start);
  const suffix: string = windowEnd < end ? ELLIPSIS : '';

  return `${prefix}${source.slice(windowStart, windowEnd).trim()}${suffix}`;
}

function trimSameLinePadding(text: string): string {
  let index: number = 0;

  while (index < text.length && isIndentCharacter(text.charAt(index))) {
    index += 1;
  }

  if (index === 0 || isLineBreak(text.charAt(index))) {
    return text;
  }

  return text.slice(index);
}
