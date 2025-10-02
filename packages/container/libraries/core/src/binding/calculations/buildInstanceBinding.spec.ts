import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { Newable } from '@inversifyjs/common';

vitest.mock('../../metadata/calculations/getClassMetadata');
vitest.mock('../actions/getBindingId');

import { getClassMetadata } from '../../metadata/calculations/getClassMetadata';
import { ClassMetadataFixtures } from '../../metadata/fixtures/ClassMetadataFixtures';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';
import { getBindingId } from '../actions/getBindingId';
import { AutobindOptions } from '../models/AutobindOptions';
import { BindingScope, bindingScopeValues } from '../models/BindingScope';
import { bindingTypeValues } from '../models/BindingType';
import { InstanceBinding } from '../models/InstanceBinding';
import { buildInstanceBinding } from './buildInstanceBinding';

describe(buildInstanceBinding, () => {
  let autobindOptionsFixture: AutobindOptions;
  let serviceIdentifierFixture: Newable;

  beforeAll(() => {
    autobindOptionsFixture = {
      scope: bindingScopeValues.Request,
    };
    serviceIdentifierFixture = class {};
  });

  describe('when called, and getClassMetadata() returns ClassMetadata with scope', () => {
    let classMetadataFixture: ClassMetadata;
    let bindingIdFixture: number;

    let result: unknown;

    beforeAll(() => {
      classMetadataFixture = {
        ...ClassMetadataFixtures.any,
        scope: bindingScopeValues.Singleton,
      };
      bindingIdFixture = 1;

      vitest.mocked(getClassMetadata).mockReturnValueOnce(classMetadataFixture);

      vitest.mocked(getBindingId).mockReturnValueOnce(bindingIdFixture);

      result = buildInstanceBinding(
        autobindOptionsFixture,
        serviceIdentifierFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getClassMetadata()', () => {
      expect(getClassMetadata).toHaveBeenCalledExactlyOnceWith(
        serviceIdentifierFixture,
      );
    });

    it('should call getBindingId', () => {
      expect(getBindingId).toHaveBeenCalledExactlyOnceWith();
    });

    it('should return expected InstanceBinding', () => {
      const expected: InstanceBinding<unknown> = {
        cache: {
          isRight: false,
          value: undefined,
        },
        id: bindingIdFixture,
        implementationType: serviceIdentifierFixture,
        isSatisfiedBy: expect.any(Function),
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: classMetadataFixture.scope as BindingScope,
        serviceIdentifier: serviceIdentifierFixture,
        type: bindingTypeValues.Instance,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
