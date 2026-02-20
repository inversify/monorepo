import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { type Newable } from '@inversifyjs/common';

vitest.mock(import('../../metadata/calculations/getClassMetadata.js'));
vitest.mock(import('../actions/getBindingId.js'));

import { getClassMetadata } from '../../metadata/calculations/getClassMetadata.js';
import { ClassMetadataFixtures } from '../../metadata/fixtures/ClassMetadataFixtures.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';
import { getBindingId } from '../actions/getBindingId.js';
import { type AutobindOptions } from '../models/AutobindOptions.js';
import {
  type BindingScope,
  bindingScopeValues,
} from '../models/BindingScope.js';
import { bindingTypeValues } from '../models/BindingType.js';
import { type InstanceBinding } from '../models/InstanceBinding.js';
import { buildInstanceBinding } from './buildInstanceBinding.js';

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
