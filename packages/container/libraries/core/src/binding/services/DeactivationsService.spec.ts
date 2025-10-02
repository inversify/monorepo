import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock('../../common/calculations/chain');
vitest.mock('../../common/models/OneToManyMapStar');

import { ServiceIdentifier } from '@inversifyjs/common';

import { chain } from '../../common/calculations/chain';
import { OneToManyMapStar } from '../../common/models/OneToManyMapStar';
import { BindingDeactivation } from '../models/BindingDeactivation';
import {
  BindingDeactivationRelation,
  DeactivationsService,
} from './DeactivationsService';

describe(DeactivationsService, () => {
  let deactivationMapsMock: Mocked<
    OneToManyMapStar<BindingDeactivation, BindingDeactivationRelation>
  >;

  let parentDeactivationService: DeactivationsService;
  let deactivationsService: DeactivationsService;

  beforeAll(() => {
    deactivationMapsMock = new OneToManyMapStar<
      BindingDeactivation,
      BindingDeactivationRelation
    >({
      moduleId: {
        isOptional: true,
      },
      serviceId: {
        isOptional: false,
      },
    }) as Mocked<
      OneToManyMapStar<BindingDeactivation, BindingDeactivationRelation>
    >;

    parentDeactivationService = DeactivationsService.build(() => undefined);

    deactivationsService = DeactivationsService.build(
      () => parentDeactivationService,
    );
  });

  describe('.add', () => {
    let deactivationFixture: BindingDeactivation;
    let relationFixture: BindingDeactivationRelation;

    beforeAll(() => {
      deactivationFixture = () => undefined;
      relationFixture = {
        moduleId: 3,
        serviceId: 'service-id',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = deactivationsService.add(deactivationFixture, relationFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call deactivationMaps.add()', () => {
        expect(deactivationMapsMock.add).toHaveBeenCalledExactlyOnceWith(
          deactivationFixture,
          relationFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('.clone', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        deactivationMapsMock.clone.mockReturnValueOnce(deactivationMapsMock);

        result = deactivationsService.clone();
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call deactivationMaps.clone', () => {
        expect(deactivationMapsMock.clone).toHaveBeenCalledExactlyOnceWith();
      });

      it('should return a clone()', () => {
        expect(result).toStrictEqual(deactivationsService);
      });
    });
  });

  describe('.get', () => {
    let serviceIdFixture: ServiceIdentifier;

    beforeAll(() => {
      serviceIdFixture = 'service-identifier';
    });

    describe('when called, and deactivationMaps.get() returns Iterable and parent deactivationMaps.get() returns undefined', () => {
      let bindingDeactivationFixture: BindingDeactivation;

      let result: unknown;

      beforeAll(() => {
        bindingDeactivationFixture = Symbol() as unknown as BindingDeactivation;

        deactivationMapsMock.get
          .mockReturnValueOnce([bindingDeactivationFixture])
          .mockReturnValueOnce(undefined);

        vitest.mocked(chain).mockReturnValueOnce([bindingDeactivationFixture]);

        result = deactivationsService.get(serviceIdFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call deactivationMaps.get()', () => {
        expect(deactivationMapsMock.get).toHaveBeenCalledTimes(2);
        expect(deactivationMapsMock.get).toHaveBeenNthCalledWith(
          1,
          'serviceId',
          serviceIdFixture,
        );
        expect(deactivationMapsMock.get).toHaveBeenNthCalledWith(
          2,
          'serviceId',
          serviceIdFixture,
        );
      });

      it('should call chain()', () => {
        expect(chain).toHaveBeenCalledExactlyOnceWith([
          bindingDeactivationFixture,
        ]);
      });

      it('should return BindingDeactivation[]', () => {
        expect(result).toStrictEqual([bindingDeactivationFixture]);
      });
    });

    describe('when called, and deactivationMaps.get() returns Iterable and parent deactivationMaps.get() returns Iterable', () => {
      let bindingDeactivationFixture: BindingDeactivation;

      let result: unknown;

      beforeAll(() => {
        bindingDeactivationFixture = Symbol() as unknown as BindingDeactivation;

        deactivationMapsMock.get
          .mockReturnValueOnce([bindingDeactivationFixture])
          .mockReturnValueOnce([bindingDeactivationFixture]);

        vitest
          .mocked(chain)
          .mockReturnValueOnce([bindingDeactivationFixture])
          .mockReturnValueOnce([
            bindingDeactivationFixture,
            bindingDeactivationFixture,
          ]);

        result = deactivationsService.get(serviceIdFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call deactivationMaps.get()', () => {
        expect(deactivationMapsMock.get).toHaveBeenCalledTimes(2);
        expect(deactivationMapsMock.get).toHaveBeenNthCalledWith(
          1,
          'serviceId',
          serviceIdFixture,
        );
        expect(deactivationMapsMock.get).toHaveBeenNthCalledWith(
          2,
          'serviceId',
          serviceIdFixture,
        );
      });

      it('should call chain()', () => {
        expect(chain).toHaveBeenCalledTimes(2);
        expect(chain).toHaveBeenNthCalledWith(1, [bindingDeactivationFixture]);
        expect(chain).toHaveBeenNthCalledWith(
          2,
          [bindingDeactivationFixture],
          [bindingDeactivationFixture],
        );
      });

      it('should return BindingDeactivation[]', () => {
        expect(result).toStrictEqual([
          bindingDeactivationFixture,
          bindingDeactivationFixture,
        ]);
      });
    });
  });

  describe('.removeAllByModule', () => {
    let moduleIdFixture: number;

    beforeAll(() => {
      moduleIdFixture = 3;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = deactivationsService.removeAllByModuleId(moduleIdFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call deactivationMaps.removeByRelation()', () => {
        expect(
          deactivationMapsMock.removeByRelation,
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
        result = deactivationsService.removeAllByServiceId(serviceIdFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call deactivationMaps.removeByRelation()', () => {
        expect(
          deactivationMapsMock.removeByRelation,
        ).toHaveBeenCalledExactlyOnceWith('serviceId', serviceIdFixture);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
