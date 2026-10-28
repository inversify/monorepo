import { SourceMap } from 'node:module';
import { dirname } from 'node:path';

import { inject, injectable } from 'inversify';

import {
  type MappedSource,
  type SourceMapReader,
} from '../../../application/ports/SourceMapReader.js';
import {
  type SourceText,
  type SourceTextReader,
  sourceTextReaderService,
} from '../../../application/ports/SourceTextReader.js';
import { isLocalFilePath } from '../calculations/isLocalFilePath.js';
import { readResolvedSourcePath } from '../calculations/readResolvedSourcePath.js';
import { readSourceMapFilePath } from '../calculations/readSourceMapFilePath.js';
import {
  readSourceMapLocation,
  type SourceMapLocation,
} from '../calculations/readSourceMapLocation.js';

const SOURCE_MAP_VERSION: number = 3;

interface CachedParsedMap {
  readonly baseDirectory: string;
  readonly parsed: ParsedSourceMap | null;
  readonly version: string;
}

interface LoadedSourceMap {
  readonly baseDirectory: string;
  readonly parsed: ParsedSourceMap;
}

interface MappedPosition {
  readonly column: number;
  readonly generatedColumn: number;
  readonly generatedLine: number;
  readonly line: number;
  readonly source: string;
}

interface OriginalSourceRef {
  readonly content: string | null;
  readonly index: number;
  readonly section: number;
  readonly sourceRoot: string | null;
}

interface ParsedSourceMap {
  readonly map: SourceMap;
  readonly sections: readonly SourceMapSection[];
}

interface SourceMapping {
  readonly generatedLine: number;
  readonly originalColumn: number;
  readonly originalLine: number;
  readonly originalSource: string;
}

interface SectionOffset {
  readonly column: number;
  readonly line: number;
}

interface SourceMapSection {
  readonly column: number;
  readonly line: number;
  readonly sourceRoot: string | null;
  readonly sources: readonly string[];
  readonly sourcesContent: readonly (string | null)[] | null;
}

interface SourceOrigin {
  readonly columnNumber: number;
  readonly fileName: string;
  readonly lineNumber: number;
}

@injectable()
export class NodeSourceMapReader implements SourceMapReader {
  readonly #parsedMaps: Map<string, CachedParsedMap> = new Map();
  readonly #sourceTextReader: SourceTextReader;

  constructor(
    @inject(sourceTextReaderService)
    sourceTextReader: SourceTextReader,
  ) {
    this.#sourceTextReader = sourceTextReader;
  }

  public async read(
    generated: SourceText,
    line: number,
    column: number,
  ): Promise<MappedSource | null> {
    try {
      return await this.#read(generated, line, column);
    } catch (_error: unknown) {
      return null;
    }
  }

  async #read(
    generated: SourceText,
    line: number,
    column: number,
  ): Promise<MappedSource | null> {
    if (!isPositiveInteger(line) || !isPositiveInteger(column)) {
      return null;
    }

    const loaded: LoadedSourceMap | null = await this.#readParsedMap(generated);

    if (loaded === null) {
      return null;
    }

    const position: MappedPosition | null = readMappedPosition(
      loaded.parsed.map,
      line,
      column,
    );

    if (position === null) {
      return null;
    }

    return this.#readOriginalSource(generated, loaded, position);
  }

  async #readOriginalSource(
    generated: SourceText,
    loaded: LoadedSourceMap,
    position: MappedPosition,
  ): Promise<MappedSource | null> {
    const ref: OriginalSourceRef | null = readOriginalSourceRef(
      loaded.parsed.sections,
      position.source,
      position.generatedLine,
      position.generatedColumn,
    );
    const sourcePath: string = readResolvedSourcePath(
      position.source,
      ref?.sourceRoot ?? null,
      loaded.baseDirectory,
    );

    if (ref !== null && ref.content !== null) {
      return {
        column: position.column,
        line: position.line,
        sourceText: {
          path: sourcePath,
          source: ref.content,
          version: `${generated.path}:${generated.version}:embedded:${String(ref.section)}:${String(ref.index)}`,
        },
      };
    }

    if (!isLocalFilePath(sourcePath)) {
      return null;
    }

    const sourceText: SourceText | null =
      await this.#sourceTextReader.read(sourcePath);

    if (sourceText === null) {
      return null;
    }

    return {
      column: position.column,
      line: position.line,
      sourceText,
    };
  }

  async #readParsedMap(generated: SourceText): Promise<LoadedSourceMap | null> {
    const location: SourceMapLocation | null = readSourceMapLocation(
      generated.source,
    );

    if (location === null) {
      return null;
    }

    if (location.kind === 'inline') {
      return this.#readCachedMap(
        `inline:${generated.path}`,
        generated.version,
        dirname(generated.path),
        location.json,
      );
    }

    const mapPath: string | null = readSourceMapFilePath(
      generated.path,
      location.url,
    );

    if (mapPath === null) {
      return null;
    }

    const mapText: SourceText | null =
      await this.#sourceTextReader.read(mapPath);

    if (mapText === null) {
      return null;
    }

    return this.#readCachedMap(
      mapText.path,
      mapText.version,
      dirname(mapText.path),
      mapText.source,
    );
  }

  #readCachedMap(
    key: string,
    version: string,
    baseDirectory: string,
    json: string,
  ): LoadedSourceMap | null {
    const cached: CachedParsedMap | undefined = this.#parsedMaps.get(key);

    if (cached !== undefined && cached.version === version) {
      if (cached.parsed === null) {
        return null;
      }

      return {
        baseDirectory: cached.baseDirectory,
        parsed: cached.parsed,
      };
    }

    const parsed: ParsedSourceMap | null = readParsedSourceMap(json);

    this.#parsedMaps.set(key, {
      baseDirectory,
      parsed,
      version,
    });

    if (parsed === null) {
      return null;
    }

    return {
      baseDirectory,
      parsed,
    };
  }
}

