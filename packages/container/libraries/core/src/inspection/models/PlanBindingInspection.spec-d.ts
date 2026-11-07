import { describe, expectTypeOf, it } from 'vitest';

import { type Newable, type ServiceIdentifier } from '@inversifyjs/common';

import { type BindingScope } from '../../binding/models/BindingScope.js';
import { type PlanBindingInspection } from './PlanBindingInspection.js';
import { type PlanServiceInspection } from './PlanServiceInspection.js';

describe('PlanBindingInspection type', () => {
  describe('having type ConstantValue', () => {
    it('should expose a singleton scope', () => {
      expectTypeOf<
        Extract<PlanBindingInspection, { type: 'ConstantValue' }>['scope']
      >().toEqualTypeOf<'Singleton'>();
    });
  });

  describe('having type DynamicValue', () => {
    it('should expose any scope', () => {
      expectTypeOf<
        Extract<PlanBindingInspection, { type: 'DynamicValue' }>['scope']
      >().toEqualTypeOf<BindingScope>();
    });
  });

  describe('having type Factory', () => {
    it('should expose a singleton scope', () => {
      expectTypeOf<
        Extract<PlanBindingInspection, { type: 'Factory' }>['scope']
      >().toEqualTypeOf<'Singleton'>();
    });
  });

  describe('having type Instance', () => {
    it('should expose its planned dependencies', () => {
      expectTypeOf<
        Extract<
          PlanBindingInspection,
          { type: 'Instance' }
        >['implementationType']
      >().toEqualTypeOf<Newable>();

      expectTypeOf<
        Extract<
          PlanBindingInspection,
          { type: 'Instance' }
        >['constructorArguments']
      >().toEqualTypeOf<readonly (PlanServiceInspection | undefined)[]>();

      expectTypeOf<
        Extract<PlanBindingInspection, { type: 'Instance' }>['properties']
      >().toEqualTypeOf<ReadonlyMap<string | symbol, PlanServiceInspection>>();
    });
  });

  describe('having type ResolvedValue', () => {
    it('should expose its planned arguments', () => {
      expectTypeOf<
        Extract<PlanBindingInspection, { type: 'ResolvedValue' }>['arguments']
      >().toEqualTypeOf<readonly PlanServiceInspection[]>();
    });
  });

  describe('having type ServiceRedirection', () => {
    it('should expose its redirection', () => {
      expectTypeOf<
        Extract<
          PlanBindingInspection,
          { type: 'ServiceRedirection' }
        >['redirection']
      >().toEqualTypeOf<PlanServiceInspection>();

      expectTypeOf<
        Extract<
          PlanBindingInspection,
          { type: 'ServiceRedirection' }
        >['targetServiceIdentifier']
      >().toEqualTypeOf<ServiceIdentifier>();
    });

    it('should not expose scope', () => {
      expectTypeOf<
        Extract<PlanBindingInspection, { type: 'ServiceRedirection' }>
      >().not.toHaveProperty('scope');
    });
  });
});
