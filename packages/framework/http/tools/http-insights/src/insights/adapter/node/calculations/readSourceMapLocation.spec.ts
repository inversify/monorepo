import { beforeAll, describe, expect, it } from 'vitest';

import { Buffer } from 'node:buffer';

import {
  readSourceMapLocation,
  type SourceMapLocation,
} from './readSourceMapLocation.js';

describe(readSourceMapLocation, () => {
  describe('having a line comment', () => {
    describe('when called', () => {
      let result: SourceMapLocation | null;

      beforeAll(() => {
        result = readSourceMapLocation(
          'throw new Error("boom");\n//# sourceMappingURL=bundle.js.map\n',
        );
      });

      it('should return that url', () => {
        expect(result).toStrictEqual({
          kind: 'url',
          url: 'bundle.js.map',
        });
      });
    });
  });

  describe('having a legacy at-sign comment', () => {
    describe('when called', () => {
      let result: SourceMapLocation | null;

      beforeAll(() => {
        result = readSourceMapLocation(
          'throw new Error("boom");\n//@ sourceMappingURL=bundle.js.map\n',
        );
      });

      it('should return that url', () => {
        expect(result).toStrictEqual({
          kind: 'url',
          url: 'bundle.js.map',
        });
      });
    });
  });

  describe('having a block comment', () => {
    describe('when called', () => {
      let result: SourceMapLocation | null;

      beforeAll(() => {
        result = readSourceMapLocation(
          'throw new Error("boom");\n/*# sourceMappingURL=bundle.js.map */\n',
        );
      });

      it('should return that url', () => {
        expect(result).toStrictEqual({
          kind: 'url',
          url: 'bundle.js.map',
        });
      });
    });
  });

  describe('having two source map comments', () => {
    describe('when called', () => {
      let result: SourceMapLocation | null;

      beforeAll(() => {
        result = readSourceMapLocation(
          [
            '//# sourceMappingURL=first.js.map',
            'throw new Error("boom");',
            '//# sourceMappingURL=second.js.map',
            '',
          ].join('\n'),
        );
      });

      it('should return the last url', () => {
        expect(result).toStrictEqual({
          kind: 'url',
          url: 'second.js.map',
        });
      });
    });
  });

  describe('having a base64 data url', () => {
    describe('when called', () => {
      let result: SourceMapLocation | null;

      beforeAll(() => {
        const json: string = '{"version":3}';
        const encoded: string = Buffer.from(json).toString('base64');

        result = readSourceMapLocation(
          `throw new Error("boom");\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${encoded}\n`,
        );
      });

      it('should return the decoded json', () => {
        expect(result).toStrictEqual({
          json: '{"version":3}',
          kind: 'inline',
        });
      });
    });
  });

  describe('having a plain data url', () => {
    describe('when called', () => {
      let result: SourceMapLocation | null;

      beforeAll(() => {
        result = readSourceMapLocation(
          'throw new Error("boom");\n//# sourceMappingURL=data:application/json,%7B%22version%22%3A3%7D\n',
        );
      });

      it('should return the decoded json', () => {
        expect(result).toStrictEqual({
          json: '{"version":3}',
          kind: 'inline',
        });
      });
    });
  });

  describe('having no source map comment', () => {
    describe('when called', () => {
      let result: SourceMapLocation | null;

      beforeAll(() => {
        result = readSourceMapLocation('throw new Error("boom");\n');
      });

      it('should return null', () => {
        expect(result).toBeNull();
      });
    });
  });
});
