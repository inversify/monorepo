import { describe, expectTypeOf, it } from 'vitest';

import { type PlanBindingInspection } from './PlanBindingInspection.js';
import { type PlanServiceInspection } from './PlanServiceInspection.js';

describe('PlanServiceInspection type', () => {
  describe('having isMultiple false', () => {
    it('should expose an optional binding', () => {
      expectTypeOf<
        Extract<PlanServiceInspection, { isMultiple: false }>
      >().toHaveProperty('binding');

      expectTypeOf<
        Extract<PlanServiceInspection, { isMultiple: false }>['binding']
      >().toEqualTypeOf<PlanBindingInspection | undefined>();
    });

    it('should not expose bindings nor chained', () => {
      expectTypeOf<
        Extract<PlanServiceInspection, { isMultiple: false }>
      >().not.toHaveProperty('bindings');

      expectTypeOf<
        Extract<PlanServiceInspection, { isMultiple: false }>
      >().not.toHaveProperty('chained');
    });
  });

  describe('having isMultiple true', () => {
    it('should expose bindings and chained', () => {
      expectTypeOf<
        Extract<PlanServiceInspection, { isMultiple: true }>['bindings']
      >().toEqualTypeOf<readonly PlanBindingInspection[]>();

      expectTypeOf<
        Extract<PlanServiceInspection, { isMultiple: true }>['chained']
      >().toEqualTypeOf<boolean>();
    });

    it('should not expose binding', () => {
      expectTypeOf<
        Extract<PlanServiceInspection, { isMultiple: true }>
      >().not.toHaveProperty('binding');
    });
  });
});
