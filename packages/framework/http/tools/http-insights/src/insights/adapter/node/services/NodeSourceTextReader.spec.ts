import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { type SourceText } from '../../../application/ports/SourceTextReader.js';
import {
  MAX_SOURCE_FILE_BYTES,
  NodeSourceTextReader,
} from './NodeSourceTextReader.js';

describe(NodeSourceTextReader, () => {
  let directoryFixture: string;
  let nodeSourceTextReader: NodeSourceTextReader;

  beforeAll(async () => {
    directoryFixture = await mkdtemp(join(tmpdir(), 'insights-source-'));
    nodeSourceTextReader = new NodeSourceTextReader();
  });

  afterAll(async () => {
    await rm(directoryFixture, {
      force: true,
      recursive: true,
    });
  });

  describe('.read', () => {
    describe('having a source file', () => {
      let filePathFixture: string;

      beforeAll(async () => {
        filePathFixture = join(directoryFixture, 'handler.js');
        await writeFile(filePathFixture, 'const first = 1;\n', 'utf8');
      });

      describe('when called', () => {
        let result: SourceText | null;

        beforeAll(async () => {
          result = await nodeSourceTextReader.read(filePathFixture);
        });

        it('should return the file text', () => {
          expect(result).toMatchObject({
            path: filePathFixture,
            source: 'const first = 1;\n',
          });
        });
      });

      describe('when called again after the file changes', () => {
        let result: SourceText | null;

        beforeAll(async () => {
          await writeFile(filePathFixture, 'const second = 2;\n', 'utf8');
          result = await nodeSourceTextReader.read(filePathFixture);
        });

        it('should return the updated text', () => {
          expect(result?.source).toBe('const second = 2;\n');
        });
      });
    });

    describe('having a missing file', () => {
      describe('when called', () => {
        let result: SourceText | null;

        beforeAll(async () => {
          result = await nodeSourceTextReader.read(
            join(directoryFixture, 'missing.js'),
          );
        });

        it('should return null', () => {
          expect(result).toBeNull();
        });
      });
    });

    describe('having a directory', () => {
      describe('when called', () => {
        let result: SourceText | null;

        beforeAll(async () => {
          result = await nodeSourceTextReader.read(directoryFixture);
        });

        it('should return null', () => {
          expect(result).toBeNull();
        });
      });
    });

    describe('having a file larger than the parse limit', () => {
      let filePathFixture: string;

      beforeAll(async () => {
        filePathFixture = join(directoryFixture, 'huge.js');
        await writeFile(
          filePathFixture,
          'a'.repeat(MAX_SOURCE_FILE_BYTES + 1),
          'utf8',
        );
      });

      describe('when called', () => {
        let result: SourceText | null;

        beforeAll(async () => {
          result = await nodeSourceTextReader.read(filePathFixture);
        });

        it('should return null', () => {
          expect(result).toBeNull();
        });
      });
    });
  });
});
