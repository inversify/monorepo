import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type ClassElementMetadata } from '../models/ClassElementMetadata.js';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind.js';
import { type ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata.js';
import { MaybeClassElementMetadataKind } from '../models/MaybeClassElementMetadataKind.js';
import { type MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata.js';
import { type UnmanagedClassElementMetadata } from '../models/UnmanagedClassElementMetadata.js';
import { buildClassElementMetadataFromMaybeClassElementMetadata } from './buildClassElementMetadataFromMaybeClassElementMetadata.js';

describe(buildClassElementMetadataFromMaybeClassElementMetadata, () => {
  describe('having undefined metadatada', () => {
    let buildDefaultMetadataMock: Mock<
      (...params: unknown[]) => ClassElementMetadata
    >;
    let buildMetadataFromMaybeManagedMetadataMock: Mock<
      (
        metadata:
          | MaybeManagedClassElementMetadata
          | ManagedClassElementMetadata,
        ...params: unknown[]
      ) => ClassElementMetadata
    >;
    let metadataFixture: undefined;

    beforeAll(() => {
      buildDefaultMetadataMock = vitest.fn();
      buildMetadataFromMaybeManagedMetadataMock = vitest.fn();
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

        result = buildClassElementMetadataFromMaybeClassElementMetadata<
          [unknown[]]
        >(
          buildDefaultMetadataMock,
          buildMetadataFromMaybeManagedMetadataMock,
        )(...paramsFixture)(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildDefaultMetadata()', () => {
        expect(buildDefaultMetadataMock).toHaveBeenCalledExactlyOnceWith(
          ...paramsFixture,
        );
      });

      it('should return ClassElementMetadata', () => {
        expect(result).toBe(classElementMetadataFixture);
      });
    });
  });

  describe('having unknown metadatada kind', () => {
    let buildDefaultMetadataMock: Mock<
      (...params: unknown[]) => ClassElementMetadata
    >;
    let buildMetadataFromMaybeManagedMetadataMock: Mock<
      (
        metadata:
          | MaybeManagedClassElementMetadata
          | ManagedClassElementMetadata,
        ...params: unknown[]
      ) => ClassElementMetadata
    >;
    let metadataFixture: MaybeManagedClassElementMetadata;

    beforeAll(() => {
      buildDefaultMetadataMock = vitest.fn();
      buildMetadataFromMaybeManagedMetadataMock = vitest.fn();
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

        result = buildClassElementMetadataFromMaybeClassElementMetadata<
          [unknown[]]
        >(
          buildDefaultMetadataMock,
          buildMetadataFromMaybeManagedMetadataMock,
        )(...paramsFixture)(metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildMetadataFromMaybeManagedMetadata()', () => {
        expect(
          buildMetadataFromMaybeManagedMetadataMock,
        ).toHaveBeenCalledExactlyOnceWith(metadataFixture, ...paramsFixture);
      });

      it('should return ClassElementMetadata', () => {
        expect(result).toBe(classElementMetadataFixture);
      });
    });
  });

  describe('having non unknown metadatada kind', () => {
    let buildDefaultMetadataMock: Mock<
      (...params: unknown[]) => ClassElementMetadata
    >;
    let buildMetadataFromMaybeManagedMetadataMock: Mock<
      (
        metadata:
          | MaybeManagedClassElementMetadata
          | ManagedClassElementMetadata,
        ...params: unknown[]
      ) => ClassElementMetadata
    >;
    let metadataFixture: UnmanagedClassElementMetadata;

    beforeAll(() => {
      buildDefaultMetadataMock = vitest.fn();
      buildMetadataFromMaybeManagedMetadataMock = vitest.fn();
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
          buildClassElementMetadataFromMaybeClassElementMetadata<[unknown[]]>(
            buildDefaultMetadataMock,
            buildMetadataFromMaybeManagedMetadataMock,
          )(...paramsFixture)(metadataFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
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
