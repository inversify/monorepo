import { type SourceText } from './SourceTextReader.js';

export const sourceMapReaderService: symbol = Symbol('SourceMapReaderService');

export interface MappedSource {
  readonly column: number;
  readonly line: number;
  readonly sourceText: SourceText;
}

export interface SourceMapReader {
  read(
    generated: SourceText,
    line: number,
    column: number,
  ): Promise<MappedSource | null>;
}
