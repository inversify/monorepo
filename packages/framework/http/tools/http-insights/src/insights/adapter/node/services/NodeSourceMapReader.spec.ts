import { beforeAll, describe, expect, it } from 'vitest';

import { type MappedSource } from '../../../application/ports/SourceMapReader.js';
import {
  type SourceText,
  type SourceTextReader,
} from '../../../application/ports/SourceTextReader.js';
import { NodeSourceMapReader } from './NodeSourceMapReader.js';

const VLQ_CHARACTERS: string =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

describe(NodeSourceMapReader, () => {
  describe('.read', () => {
    describe('having an embedded TypeScript source', () => {
      const columnFixture: number = 15;
      const generatedPath: string = '/app/dist/bundle.js';
      const mapPath: string = '/app/dist/bundle.js.map';
      let filesFixture: Map<string, SourceText>;
      let reader: NodeSourceMapReader;

      beforeAll(() => {
        filesFixture = new Map([
          [generatedPath, generatedSource(generatedPath, 'bundle.js.map', '1')],
          [
            mapPath,
            {
              path: mapPath,
              source: sourceMap({
                mappings: readMappings(14, 0, 22),
                sources: ['../src/handler.ts'],
                sourcesContent: [
                  "const first: number=1;throw new Error('boom');const fourth: number=4;\n",
                ],
              }),
              version: '1',
            },
          ],
        ]);
        reader = new NodeSourceMapReader(sourceReaderFrom(filesFixture));
      });

      describe('when called at the throw', () => {
        let result: MappedSource | null;

        beforeAll(async () => {
          result = await reader.read(
            generatedFile(filesFixture, generatedPath),
            1,
            columnFixture,
          );
        });

        it('should return the original column in the embedded source', () => {
          expect(result).toMatchObject({
            column: 23,
            line: 1,
            sourceText: {
              path: '/app/src/handler.ts',
              source:
                "const first: number=1;throw new Error('boom');const fourth: number=4;\n",
            },
          });
        });
      });

      describe('when called again before the map version changes', () => {
        let result: MappedSource | null;

        beforeAll(async () => {
          filesFixture.set(mapPath, {
            path: mapPath,
            source: sourceMap({
              mappings: 'AAAA',
              sources: ['../src/handler.ts'],
              sourcesContent: ['throw new Error("changed");\n'],
            }),
            version: '1',
          });
          result = await reader.read(
            generatedFile(filesFixture, generatedPath),
            1,
            columnFixture,
          );
        });

        it('should keep the cached source', () => {
          expect(result?.sourceText.source).toBe(
            "const first: number=1;throw new Error('boom');const fourth: number=4;\n",
          );
        });
      });

      describe('when called after the map version changes', () => {
        let result: MappedSource | null;

        beforeAll(async () => {
          filesFixture.set(mapPath, {
            path: mapPath,
            source: sourceMap({
              mappings: 'AAAA',
              sources: ['../src/handler.ts'],
              sourcesContent: ['throw new Error("changed");\n'],
            }),
            version: '2',
          });
          result = await reader.read(
            generatedFile(filesFixture, generatedPath),
            1,
            1,
          );
        });

        it('should return the updated source', () => {
          expect(result?.sourceText.source).toBe(
            'throw new Error("changed");\n',
          );
        });
      });
    });

    describe('having a source map without embedded source', () => {
      const generatedPath: string = '/app/dist/bundle.js';
      const mapPath: string = '/app/dist/bundle.js.map';
      const sourcePath: string = '/app/src/handler.ts';
      let filesFixture: Map<string, SourceText>;
      let reader: NodeSourceMapReader;

      beforeAll(() => {
        filesFixture = new Map([
          [generatedPath, generatedSource(generatedPath, 'bundle.js.map', '1')],
          [
            mapPath,
            {
              path: mapPath,
              source: sourceMap({
                mappings: 'AAAA',
                sources: ['../src/handler.ts'],
              }),
              version: '1',
            },
          ],
          [
            sourcePath,
            {
              path: sourcePath,
              source: 'throw new Error("from-disk");\n',
              version: 'disk',
            },
          ],
        ]);
        reader = new NodeSourceMapReader(sourceReaderFrom(filesFixture));
      });

      describe('when called, and the source file exists', () => {
        let result: MappedSource | null;

        beforeAll(async () => {
          result = await reader.read(
            generatedFile(filesFixture, generatedPath),
            1,
            1,
          );
        });

        it('should return the file', () => {
          expect(result).toMatchObject({
            column: 1,
            line: 1,
            sourceText: {
              path: sourcePath,
              source: 'throw new Error("from-disk");\n',
              version: 'disk',
            },
          });
        });
      });
    });

    describe('having a source map whose file is missing', () => {
      describe('when called', () => {
        let result: MappedSource | null;

        beforeAll(async () => {
          const generatedPath: string = '/app/dist/bundle.js';
          const mapPath: string = '/app/dist/bundle.js.map';
          const files: Map<string, SourceText> = new Map([
            [
              generatedPath,
              generatedSource(generatedPath, 'bundle.js.map', '1'),
            ],
            [
              mapPath,
              {
                path: mapPath,
                source: sourceMap({
                  mappings: 'AAAA',
                  sources: ['../src/handler.ts'],
                }),
                version: '1',
              },
            ],
          ]);

          result = await new NodeSourceMapReader(sourceReaderFrom(files)).read(
            generatedFile(files, generatedPath),
            1,
            1,
          );
        });

        it('should return null', () => {
          expect(result).toBeNull();
        });
      });
    });

    describe('having a relative source root', () => {
      describe('when called', () => {
        let result: MappedSource | null;

        beforeAll(async () => {
          const generatedPath: string = '/app/dist/bundle.js';
          const mapPath: string = '/app/dist/bundle.js.map';
          const files: Map<string, SourceText> = new Map([
            [
              generatedPath,
              generatedSource(generatedPath, 'bundle.js.map', '1'),
            ],
            [
              mapPath,
              {
                path: mapPath,
                source: sourceMap({
                  mappings: 'AAAA',
                  sourceRoot: '../src',
                  sources: ['handler.ts'],
                  sourcesContent: ['throw new Error("rooted");\n'],
                }),
                version: '1',
              },
            ],
          ]);

          result = await new NodeSourceMapReader(sourceReaderFrom(files)).read(
            generatedFile(files, generatedPath),
            1,
            1,
          );
        });

        it('should resolve the source under that root', () => {
          expect(result?.sourceText.path).toBe('/app/src/handler.ts');
          expect(result?.sourceText.source).toBe(
            'throw new Error("rooted");\n',
          );
        });
      });
    });

    describe('having an indexed source map', () => {
      describe('when called', () => {
        let result: MappedSource | null;

        beforeAll(async () => {
          const generatedPath: string = '/app/dist/bundle.js';
          const mapPath: string = '/app/dist/bundle.js.map';
          const files: Map<string, SourceText> = new Map([
            [
              generatedPath,
              generatedSource(generatedPath, 'bundle.js.map', '1'),
            ],
            [
              mapPath,
              {
                path: mapPath,
                source: JSON.stringify({
                  file: 'bundle.js',
                  sections: [
                    {
                      map: {
                        file: 'bundle.js',
                        mappings: 'AAAA',
                        names: [],
                        sourceRoot: '',
                        sources: ['handler.ts'],
                        sourcesContent: ['throw new Error("section");\n'],
                        version: 3,
                      },
                      offset: {
                        column: 0,
                        line: 0,
                      },
                    },
                  ],
                  version: 3,
                }),
                version: '1',
              },
            ],
          ]);

          result = await new NodeSourceMapReader(sourceReaderFrom(files)).read(
            generatedFile(files, generatedPath),
            1,
            1,
          );
        });

        it('should return the section source', () => {
          expect(result).toMatchObject({
            column: 1,
            line: 1,
            sourceText: {
              path: '/app/dist/handler.ts',
              source: 'throw new Error("section");\n',
            },
          });
        });
      });
    });

    describe('having an indexed source map with a repeated source name', () => {
      const generatedPath: string = '/app/dist/bundle.js';
      let filesFixture: Map<string, SourceText>;
      let reader: NodeSourceMapReader;

      beforeAll(() => {
        const mapPath: string = '/app/dist/bundle.js.map';

        filesFixture = new Map([
          [generatedPath, generatedSource(generatedPath, 'bundle.js.map', '1')],
          [
            mapPath,
            {
              path: mapPath,
              source: JSON.stringify({
                file: 'bundle.js',
                sections: [
                  {
                    map: {
                      file: 'bundle.js',
                      mappings: 'AAAA',
                      names: [],
                      sources: ['handler.ts'],
                      sourcesContent: ['throw new Error("first");\n'],
                      version: 3,
                    },
                    offset: {
                      column: 0,
                      line: 0,
                    },
                  },
                  {
                    map: {
                      file: 'bundle.js',
                      mappings: 'AAAA',
                      names: [],
                      sources: ['handler.ts'],
                      sourcesContent: ['throw new Error("second");\n'],
                      version: 3,
                    },
                    offset: {
                      column: 0,
                      line: 1,
                    },
                  },
                ],
                version: 3,
              }),
              version: '1',
            },
          ],
        ]);
        reader = new NodeSourceMapReader(sourceReaderFrom(filesFixture));
      });

      describe('when called in the first section', () => {
        let result: MappedSource | null;

        beforeAll(async () => {
          result = await reader.read(
            generatedFile(filesFixture, generatedPath),
            1,
            1,
          );
        });

        it('should return the first section source', () => {
          expect(result).toStrictEqual({
            column: 1,
            line: 1,
            sourceText: {
              path: '/app/dist/handler.ts',
              source: 'throw new Error("first");\n',
              version: '/app/dist/bundle.js:1:embedded:0:0',
            },
          });
        });
      });

      describe('when called in the second section', () => {
        let result: MappedSource | null;

        beforeAll(async () => {
          result = await reader.read(
            generatedFile(filesFixture, generatedPath),
            2,
            1,
          );
        });

        it('should return the second section source', () => {
          expect(result).toStrictEqual({
            column: 1,
            line: 1,
            sourceText: {
              path: '/app/dist/handler.ts',
              source: 'throw new Error("second");\n',
              version: '/app/dist/bundle.js:1:embedded:1:0',
            },
          });
        });
      });
    });

    describe('having no source map comment', () => {
      describe('when called', () => {
        let result: MappedSource | null;

        beforeAll(async () => {
          const generated: SourceText = {
            path: '/app/bundle.js',
            source: 'throw new Error("boom");\n',
            version: '1',
          };

          result = await new NodeSourceMapReader(
            sourceReaderFrom(new Map()),
          ).read(generated, 1, 1);
        });

        it('should return null', () => {
          expect(result).toBeNull();
        });
      });
    });

    describe('having an https source map url', () => {
      describe('when called', () => {
        let result: MappedSource | null;

        beforeAll(async () => {
          const generated: SourceText = {
            path: '/app/bundle.js',
            source:
              'throw new Error("boom");\n//# sourceMappingURL=https://example.com/bundle.js.map\n',
            version: '1',
          };

          result = await new NodeSourceMapReader(
            sourceReaderFrom(new Map()),
          ).read(generated, 1, 1);
        });

        it('should return null', () => {
          expect(result).toBeNull();
        });
      });
    });

    describe('having a position on an unmapped line', () => {
      describe('when called', () => {
        let result: MappedSource | null;

        beforeAll(async () => {
          const generatedPath: string = '/app/dist/bundle.js';
          const mapPath: string = '/app/dist/bundle.js.map';
          const files: Map<string, SourceText> = new Map([
            [
              generatedPath,
              {
                path: generatedPath,
                source:
                  'const first = 1;\nthrow new Error("boom");\n//# sourceMappingURL=bundle.js.map\n',
                version: '1',
              },
            ],
            [
              mapPath,
              {
                path: mapPath,
                source: sourceMap({
                  mappings: 'AAAA',
                  sources: ['handler.ts'],
                  sourcesContent: ['export const value: number = 1;\n'],
                }),
                version: '1',
              },
            ],
          ]);

          result = await new NodeSourceMapReader(sourceReaderFrom(files)).read(
            generatedFile(files, generatedPath),
            2,
            1,
          );
        });

        it('should return null', () => {
          expect(result).toBeNull();
        });
      });
    });

    describe('having invalid source map json', () => {
      describe('when called', () => {
        let result: MappedSource | null;

        beforeAll(async () => {
          const generatedPath: string = '/app/dist/bundle.js';
          const mapPath: string = '/app/dist/bundle.js.map';
          const files: Map<string, SourceText> = new Map([
            [
              generatedPath,
              generatedSource(generatedPath, 'bundle.js.map', '1'),
            ],
            [
              mapPath,
              {
                path: mapPath,
                source: '{',
                version: '1',
              },
            ],
          ]);

          result = await new NodeSourceMapReader(sourceReaderFrom(files)).read(
            generatedFile(files, generatedPath),
            1,
            1,
          );
        });

        it('should return null', () => {
          expect(result).toBeNull();
        });
      });
    });
  });
});

function generatedFile(
  files: ReadonlyMap<string, SourceText>,
  filePath: string,
): SourceText {
  const source: SourceText | undefined = files.get(filePath);

  if (source === undefined) {
    throw new Error(`Missing ${filePath}.`);
  }

  return source;
}

function generatedSource(
  filePath: string,
  mapUrl: string,
  version: string,
): SourceText {
  return {
    path: filePath,
    source: `throw new Error("boom");\n//# sourceMappingURL=${mapUrl}\n`,
    version,
  };
}

function readMappings(
  generatedColumn: number,
  originalLine: number,
  originalColumn: number,
): string {
  return `${readVlq(generatedColumn)}${readVlq(0)}${readVlq(originalLine)}${readVlq(originalColumn)}`;
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

function sourceMap(input: {
  readonly mappings: string;
  readonly sourceRoot?: string;
  readonly sources: readonly string[];
  readonly sourcesContent?: readonly string[];
}): string {
  return JSON.stringify({
    file: 'bundle.js',
    mappings: input.mappings,
    names: [],
    sourceRoot: input.sourceRoot ?? '',
    sources: input.sources,
    sourcesContent: input.sourcesContent,
    version: 3,
  });
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
