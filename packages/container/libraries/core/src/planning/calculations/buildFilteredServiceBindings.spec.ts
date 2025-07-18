import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

import { Newable } from '@inversifyjs/common';

vitest.mock('../../binding/actions/getBindingId');
vitest.mock('../../metadata/calculations/getClassMetadata');

import { getBindingId } from '../../binding/actions/getBindingId';
import { Binding } from '../../binding/models/Binding';
import { BindingConstraints } from '../../binding/models/BindingConstraints';
import {
  BindingScope,
  bindingScopeValues,
} from '../../binding/models/BindingScope';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { InstanceBinding } from '../../binding/models/InstanceBinding';
import { getClassMetadata } from '../../metadata/calculations/getClassMetadata';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';
import { BasePlanParams } from '../models/BasePlanParams';
import {
  buildFilteredServiceBindings,
  BuildFilteredServiceBindingsOptions,
} from './buildFilteredServiceBindings';

describe(buildFilteredServiceBindings, () => {
  describe('having no options', () => {
    let paramsMock: Mocked<BasePlanParams>;
    let bindingConstraintsFixture: BindingConstraints;

    beforeAll(() => {
      paramsMock = {
        getBindings: vitest.fn(),
      } as Partial<Mocked<BasePlanParams>> as Mocked<BasePlanParams>;
      bindingConstraintsFixture = {
        getAncestor: () => undefined,
        name: 'name',
        serviceIdentifier: 'service-id',
        tags: new Map(),
      };
    });

    describe('when called, and params.getBinding() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildFilteredServiceBindings(
          paramsMock,
          bindingConstraintsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getBinding()', () => {
        expect(paramsMock.getBindings).toHaveBeenCalledTimes(1);
        expect(paramsMock.getBindings).toHaveBeenCalledWith(
          bindingConstraintsFixture.serviceIdentifier,
        );
      });

      it('should return empty array', () => {
        expect(result).toStrictEqual([]);
      });
    });

    describe('when called, and params.getBinding() returns Binding[]', () => {
      let bindingFixture: Binding;

      let result: unknown;

      beforeAll(() => {
        bindingFixture = {
          cache: {
            isRight: false,
            value: undefined,
          },
          id: 1,
          isSatisfiedBy: () => true,
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: 'service-id',
          type: bindingTypeValues.ConstantValue,
          value: Symbol(),
        };

        paramsMock.getBindings.mockReturnValueOnce([bindingFixture]);

        result = buildFilteredServiceBindings(
          paramsMock,
          bindingConstraintsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getBinding()', () => {
        expect(paramsMock.getBindings).toHaveBeenCalledTimes(1);
        expect(paramsMock.getBindings).toHaveBeenCalledWith(
          bindingConstraintsFixture.serviceIdentifier,
        );
      });

      it('should return an array with a binding', () => {
        expect(result).toStrictEqual([bindingFixture]);
      });
    });
  });

  describe('having options with autobindOptions and bindingConstraints with Function serviceIdentifier', () => {
    let bindingScopeFixture: BindingScope;
    let paramsMock: Mocked<BasePlanParams>;
    let bindingConstraintsFixture: BindingConstraints;
    let optionsFixture: BuildFilteredServiceBindingsOptions;

    beforeAll(() => {
      bindingScopeFixture = bindingScopeValues.Singleton;
      paramsMock = {
        autobindOptions: {
          scope: bindingScopeFixture,
        },
        getBindings: vitest.fn(),
        setBinding: vitest.fn(),
      } as Partial<Mocked<BasePlanParams>> as Mocked<BasePlanParams>;
      bindingConstraintsFixture = {
        getAncestor: () => undefined,
        name: 'name',
        serviceIdentifier: class {},
        tags: new Map(),
      };
      optionsFixture = {};
    });

    describe('when called, and params.getBinding() returns undefined and getClassMetadata() returns ClassMetadata with undefined scope', () => {
      let bindingIdFixture: number;
      let classMetadataFixture: ClassMetadata;

      let result: unknown;

      beforeAll(() => {
        bindingIdFixture = 0;

        classMetadataFixture = {
          constructorArguments: [],
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          properties: new Map(),
          scope: undefined,
        };

        vitest
          .mocked(getClassMetadata)
          .mockReturnValueOnce(classMetadataFixture);

        vitest.mocked(getBindingId).mockReturnValueOnce(bindingIdFixture);

        result = buildFilteredServiceBindings(
          paramsMock,
          bindingConstraintsFixture,
          optionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getBinding()', () => {
        expect(paramsMock.getBindings).toHaveBeenCalledTimes(1);
        expect(paramsMock.getBindings).toHaveBeenCalledWith(
          bindingConstraintsFixture.serviceIdentifier,
        );
      });

      it('should call getClassMetadata()', () => {
        expect(getClassMetadata).toHaveBeenCalledTimes(1);
        expect(getClassMetadata).toHaveBeenCalledWith(
          bindingConstraintsFixture.serviceIdentifier,
        );
      });

      it('should call getBindingId()', () => {
        expect(getBindingId).toHaveBeenCalledTimes(1);
        expect(getBindingId).toHaveBeenCalledWith();
      });

      it('should call params.setBinding()', () => {
        const expected: InstanceBinding<unknown> = {
          cache: {
            isRight: false,
            value: undefined,
          },
          id: bindingIdFixture,
          implementationType:
            bindingConstraintsFixture.serviceIdentifier as Newable,
          isSatisfiedBy: expect.any(Function) as unknown as () => boolean,
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeFixture,
          serviceIdentifier: bindingConstraintsFixture.serviceIdentifier,
          type: bindingTypeValues.Instance,
        };

        expect(paramsMock.setBinding).toHaveBeenCalledTimes(1);
        expect(paramsMock.setBinding).toHaveBeenCalledWith(expected);
      });

      it('should return an array with a binding', () => {
        const expected: InstanceBinding<unknown> = {
          cache: {
            isRight: false,
            value: undefined,
          },
          id: 0,
          implementationType:
            bindingConstraintsFixture.serviceIdentifier as Newable,
          isSatisfiedBy: expect.any(Function) as unknown as () => boolean,
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: bindingScopeFixture,
          serviceIdentifier: bindingConstraintsFixture.serviceIdentifier,
          type: bindingTypeValues.Instance,
        };

        expect(result).toStrictEqual([expected]);
      });
    });

    describe('when called, and params.getBinding() returns undefined and getClassMetadata() returns ClassMetadata with scope', () => {
      let bindingIdFixture: number;
      let classMetadataFixture: ClassMetadata;
      let classMetadataScopeFixture: BindingScope;

      let result: unknown;

      beforeAll(() => {
        bindingIdFixture = 0;

        classMetadataScopeFixture = bindingScopeValues.Request;
        classMetadataFixture = {
          constructorArguments: [],
          lifecycle: {
            postConstructMethodName: undefined,
            preDestroyMethodName: undefined,
          },
          properties: new Map(),
          scope: classMetadataScopeFixture,
        };

        vitest
          .mocked(getClassMetadata)
          .mockReturnValueOnce(classMetadataFixture);

        vitest.mocked(getBindingId).mockReturnValueOnce(bindingIdFixture);

        result = buildFilteredServiceBindings(
          paramsMock,
          bindingConstraintsFixture,
          optionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getBinding()', () => {
        expect(paramsMock.getBindings).toHaveBeenCalledTimes(1);
        expect(paramsMock.getBindings).toHaveBeenCalledWith(
          bindingConstraintsFixture.serviceIdentifier,
        );
      });

      it('should call getClassMetadata()', () => {
        expect(getClassMetadata).toHaveBeenCalledTimes(1);
        expect(getClassMetadata).toHaveBeenCalledWith(
          bindingConstraintsFixture.serviceIdentifier,
        );
      });

      it('should call getBindingId()', () => {
        expect(getBindingId).toHaveBeenCalledTimes(1);
        expect(getBindingId).toHaveBeenCalledWith();
      });

      it('should call params.setBinding()', () => {
        const expected: InstanceBinding<unknown> = {
          cache: {
            isRight: false,
            value: undefined,
          },
          id: bindingIdFixture,
          implementationType:
            bindingConstraintsFixture.serviceIdentifier as Newable,
          isSatisfiedBy: expect.any(Function) as unknown as () => boolean,
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: classMetadataScopeFixture,
          serviceIdentifier: bindingConstraintsFixture.serviceIdentifier,
          type: bindingTypeValues.Instance,
        };

        expect(paramsMock.setBinding).toHaveBeenCalledTimes(1);
        expect(paramsMock.setBinding).toHaveBeenCalledWith(expected);
      });

      it('should return an array with a binding', () => {
        const expected: InstanceBinding<unknown> = {
          cache: {
            isRight: false,
            value: undefined,
          },
          id: bindingIdFixture,
          implementationType:
            bindingConstraintsFixture.serviceIdentifier as Newable,
          isSatisfiedBy: expect.any(Function) as unknown as () => boolean,
          moduleId: undefined,
          onActivation: undefined,
          onDeactivation: undefined,
          scope: classMetadataScopeFixture,
          serviceIdentifier: bindingConstraintsFixture.serviceIdentifier,
          type: bindingTypeValues.Instance,
        };

        expect(result).toStrictEqual([expected]);
      });
    });
  });

  describe('having options with customServiceIdentifier', () => {
    let paramsMock: Mocked<BasePlanParams>;
    let bindingConstraintsFixture: BindingConstraints;
    let optionsFixture: BuildFilteredServiceBindingsOptions;

    beforeAll(() => {
      paramsMock = {
        getBindings: vitest.fn(),
      } as Partial<Mocked<BasePlanParams>> as Mocked<BasePlanParams>;
      bindingConstraintsFixture = {
        getAncestor: () => undefined,
        name: 'name',
        serviceIdentifier: 'service-id',
        tags: new Map(),
      };
      optionsFixture = {
        customServiceIdentifier: 'custom-service-id',
      };
    });

    describe('when called, and params.getBinding() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildFilteredServiceBindings(
          paramsMock,
          bindingConstraintsFixture,
          optionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getBinding()', () => {
        expect(paramsMock.getBindings).toHaveBeenCalledTimes(1);
        expect(paramsMock.getBindings).toHaveBeenCalledWith(
          optionsFixture.customServiceIdentifier,
        );
      });

      it('should return empty array', () => {
        expect(result).toStrictEqual([]);
      });
    });
  });

  describe('having options with chained', () => {
    let paramsMock: Mocked<BasePlanParams>;
    let bindingConstraintsFixture: BindingConstraints;
    let optionsFixture: BuildFilteredServiceBindingsOptions;

    beforeAll(() => {
      paramsMock = {
        getBindingsChained: vitest.fn(),
      } as Partial<Mocked<BasePlanParams>> as Mocked<BasePlanParams>;
      bindingConstraintsFixture = {
        getAncestor: () => undefined,
        name: 'name',
        serviceIdentifier: 'service-id',
        tags: new Map(),
      };
      optionsFixture = {
        chained: true,
      };
    });

    describe('when called, and params.getBindingsChained() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        paramsMock.getBindingsChained.mockImplementationOnce(function* () {});

        result = buildFilteredServiceBindings(
          paramsMock,
          bindingConstraintsFixture,
          optionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call params.getBindingsChained()', () => {
        expect(paramsMock.getBindingsChained).toHaveBeenCalledTimes(1);
        expect(paramsMock.getBindingsChained).toHaveBeenCalledWith(
          bindingConstraintsFixture.serviceIdentifier,
        );
      });

      it('should return empty array', () => {
        expect(result).toStrictEqual([]);
      });
    });
  });
});
