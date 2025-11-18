import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./concatenateHeaders');

import { buildSetHeaderMetadata } from './buildSetHeaderMetadata';
import { concatenateHeaders } from './concatenateHeaders';

describe(buildSetHeaderMetadata, () => {
  describe('having empty header metadata', () => {
    let headerMetadataFixture: Record<string, string>;

    let headerKeyFixture: string;
    let valueFixture: string;

    beforeAll(() => {
      headerMetadataFixture = {};

      headerKeyFixture = 'key';
      valueFixture = 'newValue';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        headerMetadataFixture = {};

        result = buildSetHeaderMetadata(
          headerKeyFixture,
          valueFixture,
        )(headerMetadataFixture);
      });

      it('should return expected result', () => {
        const expected: Record<string, string> = {
          [headerKeyFixture.toLowerCase()]: valueFixture,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having header metadata with matching headerKey', () => {
    let headerMetadataFixture: Record<string, string>;

    let headerKeyFixture: string;
    let valueFixture: string;

    beforeAll(() => {
      headerKeyFixture = 'key';
      valueFixture = 'newValue';

      headerMetadataFixture = {
        [headerKeyFixture.toLowerCase()]: valueFixture,
      };
    });

    describe('when called', () => {
      let concatenationResultFixture: string;

      let result: Record<string, string>;

      beforeAll(() => {
        concatenationResultFixture = 'concatenation-fixture';

        vitest
          .mocked(concatenateHeaders)
          .mockReturnValueOnce(concatenationResultFixture);

        result = buildSetHeaderMetadata(
          headerKeyFixture,
          valueFixture,
        )(headerMetadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call concatenateHeaders()', () => {
        expect(concatenateHeaders).toHaveBeenCalledExactlyOnceWith(
          headerKeyFixture.toLowerCase(),
          valueFixture,
          valueFixture,
        );
      });

      it('should return expected result', () => {
        const expected: Record<string, string> = {
          [headerKeyFixture.toLowerCase()]: concatenationResultFixture,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
