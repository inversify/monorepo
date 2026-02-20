import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import { type ServiceIdentifier } from '@inversifyjs/common';

vitest.mock(
  import('../calculations/buildManagedMetadataFromMaybeClassElementMetadata.js'),
);
vitest.mock(import('./injectBase.js'));

import { decrementPendingClassMetadataCount } from '../actions/decrementPendingClassMetadataCount.js';
import { buildManagedMetadataFromMaybeClassElementMetadata } from '../calculations/buildManagedMetadataFromMaybeClassElementMetadata.js';
import { type ClassElementMetadata } from '../models/ClassElementMetadata.js';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind.js';
import { type MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata.js';
import { inject } from './inject.js';
import { injectBase } from './injectBase.js';

describe(inject, () => {
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

      result = inject(serviceIdentifierFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call buildManagedMetadataFromMaybeClassElementMetadata()', () => {
      expect(
        buildManagedMetadataFromMaybeClassElementMetadata,
      ).toHaveBeenCalledExactlyOnceWith(
        ClassElementMetadataKind.singleInjection,
        serviceIdentifierFixture,
      );
    });

    it('should call injectBase()', () => {
      expect(injectBase).toHaveBeenCalledExactlyOnceWith(
        updateMetadataMock,
        decrementPendingClassMetadataCount,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(decoratorFixture);
    });
  });
});
