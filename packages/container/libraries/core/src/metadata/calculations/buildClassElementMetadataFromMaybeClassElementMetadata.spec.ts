import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { ClassElementMetadata } from '../models/ClassElementMetadata';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata';
import { MaybeClassElementMetadataKind } from '../models/MaybeClassElementMetadataKind';
import { MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata';
import { UnmanagedClassElementMetadata } from '../models/UnmanagedClassElementMetadata';
import { buildClassElementMetadataFromMaybeClassElementMetadata } from './buildClassElementMetadataFromMaybeClassElementMetadata';

describe(buildClassElementMetadataFromMaybeClassElementMetadata.name, () => {
  describe('having undefined metadatada', () => {
    let buildDefaultMetadataMock: jest.Mock<
      (...params: unknown[]) => ClassElementMetadata
    >;
    let buildMetadataFromMaybeManagedMetadataMock: jest.Mock<
      (
        metadata:
          | MaybeManagedClassElementMetadata
          | ManagedClassElementMetadata,
        ...params: unknown[]
      ) => ClassElementMetadata
    >;
    let metadataFixture: undefined;

    beforeAll(() => {
      buildDefaultMetadataMock = jest.fn();
      buildMetadataFromMaybeManagedMetadataMock = jest.fn();
      metadataFixture = undefined;
    });

    describe('when called', () => {
      let classElementMetadataFixture: ClassElementMetadata;
      let paramsFixture: unknown[];

      let result: unknown;

      beforeAll(() => {
        classElementMetadataFixture = {
          kind: ClassElementMetadataKind.unmanaged,
        };

        paramsFixture = [Symbol()];

        buildDefaultMetadataMock.mockReturnValueOnce(
          classElementMetadataFixture,
        );

        result = buildClassElementMetadataFromMaybeClassElementMetadata(
          buildDefaultMetadataMock,
          buildMetadataFromMaybeManagedMetadataMock,
        )(...paramsFixture)(metadataFixture);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call buildDefaultMetadata()', () => {
        expect(buildDefaultMetadataMock).toHaveBeenCalledTimes(1);
        expect(buildDefaultMetadataMock).toHaveBeenCalledWith(...paramsFixture);
      });

      it('should return ClassElementMetadata', () => {
        expect(result).toBe(classElementMetadataFixture);
      });
    });
  });

  describe('having unknown metadatada kind', () => {
    let buildDefaultMetadataMock: jest.Mock<
      (...params: unknown[]) => ClassElementMetadata
    >;
    let buildMetadataFromMaybeManagedMetadataMock: jest.Mock<
      (
        metadata:
          | MaybeManagedClassElementMetadata
          | ManagedClassElementMetadata,
        ...params: unknown[]
      ) => ClassElementMetadata
    >;
    let metadataFixture: MaybeManagedClassElementMetadata;

    beforeAll(() => {
      buildDefaultMetadataMock = jest.fn();
      buildMetadataFromMaybeManagedMetadataMock = jest.fn();
      metadataFixture = {
        kind: MaybeClassElementMetadataKind.unknown,
        name: undefined,
        optional: false,
        tags: new Map(),
      };
    });

    describe('when called', () => {
      let classElementMetadataFixture: ClassElementMetadata;
      let paramsFixture: unknown[];

      let result: unknown;

      beforeAll(() => {
        classElementMetadataFixture = {
          kind: ClassElementMetadataKind.unmanaged,
        };

        paramsFixture = [Symbol()];

        buildMetadataFromMaybeManagedMetadataMock.mockReturnValueOnce(
          classElementMetadataFixture,
        );

        result = buildClassElementMetadataFromMaybeClassElementMetadata(
          buildDefaultMetadataMock,
          buildMetadataFromMaybeManagedMetadataMock,
        )(...paramsFixture)(metadataFixture);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call buildMetadataFromMaybeManagedMetadata()', () => {
        expect(buildMetadataFromMaybeManagedMetadataMock).toHaveBeenCalledTimes(
          1,
        );
        expect(buildMetadataFromMaybeManagedMetadataMock).toHaveBeenCalledWith(
          metadataFixture,
          ...paramsFixture,
        );
      });

      it('should return ClassElementMetadata', () => {
        expect(result).toBe(classElementMetadataFixture);
      });
    });
  });

  describe('having non unknown metadatada kind', () => {
    let buildDefaultMetadataMock: jest.Mock<
      (...params: unknown[]) => ClassElementMetadata
    >;
    let buildMetadataFromMaybeManagedMetadataMock: jest.Mock<
      (
        metadata:
          | MaybeManagedClassElementMetadata
          | ManagedClassElementMetadata,
        ...params: unknown[]
      ) => ClassElementMetadata
    >;
    let metadataFixture: UnmanagedClassElementMetadata;

    beforeAll(() => {
      buildDefaultMetadataMock = jest.fn();
      buildMetadataFromMaybeManagedMetadataMock = jest.fn();
      metadataFixture = {
        kind: ClassElementMetadataKind.unmanaged,
      };
    });

    describe('when called', () => {
      let classElementMetadataFixture: ClassElementMetadata;
      let paramsFixture: unknown[];

      let result: unknown;

      beforeAll(() => {
        classElementMetadataFixture = {
          kind: ClassElementMetadataKind.unmanaged,
        };

        paramsFixture = [Symbol()];

        buildMetadataFromMaybeManagedMetadataMock.mockReturnValueOnce(
          classElementMetadataFixture,
        );

        try {
          buildClassElementMetadataFromMaybeClassElementMetadata(
            buildDefaultMetadataMock,
            buildMetadataFromMaybeManagedMetadataMock,
          )(...paramsFixture)(metadataFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should throw an Error', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.injectionDecoratorConflict,
          message:
            'Unexpected injection found. Multiple @inject, @multiInject or @unmanaged decorators found',
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });
});
