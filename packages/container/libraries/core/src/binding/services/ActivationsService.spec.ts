import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('../../common/models/OneToManyMapStar.js'));

import { type ServiceIdentifier } from '@inversifyjs/common';

vitest.mock(import('../../common/calculations/chain.js'));

import { chain } from '../../common/calculations/chain.js';
import { OneToManyMapStar } from '../../common/models/OneToManyMapStar.js';
import { type ActivationSubscriber } from '../models/ActivationSubscriber.js';
import { type BindingActivation } from '../models/BindingActivation.js';
import {
  ActivationsService,
  type BindingActivationRelation,
} from './ActivationsService.js';

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

      it('should not call chain()', () => {
        expect(chain).not.toHaveBeenCalled();
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
        expect(chain).toHaveBeenCalledExactlyOnceWith(
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

  describe('.subscribeOnce', () => {
    describe('when called', () => {
      let serviceIdentifierFixture: ServiceIdentifier;
      let subscriberMock: Mocked<ActivationSubscriber>;

      let result: unknown;

      beforeAll(() => {
        serviceIdentifierFixture = 'subscribe-once-service-id';
        subscriberMock = {
          onActivationAdded: vitest.fn(),
        };

        result = activationsService.subscribeOnce(
          serviceIdentifierFixture,
          subscriberMock,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and activationsService.add() is called for the same serviceId', () => {
      let serviceIdentifierFixture: ServiceIdentifier;
      let activationFixture: BindingActivation;
      let relationFixture: BindingActivationRelation;
      let subscriberMock: Mocked<ActivationSubscriber>;

      beforeAll(() => {
        serviceIdentifierFixture = 'subscribe-once-same-service-id';
        activationFixture = () => undefined;
        relationFixture = {
          serviceId: serviceIdentifierFixture,
        };
        subscriberMock = {
          onActivationAdded: vitest.fn(),
        };

        activationsService.subscribeOnce(
          serviceIdentifierFixture,
          subscriberMock,
        );
        activationsService.add(activationFixture, relationFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call subscriber.onActivationAdded()', () => {
        expect(
          subscriberMock.onActivationAdded,
        ).toHaveBeenCalledExactlyOnceWith(
          serviceIdentifierFixture,
          activationFixture,
        );
      });
    });

    describe('when called, and activationsService.add() is called twice for the same serviceId', () => {
      let serviceIdentifierFixture: ServiceIdentifier;
      let firstActivationFixture: BindingActivation;
      let secondActivationFixture: BindingActivation;
      let firstRelationFixture: BindingActivationRelation;
      let secondRelationFixture: BindingActivationRelation;
      let subscriberMock: Mocked<ActivationSubscriber>;

      beforeAll(() => {
        serviceIdentifierFixture = 'subscribe-once-twice-service-id';
        firstActivationFixture = () => undefined;
        secondActivationFixture = () => undefined;
        firstRelationFixture = {
          serviceId: serviceIdentifierFixture,
        };
        secondRelationFixture = {
          serviceId: serviceIdentifierFixture,
        };
        subscriberMock = {
          onActivationAdded: vitest.fn(),
        };

        activationsService.subscribeOnce(
          serviceIdentifierFixture,
          subscriberMock,
        );
        activationsService.add(firstActivationFixture, firstRelationFixture);
        activationsService.add(secondActivationFixture, secondRelationFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call subscriber.onActivationAdded() once', () => {
        expect(
          subscriberMock.onActivationAdded,
        ).toHaveBeenCalledExactlyOnceWith(
          serviceIdentifierFixture,
          firstActivationFixture,
        );
      });
    });

    describe('when called, and activationsService.add() is called for a different serviceId', () => {
      let serviceIdentifierFixture: ServiceIdentifier;
      let activationFixture: BindingActivation;
      let relationFixture: BindingActivationRelation;
      let subscriberMock: Mocked<ActivationSubscriber>;

      beforeAll(() => {
        serviceIdentifierFixture = 'subscribe-once-different-service-id';
        activationFixture = () => undefined;
        relationFixture = {
          serviceId: 'other-service-id',
        };
        subscriberMock = {
          onActivationAdded: vitest.fn(),
        };

        activationsService.subscribeOnce(
          serviceIdentifierFixture,
          subscriberMock,
        );
        activationsService.add(activationFixture, relationFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not call subscriber.onActivationAdded()', () => {
        expect(subscriberMock.onActivationAdded).not.toHaveBeenCalled();
      });
    });

    describe('when called twice with different subscribers, and activationsService.add() is called for the same serviceId', () => {
      let serviceIdentifierFixture: ServiceIdentifier;
      let activationFixture: BindingActivation;
      let relationFixture: BindingActivationRelation;
      let firstSubscriberMock: Mocked<ActivationSubscriber>;
      let secondSubscriberMock: Mocked<ActivationSubscriber>;

      beforeAll(() => {
        serviceIdentifierFixture = 'subscribe-once-multiple-subscribers-id';
        activationFixture = () => undefined;
        relationFixture = {
          serviceId: serviceIdentifierFixture,
        };
        firstSubscriberMock = {
          onActivationAdded: vitest.fn(),
        };
        secondSubscriberMock = {
          onActivationAdded: vitest.fn(),
        };

        activationsService.subscribeOnce(
          serviceIdentifierFixture,
          firstSubscriberMock,
        );
        activationsService.subscribeOnce(
          serviceIdentifierFixture,
          secondSubscriberMock,
        );
        activationsService.add(activationFixture, relationFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call firstSubscriber.onActivationAdded()', () => {
        expect(
          firstSubscriberMock.onActivationAdded,
        ).toHaveBeenCalledExactlyOnceWith(
          serviceIdentifierFixture,
          activationFixture,
        );
      });

      it('should call secondSubscriber.onActivationAdded()', () => {
        expect(
          secondSubscriberMock.onActivationAdded,
        ).toHaveBeenCalledExactlyOnceWith(
          serviceIdentifierFixture,
          activationFixture,
        );
      });
    });
  });
});
