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

vitest.mock('../../common/calculations/chain');

import { chain } from '../../common/calculations/chain';
import { OneToManyMapStar } from '../../common/models/OneToManyMapStar';
import { BindingActivation } from '../models/BindingActivation';
import {
  ActivationsService,
  BindingActivationRelation,
} from './ActivationsService';

describe(ActivationsService, () => {
  let activationMapsMock: Mocked<
    OneToManyMapStar<BindingActivation, BindingActivationRelation>
  >;

  let parentActivationService: ActivationsService;
  let activationsService: ActivationsService;

  beforeAll(() => {
    activationMapsMock = new OneToManyMapStar<
      BindingActivation,
      BindingActivationRelation
    >({
      moduleId: {
        isOptional: true,
      },
      serviceId: {
        isOptional: false,
      },
    }) as Mocked<
      OneToManyMapStar<BindingActivation, BindingActivationRelation>
    >;

    parentActivationService = ActivationsService.build(() => undefined);

    activationsService = ActivationsService.build(
      () => parentActivationService,
    );
  });

  describe('.add', () => {
    let activationFixture: BindingActivation;
    let relationFixture: BindingActivationRelation;

    beforeAll(() => {
      activationFixture = () => undefined;
      relationFixture = {
        moduleId: 3,
        serviceId: 'service-id',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = activationsService.add(activationFixture, relationFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call activationMaps.add()', () => {
        expect(activationMapsMock.add).toHaveBeenCalledExactlyOnceWith(
          activationFixture,
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
        activationMapsMock.clone.mockReturnValueOnce(activationMapsMock);

        result = activationsService.clone();
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call activationMaps.clone', () => {
        expect(activationMapsMock.clone).toHaveBeenCalledExactlyOnceWith();
      });

      it('should return a clone()', () => {
        expect(result).toStrictEqual(activationsService);
      });
    });
  });

  describe('.get', () => {
    let serviceIdFixture: ServiceIdentifier;

    beforeAll(() => {
      serviceIdFixture = 'service-identifier';
    });

    describe('when called, and activationMaps.get() returns Iterable and parent activationMaps.get() returns undefined', () => {
      let bindingActivationFixture: BindingActivation;

      let result: unknown;

      beforeAll(() => {
        bindingActivationFixture = Symbol() as unknown as BindingActivation;

        activationMapsMock.get
          .mockReturnValueOnce([bindingActivationFixture])
          .mockReturnValueOnce(undefined);

        vitest.mocked(chain).mockReturnValueOnce([bindingActivationFixture]);

        result = activationsService.get(serviceIdFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call activationMaps.get()', () => {
        expect(activationMapsMock.get).toHaveBeenCalledTimes(2);
        expect(activationMapsMock.get).toHaveBeenNthCalledWith(
          1,
          'serviceId',
          serviceIdFixture,
        );
        expect(activationMapsMock.get).toHaveBeenNthCalledWith(
          2,
          'serviceId',
          serviceIdFixture,
        );
      });

      it('should call chain()', () => {
        expect(chain).toHaveBeenCalledExactlyOnceWith([
          bindingActivationFixture,
        ]);
      });

      it('should return BindingActivation[]', () => {
        expect(result).toStrictEqual([bindingActivationFixture]);
      });
    });

    describe('when called, and activationMaps.get() returns Iterable and parent activationMaps.get() returns Iterable', () => {
      let bindingActivationFixture: BindingActivation;

      let result: unknown;

      beforeAll(() => {
        bindingActivationFixture = Symbol() as unknown as BindingActivation;

        activationMapsMock.get
          .mockReturnValueOnce([bindingActivationFixture])
          .mockReturnValueOnce([bindingActivationFixture]);

        vitest
          .mocked(chain)
          .mockReturnValueOnce([bindingActivationFixture])
          .mockReturnValueOnce([
            bindingActivationFixture,
            bindingActivationFixture,
          ]);

        result = activationsService.get(serviceIdFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call activationMaps.get()', () => {
        expect(activationMapsMock.get).toHaveBeenCalledTimes(2);
        expect(activationMapsMock.get).toHaveBeenNthCalledWith(
          1,
          'serviceId',
          serviceIdFixture,
        );
        expect(activationMapsMock.get).toHaveBeenNthCalledWith(
          2,
          'serviceId',
          serviceIdFixture,
        );
      });

      it('should call chain()', () => {
        expect(chain).toHaveBeenCalledTimes(2);
        expect(chain).toHaveBeenNthCalledWith(1, [bindingActivationFixture]);
        expect(chain).toHaveBeenNthCalledWith(
          2,
          [bindingActivationFixture],
          [bindingActivationFixture],
        );
      });

      it('should return BindingActivation[]', () => {
        expect(result).toStrictEqual([
          bindingActivationFixture,
          bindingActivationFixture,
        ]);
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
        result = activationsService.removeAllByModuleId(moduleIdFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call activationMaps.removeByRelation()', () => {
        expect(
          activationMapsMock.removeByRelation,
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
        result = activationsService.removeAllByServiceId(serviceIdFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call activationMaps.removeByRelation()', () => {
        expect(
          activationMapsMock.removeByRelation,
        ).toHaveBeenCalledExactlyOnceWith('serviceId', serviceIdFixture);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
