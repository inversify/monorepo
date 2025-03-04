import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

vitest.mock(
  '../calculations/buildUnmanagedMetadataFromMaybeClassElementMetadata',
);
vitest.mock('./injectBase');

import { decrementPendingClassMetadataCount } from '../actions/decrementPendingClassMetadataCount';
import { buildUnmanagedMetadataFromMaybeClassElementMetadata } from '../calculations/buildUnmanagedMetadataFromMaybeClassElementMetadata';
import { ClassElementMetadata } from '../models/ClassElementMetadata';
import { MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata';
import { injectBase } from './injectBase';
import { unmanaged } from './unmanaged';

describe(unmanaged.name, () => {
  describe('when called', () => {
    let decoratorFixture: MethodDecorator &
      ParameterDecorator &
      PropertyDecorator;
    let updateMetadataMock: Mock<
      (
        classElementMetadata: MaybeClassElementMetadata | undefined,
      ) => ClassElementMetadata
    >;

    let result: unknown;

    beforeAll(() => {
      decoratorFixture = Symbol() as unknown as MethodDecorator &
        ParameterDecorator &
        PropertyDecorator;
      updateMetadataMock = vitest.fn();

      vitest
        .mocked(buildUnmanagedMetadataFromMaybeClassElementMetadata)
        .mockReturnValueOnce(updateMetadataMock);

      vitest
        .mocked(injectBase)
        .mockReturnValueOnce(
          decoratorFixture as <T>(
            target: object,
            propertyKey: string | symbol | undefined,
            parameterIndexOrDescriptor?: number | TypedPropertyDescriptor<T>,
          ) => void,
        );

      result = unmanaged();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call buildUnmanagedMetadataFromMaybeClassElementMetadata()', () => {
      expect(
        buildUnmanagedMetadataFromMaybeClassElementMetadata,
      ).toHaveBeenCalledTimes(1);
      expect(
        buildUnmanagedMetadataFromMaybeClassElementMetadata,
      ).toHaveBeenCalledWith();
    });

    it('should call injectBase()', () => {
      expect(injectBase).toHaveBeenCalledTimes(1);
      expect(injectBase).toHaveBeenCalledWith(
        updateMetadataMock,
        decrementPendingClassMetadataCount,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(decoratorFixture);
    });
  });
});
