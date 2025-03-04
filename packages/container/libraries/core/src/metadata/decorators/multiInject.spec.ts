import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import { ServiceIdentifier } from '@inversifyjs/common';

vitest.mock(
  '../calculations/buildManagedMetadataFromMaybeClassElementMetadata',
);
vitest.mock('./injectBase');

import { decrementPendingClassMetadataCount } from '../actions/decrementPendingClassMetadataCount';
import { buildManagedMetadataFromMaybeClassElementMetadata } from '../calculations/buildManagedMetadataFromMaybeClassElementMetadata';
import { ClassElementMetadata } from '../models/ClassElementMetadata';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind';
import { MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata';
import { injectBase } from './injectBase';
import { multiInject } from './multiInject';

describe(multiInject.name, () => {
  let serviceIdentifierFixture: ServiceIdentifier;

  beforeAll(() => {
    serviceIdentifierFixture = 'service-id-fixture';
  });

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
        .mocked(buildManagedMetadataFromMaybeClassElementMetadata)
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

      result = multiInject(serviceIdentifierFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call buildManagedMetadataFromMaybeClassElementMetadata()', () => {
      expect(
        buildManagedMetadataFromMaybeClassElementMetadata,
      ).toHaveBeenCalledTimes(1);
      expect(
        buildManagedMetadataFromMaybeClassElementMetadata,
      ).toHaveBeenCalledWith(
        ClassElementMetadataKind.multipleInjection,
        serviceIdentifierFixture,
      );
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