function compareSourcePosition(
  leftLine: number,
  leftColumn: number,
  rightLine: number,
  rightColumn: number,
): number {
  if (leftLine !== rightLine) {
    return leftLine < rightLine ? -1 : 1;
  }

  if (leftColumn !== rightColumn) {
    return leftColumn < rightColumn ? -1 : 1;
  }

  return 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isPositiveInteger(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isPositionAtOrBefore(
  line: number,
  column: number,
  otherLine: number,
  otherColumn: number,
): boolean {
  return compareSourcePosition(line, column, otherLine, otherColumn) <= 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSourceMapping(value: object): value is SourceMapping {
  return (
    'originalSource' in value &&
    typeof value.originalSource === 'string' &&
    value.originalSource.length > 0 &&
    'generatedLine' in value &&
    typeof value.generatedLine === 'number' &&
    'originalLine' in value &&
    typeof value.originalLine === 'number' &&
    'originalColumn' in value &&
    typeof value.originalColumn === 'number'
  );
}

function isSourceOrigin(value: object): value is SourceOrigin {
  return (
    'fileName' in value &&
    typeof value.fileName === 'string' &&
    value.fileName.length > 0 &&
    'lineNumber' in value &&
    isPositiveInteger((value as Partial<SourceOrigin>).lineNumber) &&
    'columnNumber' in value &&
    isPositiveInteger((value as Partial<SourceOrigin>).columnNumber)
  );
}

function readFlatSection(
  value: Record<string, unknown>,
): readonly SourceMapSection[] | null {
  if (typeof value['mappings'] !== 'string') {
    return null;
  }

  const section: SourceMapSection | null = readSection(value, {
    column: 0,
    line: 0,
  });

  if (section === null) {
    return null;
  }

  return [section];
}

function readIndexedSection(value: unknown): SourceMapSection | null {
  if (!isRecord(value)) {
    return null;
  }

  const offset: SectionOffset | null = readSectionOffset(value['offset']);
  const map: unknown = value['map'];

  if (offset === null || !isRecord(map)) {
    return null;
  }

  return readSection(map, offset);
}

function readIndexedSections(
  value: unknown,
): readonly SourceMapSection[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const sections: SourceMapSection[] = [];

  for (const item of value) {
    const section: SourceMapSection | null = readIndexedSection(item);

    if (section !== null) {
      sections.push(section);
    }
  }

  if (sections.length === 0) {
    return null;
  }

  return sections;
}

function readMappedPosition(
  map: SourceMap,
  line: number,
  column: number,
): MappedPosition | null {
  const generatedLine: number = line - 1;
  const generatedColumn: number = column - 1;
  const entry: SourceMapping | null = readSourceMapping(
    map.findEntry(generatedLine, generatedColumn),
  );

  // Ignore mappings that start on an earlier generated line.
  if (entry === null || entry.generatedLine !== generatedLine) {
    return null;
  }

  const origin: SourceOrigin | null = readSourceOrigin(
    map.findOrigin(line, column),
  );

  if (origin !== null && origin.fileName === entry.originalSource) {
    return {
      column: origin.columnNumber,
      generatedColumn,
      generatedLine,
      line: origin.lineNumber,
      source: entry.originalSource,
    };
  }

  const originalColumn: number = entry.originalColumn + 1;
  const originalLine: number = entry.originalLine + 1;

  if (!isPositiveInteger(originalColumn) || !isPositiveInteger(originalLine)) {
    return null;
  }

  return {
    column: originalColumn,
    generatedColumn,
    generatedLine,
    line: originalLine,
    source: entry.originalSource,
  };
}

function readNodeSourceMap(value: Record<string, unknown>): SourceMap | null {
  try {
    return new SourceMap(
      value as unknown as ConstructorParameters<typeof SourceMap>[0],
    );
  } catch (_error: unknown) {
    return null;
  }
}

function readOriginalSourceRef(
  sections: readonly SourceMapSection[],
  originalSource: string,
  generatedLine: number,
  generatedColumn: number,
): OriginalSourceRef | null {
  const sectionIndex: number = readSectionIndex(
    sections,
    generatedLine,
    generatedColumn,
  );
  const section: SourceMapSection | undefined = sections[sectionIndex];

  if (section === undefined) {
    return null;
  }

  const index: number = section.sources.indexOf(originalSource);

  if (index < 0) {
    return null;
  }

  const content: string | null | undefined = section.sourcesContent?.[index];

  return {
    content: typeof content === 'string' ? content : null,
    index,
    section: sectionIndex,
    sourceRoot: section.sourceRoot,
  };
}

function readParsedSourceMap(text: string): ParsedSourceMap | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text) as unknown;
  } catch (_error: unknown) {
    return null;
  }

  if (!isRecord(parsed) || parsed['version'] !== SOURCE_MAP_VERSION) {
    return null;
  }

  const sections: readonly SourceMapSection[] | null = readSections(parsed);

  if (sections === null) {
    return null;
  }

  const map: SourceMap | null = readNodeSourceMap(parsed);

  if (map === null) {
    return null;
  }

  return {
    map,
    sections,
  };
}

