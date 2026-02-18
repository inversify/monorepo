import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock(
  import('../calculations/buildMaybeClassElementMetadataFromMaybeClassElementMetadata.js'),
);
vitest.mock(import('./injectBase.js'));

import { incrementPendingClassMetadataCount } from '../actions/incrementPendingClassMetadataCount.js';
import { buildMaybeClassElementMetadataFromMaybeClassElementMetadata } from '../calculations/buildMaybeClassElementMetadataFromMaybeClassElementMetadata.js';
import { type ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata.js';
import { type MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata.js';
import { type MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata.js';
import { injectBase } from './injectBase.js';
import { tagged } from './tagged.js';

describe(tagged, () => {
  let keyFixture: string;
  let valueFixture: unknown;

  beforeAll(() => {
    keyFixture = 'key-fixture';
    valueFixture = 'value-fixture';
  });

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

      result = tagged(keyFixture, valueFixture);
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
