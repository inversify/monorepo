import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { bindingTypeValues } from '../models/BindingType.js';
import { type ConstantValueBinding } from '../models/ConstantValueBinding.js';
import { type DynamicValueBinding } from '../models/DynamicValueBinding.js';
import { type Factory } from '../models/Factory.js';
import { type FactoryBinding } from '../models/FactoryBinding.js';
import { type InstanceBinding } from '../models/InstanceBinding.js';
import { type ResolvedValueBinding } from '../models/ResolvedValueBinding.js';
import { type ServiceRedirectionBinding } from '../models/ServiceRedirectionBinding.js';
import { cloneBinding } from './cloneBinding.js';
import { cloneConstantValueBinding } from './cloneConstantValueBinding.js';
import { cloneDynamicValueBinding } from './cloneDynamicValueBinding.js';
import { cloneFactoryBinding } from './cloneFactoryBinding.js';
import { cloneInstanceBinding } from './cloneInstanceBinding.js';
import { cloneResolvedValueBinding } from './cloneResolvedValueBinding.js';
import { cloneServiceRedirectionBinding } from './cloneServiceRedirectionBinding.js';

// Mock all clone functions
vitest.mock(import('./cloneConstantValueBinding.js'));
vitest.mock(import('./cloneDynamicValueBinding.js'));
vitest.mock(import('./cloneFactoryBinding.js'));
vitest.mock(import('./cloneInstanceBinding.js'));
vitest.mock(import('./cloneResolvedValueBinding.js'));
vitest.mock(import('./cloneServiceRedirectionBinding.js'));