function readSection(
  value: Record<string, unknown>,
  offset: SectionOffset,
): SourceMapSection | null {
  const sources: readonly string[] | null = readSources(value['sources']);

  if (sources === null) {
    return null;
  }

  return {
    column: offset.column,
    line: offset.line,
    sourceRoot: readSourceRoot(value['sourceRoot']),
    sources,
    sourcesContent: readSourcesContent(value['sourcesContent']),
  };
}

function readSectionIndex(
  sections: readonly SourceMapSection[],
  generatedLine: number,
  generatedColumn: number,
): number {
  let selected: number = -1;

  for (let index: number = 0; index < sections.length; index += 1) {
    const section: SourceMapSection | undefined = sections[index];

    if (
      section === undefined ||
      !isPositionAtOrBefore(
        section.line,
        section.column,
        generatedLine,
        generatedColumn,
      )
    ) {
      continue;
    }

    const selectedSection: SourceMapSection | undefined = sections[selected];

    if (
      selectedSection !== undefined &&
      compareSourcePosition(
        section.line,
        section.column,
        selectedSection.line,
        selectedSection.column,
      ) < 0
    ) {
      continue;
    }

    selected = index;
  }

  return selected;
}

function readSectionOffset(value: unknown): SectionOffset | null {
  if (!isRecord(value)) {
    return null;
  }

  const column: unknown = value['column'];
  const line: unknown = value['line'];

  if (!isNonNegativeInteger(column) || !isNonNegativeInteger(line)) {
    return null;
  }

  return {
    column,
    line,
  };
}

function readSections(
  value: Record<string, unknown>,
): readonly SourceMapSection[] | null {
  const indexed: readonly SourceMapSection[] | null = readIndexedSections(
    value['sections'],
  );

  if (indexed !== null) {
    return indexed;
  }

  return readFlatSection(value);
}

function readSourceMapping(value: object): SourceMapping | null {
  if (!isSourceMapping(value)) {
    return null;
  }

  return value;
}

function readSourceOrigin(value: object): SourceOrigin | null {
  if (!isSourceOrigin(value)) {
    return null;
  }

  return value;
}

function readSourceRoot(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }

  return value;
}

function readSources(value: unknown): readonly string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const sources: string[] = [];

  for (const item of value) {
    if (typeof item !== 'string') {
      return null;
    }

    sources.push(item);
  }

  return sources;
}

function readSourcesContent(value: unknown): readonly (string | null)[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const contents: (string | null)[] = [];

  for (const item of value) {
    contents.push(typeof item === 'string' ? item : null);
  }

  return contents;
}
