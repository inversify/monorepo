import { beforeAll, describe, expect, it } from 'vitest';

import { buildSetHeaderMetadata } from './buildSetHeaderMetadata';

describe(buildSetHeaderMetadata, () => {
  describe('when called and headerValue is undefined', () => {
    let headerMetadataFixture: Map<string, string>;
    let headerKeyFixture: string;
    let valueFixture: string;
    let result: Map<string, string>;

    beforeAll(() => {
      headerMetadataFixture = new Map();
      headerKeyFixture = 'key';
      valueFixture = 'newValue';

      result = buildSetHeaderMetadata(
        headerKeyFixture,
        valueFixture,
      )(headerMetadataFixture);
    });

    it('should set the header metadata', () => {
      expect(result.get(headerKeyFixture)).toBe(valueFixture);
    });

    it('should return parameter header metadata', () => {
      expect(result).toBe(headerMetadataFixture);
    });
  });

  describe('when called and headerValue is defined', () => {
    let headerMetadataFixture: Map<string, string>;
    let headerKeyFixture: string;
    let valueFixture: string;
    let result: Map<string, string>;

    beforeAll(() => {
      headerMetadataFixture = new Map([['key', 'value']]);
      headerKeyFixture = 'key';
      valueFixture = 'newValue';

      result = buildSetHeaderMetadata(
        headerKeyFixture,
        valueFixture,
      )(headerMetadataFixture);
    });

    it('should set the header metadata', () => {
      expect(result.get(headerKeyFixture)).toBe(`value, ${valueFixture}`);
    });

    it('should return parameter header metadata', () => {
      expect(result).toBe(headerMetadataFixture);
    });
  });
});