describe(cloneBinding, () => {
  // Common setup
  beforeAll(() => {
    // Reset mocks before each test
    vitest.mocked(cloneConstantValueBinding).mockReset();
    vitest.mocked(cloneDynamicValueBinding).mockReset();
    vitest.mocked(cloneFactoryBinding).mockReset();
    vitest.mocked(cloneInstanceBinding).mockReset();
    vitest.mocked(cloneResolvedValueBinding).mockReset();
    vitest.mocked(cloneServiceRedirectionBinding).mockReset();
  });

  afterAll(() => {
    vitest.clearAllMocks();
  });

  describe('having a ConstantValueBinding', () => {
    let bindingFixture: ConstantValueBinding<unknown>;

    beforeAll(() => {
      bindingFixture = {
        cache: {
          isRight: false,
          value: undefined,
        },
        id: 0,
        isSatisfiedBy: () => true,
        moduleId: 1,
        onActivation: vitest.fn(),
        onDeactivation: vitest.fn(),
        scope: 'Singleton',
        serviceIdentifier: Symbol(),
        type: bindingTypeValues.ConstantValue,
        value: Symbol(),
      };
    });

    describe('when called', () => {
      let clonedBindingFixture: ConstantValueBinding<unknown>;
      let result: unknown;

      beforeAll(() => {
        clonedBindingFixture = { ...bindingFixture };

        vitest
          .mocked(cloneConstantValueBinding)
          .mockReturnValueOnce(clonedBindingFixture);

        result = cloneBinding(bindingFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call cloneConstantValueBinding', () => {
        expect(cloneConstantValueBinding).toHaveBeenCalledExactlyOnceWith(
          bindingFixture,
        );
      });

      it('should return the cloned binding', () => {
        expect(result).toBe(clonedBindingFixture);
      });
    });
  });

  describe('having a DynamicValueBinding', () => {
    let bindingFixture: DynamicValueBinding<unknown>;

    beforeAll(() => {
      bindingFixture = {
        cache: {
          isRight: false,
          value: undefined,
        },
        id: 0,
        isSatisfiedBy: () => true,
        moduleId: 1,
        onActivation: vitest.fn(),
        onDeactivation: vitest.fn(),
        scope: 'Singleton',
        serviceIdentifier: Symbol(),
        type: bindingTypeValues.DynamicValue,
        value: vitest.fn(),
      };
    });

    describe('when called', () => {
      let clonedBindingFixture: DynamicValueBinding<unknown>;
      let result: unknown;

      beforeAll(() => {
        clonedBindingFixture = { ...bindingFixture };

        vitest
          .mocked(cloneDynamicValueBinding)
          .mockReturnValueOnce(clonedBindingFixture);

        result = cloneBinding(bindingFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call cloneDynamicValueBinding', () => {
        expect(cloneDynamicValueBinding).toHaveBeenCalledExactlyOnceWith(
          bindingFixture,
        );
      });

      it('should return the cloned binding', () => {
        expect(result).toBe(clonedBindingFixture);
      });
    });
  });

  describe('having a FactoryBinding', () => {
    let bindingFixture: FactoryBinding<Factory<unknown>>;
    let clonedBindingFixture: FactoryBinding<Factory<unknown>>;
    let result: unknown;

    beforeAll(() => {
      bindingFixture = {
        cache: {
          isRight: false,
          value: undefined,
        },
        factory: vitest.fn(),
        id: 0,
        isSatisfiedBy: () => true,
        moduleId: 1,
        onActivation: vitest.fn(),
        onDeactivation: vitest.fn(),
        scope: 'Singleton',
        serviceIdentifier: Symbol(),
        type: bindingTypeValues.Factory,
      };

      clonedBindingFixture = { ...bindingFixture };

      vitest
        .mocked(cloneFactoryBinding)
        .mockReturnValueOnce(clonedBindingFixture);

      result = cloneBinding(bindingFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call cloneFactoryBinding', () => {
      expect(cloneFactoryBinding).toHaveBeenCalledExactlyOnceWith(
        bindingFixture,
      );
    });

    it('should return the cloned binding', () => {
      expect(result).toBe(clonedBindingFixture);
    });
  });

  describe('having an InstanceBinding', () => {
    let bindingFixture: InstanceBinding<unknown>;
    let clonedBindingFixture: InstanceBinding<unknown>;
    let result: unknown;

    beforeAll(() => {
      bindingFixture = {
        cache: {
          isRight: false,
          value: undefined,
        },
        id: 0,
        implementationType: class {},
        isSatisfiedBy: () => true,
        moduleId: 1,
        onActivation: vitest.fn(),
        onDeactivation: vitest.fn(),
        scope: 'Singleton',
        serviceIdentifier: Symbol(),
        type: bindingTypeValues.Instance,
      };

      clonedBindingFixture = { ...bindingFixture };

      vitest
        .mocked(cloneInstanceBinding)
        .mockReturnValueOnce(clonedBindingFixture);

      result = cloneBinding(bindingFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call cloneInstanceBinding', () => {
      expect(cloneInstanceBinding).toHaveBeenCalledExactlyOnceWith(
        bindingFixture,
      );
    });

    it('should return the cloned binding', () => {
      expect(result).toBe(clonedBindingFixture);
    });
  });

  describe('having a ResolvedValueBinding', () => {
    let bindingFixture: ResolvedValueBinding<unknown>;
    let clonedBindingFixture: ResolvedValueBinding<unknown>;
    let result: unknown;

    beforeAll(() => {
      bindingFixture = {
        cache: {
          isRight: false,
          value: undefined,
        },
        factory: vitest.fn(),
        id: 0,
        isSatisfiedBy: () => true,
        metadata: {
          arguments: [],
        },
        moduleId: 1,
        onActivation: vitest.fn(),
        onDeactivation: vitest.fn(),
        scope: 'Singleton',
        serviceIdentifier: Symbol(),
        type: bindingTypeValues.ResolvedValue,
      };

      clonedBindingFixture = { ...bindingFixture };

      vitest
        .mocked(cloneResolvedValueBinding)
        .mockReturnValueOnce(clonedBindingFixture);

      result = cloneBinding(bindingFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call cloneResolvedValueBinding', () => {
      expect(cloneResolvedValueBinding).toHaveBeenCalledExactlyOnceWith(
        bindingFixture,
      );
    });

    it('should return the cloned binding', () => {
      expect(result).toBe(clonedBindingFixture);
    });
  });

  describe('having a ServiceRedirectionBinding', () => {
    let bindingFixture: ServiceRedirectionBinding<unknown>;
    let clonedBindingFixture: ServiceRedirectionBinding<unknown>;
    let result: unknown;

    beforeAll(() => {
      bindingFixture = {
        id: 0,
        isSatisfiedBy: () => true,
        moduleId: 1,
        serviceIdentifier: Symbol(),
        targetServiceIdentifier: Symbol(),
        type: bindingTypeValues.ServiceRedirection,
      };

      clonedBindingFixture = { ...bindingFixture };

      vitest
        .mocked(cloneServiceRedirectionBinding)
        .mockReturnValueOnce(clonedBindingFixture);

      result = cloneBinding(bindingFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call cloneServiceRedirectionBinding', () => {
      expect(cloneServiceRedirectionBinding).toHaveBeenCalledExactlyOnceWith(
        bindingFixture,
      );
    });

    it('should return the cloned binding', () => {
      expect(result).toBe(clonedBindingFixture);
    });
  });
});
