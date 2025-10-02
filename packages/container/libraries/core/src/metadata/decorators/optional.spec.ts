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
  '../calculations/buildMaybeClassElementMetadataFromMaybeClassElementMetadata',
);
vitest.mock('./injectBase');

import { incrementPendingClassMetadataCount } from '../actions/incrementPendingClassMetadataCount';
import { buildMaybeClassElementMetadataFromMaybeClassElementMetadata } from '../calculations/buildMaybeClassElementMetadataFromMaybeClassElementMetadata';
import { ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata';
import { MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata';
import { MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata';
import { injectBase } from './injectBase';
import { optional } from './optional';

describe(optional, () => {
  describe('when called', () => {
    let decoratorFixture: MethodDecorator &
      ParameterDecorator &
      PropertyDecorator;
    let updateMetadataMock: Mock<
      (
        classElementMetadata: MaybeClassElementMetadata | undefined,
      ) => ManagedClassElementMetadata | MaybeManagedClassElementMetadata
    >;

    let result: unknown;

    beforeAll(() => {
      decoratorFixture = Symbol() as unknown as MethodDecorator &
        ParameterDecorator &
        PropertyDecorator;
      updateMetadataMock = vitest.fn();

      vitest
        .mocked(buildMaybeClassElementMetadataFromMaybeClassElementMetadata)
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

      result = optional();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call buildMaybeClassElementMetadataFromMaybeClassElementMetadata()', () => {
      expect(
        buildMaybeClassElementMetadataFromMaybeClassElementMetadata,
      ).toHaveBeenCalledExactlyOnceWith(expect.any(Function));
    });

    it('should call injectBase()', () => {
      expect(injectBase).toHaveBeenCalledExactlyOnceWith(
        updateMetadataMock,
        incrementPendingClassMetadataCount,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(decoratorFixture);
    });
  });
});
