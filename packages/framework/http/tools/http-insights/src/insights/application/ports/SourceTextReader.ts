export const sourceTextReaderService: symbol = Symbol(
  'SourceTextReaderService',
);

export interface SourceText {
  readonly path: string;
  readonly source: string;
  readonly version: string;
}

export interface SourceTextReader {
  read(filePath: string): Promise<SourceText | null>;
}
