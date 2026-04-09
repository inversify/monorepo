import { describe, expectTypeOf, it } from 'vitest';

import {
  type OpenApi3Dot2OperationObject,
  type OpenApi3Dot2PathItemObject,
} from '@inversifyjs/open-api-types/v3Dot2';

import { type FilteredByValueType } from './FilteredByValueType.js';

// eslint-disable-next-line vitest/prefer-describe-function-title
describe('FilteredByValueType', () => {
  describe('having an object with optional properties of mixed types', () => {
    interface TestObject {
      bar?: number;
      baz?: string;
      foo?: string;
      record?: Record<string, string>;
    }

    describe('when used with string as value type', () => {
      it('should only include keys with matching value type', () => {
        expectTypeOf<
          keyof FilteredByValueType<TestObject, string>
        >().toEqualTypeOf<'baz' | 'foo'>();
      });
    });
  });

  describe('having OpenApi3Dot2PathItemObject', () => {
    describe('when used with OpenApi3Dot2OperationObject as value type', () => {
      it('should only include HTTP method keys', () => {
        expectTypeOf<
          keyof FilteredByValueType<
            OpenApi3Dot2PathItemObject,
            OpenApi3Dot2OperationObject
          >
        >().toEqualTypeOf<
          | 'delete'
          | 'get'
          | 'head'
          | 'options'
          | 'patch'
          | 'post'
          | 'put'
          | 'query'
          | 'trace'
        >();
      });

      it('should not include additionalOperations', () => {
        expectTypeOf<
          FilteredByValueType<
            OpenApi3Dot2PathItemObject,
            OpenApi3Dot2OperationObject
          >
        >().not.toHaveProperty('additionalOperations');
      });
    });
  });
});
