import { beforeAll, describe, expect, it } from 'vitest';

import { type ServiceIdentifier } from '@inversifyjs/common';
import { type BindingConstraints } from '@inversifyjs/core';

import { isBindingConstraintsWithServiceId } from './isBindingConstraintsWithServiceId.js';

describe(isBindingConstraintsWithServiceId, () => {
  describe('having a BindingConstraints with same serviceId', () => {
    let serviceIdFixture: ServiceIdentifier;

    let bindingConstraintsFixture: BindingConstraints;

    beforeAll(() => {
      serviceIdFixture = 'service-id-fixture';

      bindingConstraintsFixture = {
        serviceIdentifier: serviceIdFixture,
      } as Partial<BindingConstraints> as BindingConstraints;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isBindingConstraintsWithServiceId(serviceIdFixture)(
          bindingConstraintsFixture,
        );
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
  });

  describe('having a BindingConstraints with different serviceId', () => {
    let serviceIdFixture: ServiceIdentifier;

    let bindingConstraintsFixture: BindingConstraints;

    beforeAll(() => {
      serviceIdFixture = 'service-id-fixture';

      bindingConstraintsFixture = {
        serviceIdentifier: 'another-service-id-fixture',
      } as Partial<BindingConstraints> as BindingConstraints;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isBindingConstraintsWithServiceId(serviceIdFixture)(
          bindingConstraintsFixture,
        );
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });
});
