import { describe, expectTypeOf, it } from 'vitest';

import { type InspectCurrentPlanOptions } from './InspectCurrentPlanOptions.js';

type InspectCurrentPlan = (options: InspectCurrentPlanOptions) => void;

describe('InspectCurrentPlanOptions type', () => {
  describe('having no isMultiple', () => {
    it('should accept get options', () => {
      expectTypeOf<InspectCurrentPlan>().toBeCallableWith({
        autobind: true,
        name: 'name',
        optional: true,
        tag: { key: 'key', value: 'value' },
      });
    });

    it('should reject chained', () => {
      // @ts-expect-error chained requires isMultiple true
      expectTypeOf<InspectCurrentPlan>().toBeCallableWith({
        chained: true,
        name: 'name',
      });
    });
  });

  describe('having isMultiple false', () => {
    it('should reject chained', () => {
      // @ts-expect-error chained requires isMultiple true
      expectTypeOf<InspectCurrentPlan>().toBeCallableWith({
        chained: true,
        isMultiple: false,
      });
    });
  });

  describe('having isMultiple true', () => {
    it('should accept get all options', () => {
      expectTypeOf<InspectCurrentPlan>().toBeCallableWith({
        autobind: true,
        chained: true,
        isMultiple: true,
        name: 'name',
        optional: true,
        tag: { key: 'key', value: 'value' },
      });
    });
  });
});
