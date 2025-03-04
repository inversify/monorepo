import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock('../../common/models/OneToManyMapStar');

import { ServiceIdentifier } from '@inversifyjs/common';

import { OneToManyMapStar } from '../../common/models/OneToManyMapStar';
import { ConstantValueBindingFixtures } from '../fixtures/ConstantValueBindingFixtures';
import { Binding } from '../models/Binding';
import { BindingRelation, BindingService } from './BindingService';

describe(BindingService.name, () => {
  let bindingMapsMock: Mocked<
    OneToManyMapStar<Binding<unknown>, BindingRelation>
  >;

  let parentBindingService: BindingService;
  let bindingService: BindingService;

  beforeAll(() => {
    bindingMapsMock = new OneToManyMapStar<Binding<unknown>, BindingRelation>({
      moduleId: {
        isOptional: true,
      },
      serviceId: {
        isOptional: false,
      },
    }) as Mocked<OneToManyMapStar<Binding<unknown>, BindingRelation>>;

    parentBindingService = BindingService.build(undefined);

    bindingService = BindingService.build(parentBindingService);
  });

  describe('.clone', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        bindingMapsMock.clone.mockReturnValueOnce(bindingMapsMock);

        result = bindingService.clone();
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call activationMaps.clone()', () => {
        expect(bindingMapsMock.clone).toHaveBeenCalledTimes(1);
        expect(bindingMapsMock.clone).toHaveBeenCalledWith();
      });

      it('should return a clone()', () => {
        expect(result).toStrictEqual(bindingService);
      });
    });
  });

  describe('.get', () => {
    let serviceIdFixture: ServiceIdentifier;

    beforeAll(() => {
      serviceIdFixture = 'service-identifier';
    });

    describe('when called, and bindingMaps.get() returns undefined and parent bindingMaps.get() returns Iterable', () => {
      let bindingFixture: Binding<unknown>;

      let result: unknown;

      beforeAll(() => {
        bindingFixture = Symbol() as unknown as Binding<unknown>;

        bindingMapsMock.get
          .mockReturnValueOnce(undefined)
          .mockReturnValueOnce([bindingFixture]);

        result = bindingService.get(serviceIdFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingMaps.get()', () => {
        expect(bindingMapsMock.get).toHaveBeenCalledTimes(2);
        expect(bindingMapsMock.get).toHaveBeenNthCalledWith(
          1,
          'serviceId',
          serviceIdFixture,
        );
        expect(bindingMapsMock.get).toHaveBeenNthCalledWith(
          2,
          'serviceId',
          serviceIdFixture,
        );
      });

      it('should return Binding[]', () => {
        expect(result).toStrictEqual([bindingFixture]);
      });
    });

    describe('when called, and bindingMaps.get() returns Iterable', () => {
      let bindingFixture: Binding<unknown>;

      let result: unknown;

      beforeAll(() => {
        bindingFixture = Symbol() as unknown as Binding<unknown>;

        bindingMapsMock.get.mockReturnValueOnce([bindingFixture]);

        result = bindingService.get(serviceIdFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingMaps.get()', () => {
        expect(bindingMapsMock.get).toHaveBeenCalledTimes(1);
        expect(bindingMapsMock.get).toHaveBeenCalledWith(
          'serviceId',
          serviceIdFixture,
        );
      });

      it('should return BindingActivation[]', () => {
        expect(result).toStrictEqual([bindingFixture]);
      });
    });
  });

  describe('.getNonParentBindings', () => {
    let serviceIdFixture: ServiceIdentifier;

    beforeAll(() => {
      serviceIdFixture = 'service-id';
    });

    describe('when called', () => {
      let bindingsFixture: Iterable<Binding<unknown>>;

      let result: Iterable<Binding> | undefined;

      beforeAll(() => {
        bindingsFixture = [ConstantValueBindingFixtures.any];

        bindingMapsMock.get.mockReturnValueOnce(bindingsFixture);

        result = bindingService.getNonParentBindings(serviceIdFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingMaps.get() with the correct parameters', () => {
        expect(bindingMapsMock.get).toHaveBeenCalledTimes(1);
        expect(bindingMapsMock.get).toHaveBeenCalledWith(
          'serviceId',
          serviceIdFixture,
        );
      });

      it('should return the expected bindings', () => {
        expect(result).toBe(bindingsFixture);
      });
    });
  });

  describe('.getByModuleId', () => {
    let moduleIdFixture: number;

    beforeAll(() => {
      moduleIdFixture = 1;
    });

    describe('when called, and bindingMaps.get() returns undefined and parent bindingMaps.get() returns Iterable', () => {
      let bindingFixture: Binding<unknown>;

      let result: unknown;

      beforeAll(() => {
        bindingFixture = Symbol() as unknown as Binding<unknown>;

        bindingMapsMock.get
          .mockReturnValueOnce(undefined)
          .mockReturnValueOnce([bindingFixture]);

        result = bindingService.getByModuleId(moduleIdFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingMaps.get()', () => {
        expect(bindingMapsMock.get).toHaveBeenCalledTimes(2);
        expect(bindingMapsMock.get).toHaveBeenNthCalledWith(
          1,
          'moduleId',
          moduleIdFixture,
        );
        expect(bindingMapsMock.get).toHaveBeenNthCalledWith(
          2,
          'moduleId',
          moduleIdFixture,
        );
      });

      it('should return Binding[]', () => {
        expect(result).toStrictEqual([bindingFixture]);
      });
    });

    describe('when called, and bindingMaps.get() returns Iterable', () => {
      let bindingFixture: Binding<unknown>;

      let result: unknown;

      beforeAll(() => {
        bindingFixture = Symbol() as unknown as Binding<unknown>;

        bindingMapsMock.get.mockReturnValueOnce([bindingFixture]);

        result = bindingService.getByModuleId(moduleIdFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingMaps.get()', () => {
        expect(bindingMapsMock.get).toHaveBeenCalledTimes(1);
        expect(bindingMapsMock.get).toHaveBeenCalledWith(
          'moduleId',
          moduleIdFixture,
        );
      });

      it('should return BindingActivation[]', () => {
        expect(result).toStrictEqual([bindingFixture]);
      });
    });
  });

  describe('.getNonParentBoundServices', () => {
    describe('when called', () => {
      let serviceIdsFixture: ServiceIdentifier[];

      let result: Iterable<ServiceIdentifier>;

      beforeAll(() => {
        serviceIdsFixture = ['service-id-1', 'service-id-2'];

        bindingMapsMock.getAllKeys.mockReturnValueOnce(serviceIdsFixture);

        result = bindingService.getNonParentBoundServices();
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return the non-parent bound services', () => {
        expect(result).toStrictEqual(serviceIdsFixture);
      });

      it('should call bindingMaps.getAllKeys()', () => {
        expect(bindingMapsMock.getAllKeys).toHaveBeenCalledTimes(1);
        expect(bindingMapsMock.getAllKeys).toHaveBeenCalledWith('serviceId');
      });
    });
  });

  describe('.removeAllByModuleId', () => {
    let moduleIdFixture: number;

    beforeAll(() => {
      moduleIdFixture = 3;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = bindingService.removeAllByModuleId(moduleIdFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingMaps.removeByRelation()', () => {
        expect(bindingMapsMock.removeByRelation).toHaveBeenCalledTimes(1);
        expect(bindingMapsMock.removeByRelation).toHaveBeenCalledWith(
          'moduleId',
          moduleIdFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.removeAllByServiceId', () => {
    let serviceIdFixture: ServiceIdentifier;

    beforeAll(() => {
      serviceIdFixture = 'service-id';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = bindingService.removeAllByServiceId(serviceIdFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingMaps.removeByRelation()', () => {
        expect(bindingMapsMock.removeByRelation).toHaveBeenCalledTimes(1);
        expect(bindingMapsMock.removeByRelation).toHaveBeenCalledWith(
          'serviceId',
          serviceIdFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.set', () => {
    describe('having a binding with no container id', () => {
      let bindingFixture: Binding<unknown>;

      beforeAll(() => {
        bindingFixture = ConstantValueBindingFixtures.withModuleIdUndefined;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = bindingService.set(bindingFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call bindingMaps.add()', () => {
          const expectedRelation: BindingRelation = {
            serviceId: bindingFixture.serviceIdentifier,
          };

          expect(bindingMapsMock.add).toHaveBeenCalledTimes(1);
          expect(bindingMapsMock.add).toHaveBeenCalledWith(
            bindingFixture,
            expectedRelation,
          );
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });

    describe('having a binding with container id', () => {
      let bindingFixture: Binding<unknown>;

      beforeAll(() => {
        bindingFixture = ConstantValueBindingFixtures.withModuleId;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = bindingService.set(bindingFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call bindingMaps.add()', () => {
          const expectedRelation: BindingRelation = {
            moduleId: bindingFixture.moduleId as number,
            serviceId: bindingFixture.serviceIdentifier,
          };

          expect(bindingMapsMock.add).toHaveBeenCalledTimes(1);
          expect(bindingMapsMock.add).toHaveBeenCalledWith(
            bindingFixture,
            expectedRelation,
          );
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });
  });
});
