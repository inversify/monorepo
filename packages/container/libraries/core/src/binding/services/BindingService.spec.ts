import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock('../calculations/buildInstanceBinding');
vitest.mock('../../common/models/OneToManyMapStar');

import { Newable, ServiceIdentifier } from '@inversifyjs/common';

import { OneToManyMapStar } from '../../common/models/OneToManyMapStar';
import { buildInstanceBinding } from '../calculations/buildInstanceBinding';
import { ConstantValueBindingFixtures } from '../fixtures/ConstantValueBindingFixtures';
import { AutobindOptions } from '../models/AutobindOptions';
import { Binding } from '../models/Binding';
import { bindingScopeValues } from '../models/BindingScope';
import { InstanceBinding } from '../models/InstanceBinding';
import { BindingRelation, BindingService } from './BindingService';

describe(BindingService, () => {
  let bindingMapsMock: Mocked<
    OneToManyMapStar<Binding<unknown>, BindingRelation>
  >;

  let parentBindingService: BindingService;
  let bindingService: BindingService;

  beforeAll(() => {
    bindingMapsMock = new OneToManyMapStar<Binding<unknown>, BindingRelation>({
      id: {
        isOptional: false,
      },
      moduleId: {
        isOptional: true,
      },
      serviceId: {
        isOptional: false,
      },
    }) as Mocked<OneToManyMapStar<Binding<unknown>, BindingRelation>>;

    parentBindingService = BindingService.build(() => undefined);

    bindingService = BindingService.build(() => parentBindingService, {
      scope: bindingScopeValues.Singleton,
    });
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
        expect(bindingMapsMock.clone).toHaveBeenCalledExactlyOnceWith();
      });

      it('should return a clone()', () => {
        expect(result).toStrictEqual(bindingService);
      });
    });
  });

  describe('.get', () => {
    describe('having a non function service identifier', () => {
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
          expect(bindingMapsMock.get).toHaveBeenCalledExactlyOnceWith(
            'serviceId',
            serviceIdFixture,
          );
        });

        it('should return BindingActivation[]', () => {
          expect(result).toStrictEqual([bindingFixture]);
        });
      });
    });

    describe('having a function service identifier', () => {
      let serviceIdFixture: Newable;

      beforeAll(() => {
        serviceIdFixture = class Foo {};
      });

      describe('when called, and bindingMaps.get() returns undefined and parent bindingMaps.get() returns undefined', () => {
        let instanceBindingFixture: InstanceBinding<unknown>;

        let result: unknown;

        beforeAll(() => {
          instanceBindingFixture =
            Symbol() as unknown as InstanceBinding<unknown>;

          bindingMapsMock.get
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(undefined);

          vitest
            .mocked(buildInstanceBinding)
            .mockReturnValueOnce(instanceBindingFixture);

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

        it('should call buildInstanceBinding()', () => {
          const expectedAutobindingOptions: AutobindOptions = {
            scope: bindingScopeValues.Singleton,
          };

          expect(buildInstanceBinding).toHaveBeenCalledExactlyOnceWith(
            expectedAutobindingOptions,
            serviceIdFixture,
          );
        });

        it('should return Binding[]', () => {
          expect(result).toStrictEqual([instanceBindingFixture]);
        });
      });
    });
  });

  describe('.getChained', () => {
    let serviceIdFixture: ServiceIdentifier;

    beforeAll(() => {
      serviceIdFixture = 'service-identifier';
    });

    describe('when called, and current bindingService.get() returns bindings', () => {
      let bindingFixture: Binding<unknown>;
      let bindingServiceWithoutParent: BindingService;

      let result: unknown;

      beforeAll(() => {
        bindingFixture = Symbol() as unknown as Binding<unknown>;

        bindingServiceWithoutParent = BindingService.build(() => undefined);

        bindingMapsMock.get.mockReturnValueOnce([bindingFixture]);

        result = [...bindingServiceWithoutParent.getChained(serviceIdFixture)];
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingMaps.get()', () => {
        expect(bindingMapsMock.get).toHaveBeenCalledExactlyOnceWith(
          'serviceId',
          serviceIdFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toStrictEqual([bindingFixture]);
      });
    });

    describe('when called, and current bindingService.get() returns no bindings and parent.get() returns bindings', () => {
      let parentBindingFixture: Binding<unknown>;

      let result: unknown;

      beforeAll(() => {
        parentBindingFixture = Symbol() as unknown as Binding<unknown>;

        // Mock current container returning undefined
        bindingMapsMock.get.mockReturnValueOnce(undefined);
        // Mock parent container returning bindings
        bindingMapsMock.get.mockReturnValueOnce([parentBindingFixture]);

        result = [...bindingService.getChained(serviceIdFixture)];
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

      it('should return expected result', () => {
        expect(result).toStrictEqual([parentBindingFixture]);
      });
    });

    describe('when called, and bindingService.get() returns bindings and parent.get() returns bindings', () => {
      let currentBindingFixture: Binding<unknown>;
      let parentBindingFixture: Binding<unknown>;

      let result: unknown;

      beforeAll(() => {
        currentBindingFixture = Symbol() as unknown as Binding<unknown>;
        parentBindingFixture = Symbol() as unknown as Binding<unknown>;

        // Mock current container returning bindings
        bindingMapsMock.get.mockReturnValueOnce([currentBindingFixture]);
        // Mock parent container returning bindings
        bindingMapsMock.get.mockReturnValueOnce([parentBindingFixture]);

        result = [...bindingService.getChained(serviceIdFixture)];
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

      it('should return concatenated bindings from current and parent containers', () => {
        expect(result).toStrictEqual([
          currentBindingFixture,
          parentBindingFixture,
        ]);
      });
    });

    describe('when called, and current bindingService.get() returns no bindings and parent.get() returns no bindings', () => {
      let result: unknown;

      beforeAll(() => {
        // Mock both current and parent containers returning undefined
        bindingMapsMock.get.mockReturnValueOnce(undefined);
        bindingMapsMock.get.mockReturnValueOnce(undefined);

        result = [...bindingService.getChained(serviceIdFixture)];
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

      it('should return empty array', () => {
        expect(result).toStrictEqual([]);
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

      it('should call bindingMaps.get()', () => {
        expect(bindingMapsMock.get).toHaveBeenCalledExactlyOnceWith(
          'serviceId',
          serviceIdFixture,
        );
      });

      it('should return the expected bindings', () => {
        expect(result).toBe(bindingsFixture);
      });
    });
  });

  describe('.getById', () => {
    let idFixture: number;

    beforeAll(() => {
      idFixture = 1;
    });

    describe('when called, and bindingMaps.get() returns undefined and parent bindingMaps.get() returns Iterable', () => {
      let bindingFixture: Binding<unknown>;

      let result: unknown;

      beforeAll(() => {
        bindingFixture = Symbol() as unknown as Binding<unknown>;

        bindingMapsMock.get
          .mockReturnValueOnce(undefined)
          .mockReturnValueOnce([bindingFixture]);

        result = bindingService.getById(idFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingMaps.get()', () => {
        expect(bindingMapsMock.get).toHaveBeenCalledTimes(2);
        expect(bindingMapsMock.get).toHaveBeenNthCalledWith(1, 'id', idFixture);
        expect(bindingMapsMock.get).toHaveBeenNthCalledWith(2, 'id', idFixture);
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

        result = bindingService.getById(idFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingMaps.get()', () => {
        expect(bindingMapsMock.get).toHaveBeenCalledExactlyOnceWith(
          'id',
          idFixture,
        );
      });

      it('should return BindingActivation[]', () => {
        expect(result).toStrictEqual([bindingFixture]);
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
        expect(bindingMapsMock.get).toHaveBeenCalledExactlyOnceWith(
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
        expect(bindingMapsMock.getAllKeys).toHaveBeenCalledExactlyOnceWith(
          'serviceId',
        );
      });
    });
  });

  describe('.getBoundServices', () => {
    describe('when called', () => {
      let currentServiceIdsFixture: ServiceIdentifier[];
      let parentServiceIdsFixture: ServiceIdentifier[];
      let combinedServiceIdsFixture: Set<ServiceIdentifier>;

      let result: Iterable<ServiceIdentifier>;

      beforeAll(() => {
        currentServiceIdsFixture = ['service-id-1', 'service-id-2'];
        parentServiceIdsFixture = ['service-id-2', 'service-id-3'];
        combinedServiceIdsFixture = new Set<ServiceIdentifier>([
          ...currentServiceIdsFixture,
          ...parentServiceIdsFixture,
        ]);

        bindingMapsMock.getAllKeys
          .mockReturnValueOnce(currentServiceIdsFixture)
          .mockReturnValueOnce(parentServiceIdsFixture);

        result = bindingService.getBoundServices();
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingMaps.getAllKeys()', () => {
        expect(bindingMapsMock.getAllKeys).toHaveBeenCalledTimes(2);
        expect(bindingMapsMock.getAllKeys).toHaveBeenNthCalledWith(
          1,
          'serviceId',
        );
        expect(bindingMapsMock.getAllKeys).toHaveBeenNthCalledWith(
          2,
          'serviceId',
        );
      });

      it('should return a combined set of service identifiers', () => {
        expect(result).toStrictEqual(combinedServiceIdsFixture);
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
        expect(
          bindingMapsMock.removeByRelation,
        ).toHaveBeenCalledExactlyOnceWith('moduleId', moduleIdFixture);
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
        expect(
          bindingMapsMock.removeByRelation,
        ).toHaveBeenCalledExactlyOnceWith('serviceId', serviceIdFixture);
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
            id: bindingFixture.id,
            serviceId: bindingFixture.serviceIdentifier,
          };

          expect(bindingMapsMock.add).toHaveBeenCalledExactlyOnceWith(
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
            id: bindingFixture.id,
            moduleId: bindingFixture.moduleId as number,
            serviceId: bindingFixture.serviceIdentifier,
          };

          expect(bindingMapsMock.add).toHaveBeenCalledExactlyOnceWith(
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

  describe('.removeById', () => {
    let idFixture: number;

    beforeAll(() => {
      idFixture = 3;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = bindingService.removeById(idFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingMapsMock.removeByRelation()', () => {
        expect(
          bindingMapsMock.removeByRelation,
        ).toHaveBeenCalledExactlyOnceWith('id', idFixture);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
