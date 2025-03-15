import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock('@inversifyjs/core');

vitest.mock('../actions/getBindingId');
vitest.mock('../calculations/isAnyAncestorBindingConstraints');
vitest.mock('../calculations/isAnyAncestorBindingConstraintsWithName');
vitest.mock('../calculations/isAnyAncestorBindingConstraintsWithServiceId');
vitest.mock('../calculations/isAnyAncestorBindingConstraintsWithTag');
vitest.mock('../calculations/isBindingConstraintsWithName');
vitest.mock('../calculations/isBindingConstraintsWithTag');
vitest.mock('../calculations/isNoAncestorBindingConstraints');
vitest.mock('../calculations/isNoAncestorBindingConstraintsWithTag');
vitest.mock('../calculations/isNoAncestorBindingConstraintsWithServiceId');
vitest.mock('../calculations/isNoAncestorBindingConstraintsWithName');
vitest.mock('../calculations/isNotParentBindingConstraints');
vitest.mock('../calculations/isNotParentBindingConstraintsWithName');
vitest.mock('../calculations/isNotParentBindingConstraintsWithServiceId');
vitest.mock('../calculations/isNotParentBindingConstraintsWithTag');
vitest.mock('../calculations/isParentBindingConstraints');
vitest.mock('../calculations/isParentBindingConstraintsWithName');
vitest.mock('../calculations/isParentBindingConstraintsWithServiceId');
vitest.mock('../calculations/isParentBindingConstraintsWithTag');
vitest.mock('../calculations/isResolvedValueMetadataInjectOptions');

import { ServiceIdentifier } from '@inversifyjs/common';
import {
  Binding,
  BindingActivation,
  BindingConstraints,
  BindingDeactivation,
  BindingScope,
  bindingScopeValues,
  BindingType,
  bindingTypeValues,
  ClassMetadata,
  ConstantValueBinding,
  DynamicValueBuilder,
  Factory,
  getClassMetadata,
  InstanceBinding,
  MetadataName,
  MetadataTag,
  Provider,
  ResolutionContext,
  ResolvedValueElementMetadataKind,
  ScopedBinding,
  ServiceRedirectionBinding,
} from '@inversifyjs/core';

import { Writable } from '../../common/models/Writable';
import { BindingConstraintUtils } from '../../container/binding/utils/BindingConstraintUtils';
import { ClassMetadataFixtures } from '../../metadata/fixtures/ClassMetadataFixtures';
import { getBindingId } from '../actions/getBindingId';
import { isAnyAncestorBindingConstraints } from '../calculations/isAnyAncestorBindingConstraints';
import { isAnyAncestorBindingConstraintsWithName } from '../calculations/isAnyAncestorBindingConstraintsWithName';
import { isAnyAncestorBindingConstraintsWithServiceId } from '../calculations/isAnyAncestorBindingConstraintsWithServiceId';
import { isAnyAncestorBindingConstraintsWithTag } from '../calculations/isAnyAncestorBindingConstraintsWithTag';
import { isBindingConstraintsWithName } from '../calculations/isBindingConstraintsWithName';
import { isBindingConstraintsWithNoNameNorTags } from '../calculations/isBindingConstraintsWithNoNameNorTags';
import { isBindingConstraintsWithTag } from '../calculations/isBindingConstraintsWithTag';
import { isNoAncestorBindingConstraints } from '../calculations/isNoAncestorBindingConstraints';
import { isNoAncestorBindingConstraintsWithName } from '../calculations/isNoAncestorBindingConstraintsWithName';
import { isNoAncestorBindingConstraintsWithServiceId } from '../calculations/isNoAncestorBindingConstraintsWithServiceId';
import { isNoAncestorBindingConstraintsWithTag } from '../calculations/isNoAncestorBindingConstraintsWithTag';
import { isNotParentBindingConstraints } from '../calculations/isNotParentBindingConstraints';
import { isNotParentBindingConstraintsWithName } from '../calculations/isNotParentBindingConstraintsWithName';
import { isNotParentBindingConstraintsWithServiceId } from '../calculations/isNotParentBindingConstraintsWithServiceId';
import { isNotParentBindingConstraintsWithTag } from '../calculations/isNotParentBindingConstraintsWithTag';
import { isParentBindingConstraints } from '../calculations/isParentBindingConstraints';
import { isParentBindingConstraintsWithName } from '../calculations/isParentBindingConstraintsWithName';
import { isParentBindingConstraintsWithServiceId } from '../calculations/isParentBindingConstraintsWithServiceId';
import { isParentBindingConstraintsWithTag } from '../calculations/isParentBindingConstraintsWithTag';
import { isResolvedValueMetadataInjectOptions } from '../calculations/isResolvedValueMetadataInjectOptions';
import {
  BindInFluentSyntaxImplementation,
  BindInWhenOnFluentSyntaxImplementation,
  BindOnFluentSyntaxImplementation,
  BindToFluentSyntaxImplementation,
  BindWhenFluentSyntaxImplementation,
  BindWhenOnFluentSyntaxImplementation,
} from './BindingFluentSyntaxImplementation';
import {
  ResolvedValueInjectOptions,
  ResolvedValueMetadataInjectOptions,
} from './ResolvedValueInjectOptions';

describe(BindInFluentSyntaxImplementation.name, () => {
  let bindingMock: Mocked<ScopedBinding<BindingType, BindingScope, unknown>>;

  let bindingMockSetScopeMock: Mock<(value: BindingScope) => void>;

  let bindInFluentSyntaxImplementation: BindInFluentSyntaxImplementation<unknown>;

  beforeAll(() => {
    let bindingScope: BindingScope = bindingScopeValues.Singleton;

    bindingMockSetScopeMock = vitest.fn();

    bindingMock = {
      get scope(): BindingScope {
        return bindingScope;
      },
      set scope(value: BindingScope) {
        bindingMockSetScopeMock(value);

        bindingScope = value;
      },
    } as Partial<
      Mocked<ScopedBinding<BindingType, BindingScope, unknown>>
    > as Mocked<ScopedBinding<BindingType, BindingScope, unknown>>;

    bindInFluentSyntaxImplementation = new BindInFluentSyntaxImplementation(
      bindingMock,
    );
  });

  describe.each<
    [
      string,
      (
        bindInFluentSyntaxImplementation: BindInFluentSyntaxImplementation<unknown>,
      ) => unknown,
      BindingScope,
    ]
  >([
    [
      '.inRequestScope()',
      (
        bindInFluentSyntaxImplementation: BindInFluentSyntaxImplementation<unknown>,
      ) => bindInFluentSyntaxImplementation.inRequestScope(),
      bindingScopeValues.Request,
    ],
    [
      '.inSingletonScope()',
      (
        bindInFluentSyntaxImplementation: BindInFluentSyntaxImplementation<unknown>,
      ) => bindInFluentSyntaxImplementation.inSingletonScope(),
      bindingScopeValues.Singleton,
    ],
    [
      '.inTransientScope()',
      (
        bindInFluentSyntaxImplementation: BindInFluentSyntaxImplementation<unknown>,
      ) => bindInFluentSyntaxImplementation.inTransientScope(),
      bindingScopeValues.Transient,
    ],
  ])(
    '%s',
    (
      _: string,
      buildResult: (
        bindInFluentSyntaxImplementation: BindInFluentSyntaxImplementation<unknown>,
      ) => unknown,
      expectedScope: BindingScope,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = buildResult(bindInFluentSyntaxImplementation);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should set binding scope', () => {
          expect(bindingMockSetScopeMock).toHaveBeenCalledTimes(1);
          expect(bindingMockSetScopeMock).toHaveBeenCalledWith(expectedScope);
        });

        it('should return BindWhenOnFluentSyntax', () => {
          expect(result).toBeInstanceOf(BindWhenOnFluentSyntaxImplementation);
        });
      });
    },
  );
});

describe(BindToFluentSyntaxImplementation.name, () => {
  let bindingIdFixture: number;

  let dynamicValueBuilderfixture: DynamicValueBuilder<unknown>;
  let factoryBuilderFixture: (context: ResolutionContext) => Factory<unknown>;
  let providerBuilderFixture: (context: ResolutionContext) => Provider<unknown>;

  let callbackMock: Mock<(binding: Binding) => void>;
  let containerModuleIdFixture: number;
  let defaultScopeFixture: BindingScope;
  let serviceIdentifierFixture: ServiceIdentifier;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let bindToFluentSyntaxImplementation: BindToFluentSyntaxImplementation<any>;

  beforeAll(() => {
    bindingIdFixture = 1;

    dynamicValueBuilderfixture = () => Symbol.for('dynamic-value');
    factoryBuilderFixture = () => () => Symbol.for('value-from-factory');
    providerBuilderFixture = () => async () =>
      Symbol.for('value-from-provider');

    vitest.mocked(getBindingId).mockReturnValue(bindingIdFixture);

    callbackMock = vitest.fn();
    containerModuleIdFixture = 1;
    defaultScopeFixture = bindingScopeValues.Singleton;
    serviceIdentifierFixture = 'service-id';

    bindToFluentSyntaxImplementation = new BindToFluentSyntaxImplementation(
      callbackMock,
      containerModuleIdFixture,
      defaultScopeFixture,
      serviceIdentifierFixture,
    );
  });

  describe.each<
    [
      string,
      (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bindToFluentSyntaxImplementation: BindToFluentSyntaxImplementation<any>,
      ) => unknown,
      () => Binding,
      NewableFunction,
    ]
  >([
    [
      '.toConstantValue()',
      (
        bindToFluentSyntaxImplementation: BindToFluentSyntaxImplementation<unknown>,
      ): unknown =>
        bindToFluentSyntaxImplementation.toConstantValue(
          Symbol.for('constant-value'),
        ),
      (): Binding => ({
        cache: {
          isRight: false,
          value: undefined,
        },
        id: bindingIdFixture,
        isSatisfiedBy: expect.any(Function) as unknown as (
          metadata: BindingConstraints,
        ) => boolean,
        moduleId: containerModuleIdFixture,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: serviceIdentifierFixture,
        type: bindingTypeValues.ConstantValue,
        value: Symbol.for('constant-value'),
      }),
      BindWhenOnFluentSyntaxImplementation,
    ],
    [
      '.toDynamicValue()',
      (
        bindToFluentSyntaxImplementation: BindToFluentSyntaxImplementation<unknown>,
      ): unknown =>
        bindToFluentSyntaxImplementation.toDynamicValue(
          dynamicValueBuilderfixture,
        ),
      (): Binding => ({
        cache: {
          isRight: false,
          value: undefined,
        },
        id: bindingIdFixture,
        isSatisfiedBy: expect.any(Function) as unknown as (
          metadata: BindingConstraints,
        ) => boolean,
        moduleId: containerModuleIdFixture,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: defaultScopeFixture,
        serviceIdentifier: serviceIdentifierFixture,
        type: bindingTypeValues.DynamicValue,
        value: dynamicValueBuilderfixture,
      }),
      BindWhenOnFluentSyntaxImplementation,
    ],
    [
      '.toFactory()',
      (
        bindToFluentSyntaxImplementation: BindToFluentSyntaxImplementation<
          Factory<unknown>
        >,
      ): unknown =>
        bindToFluentSyntaxImplementation.toFactory(factoryBuilderFixture),
      (): Binding => ({
        cache: {
          isRight: false,
          value: undefined,
        },
        factory: factoryBuilderFixture,
        id: bindingIdFixture,
        isSatisfiedBy: expect.any(Function) as unknown as (
          metadata: BindingConstraints,
        ) => boolean,
        moduleId: containerModuleIdFixture,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: serviceIdentifierFixture,
        type: bindingTypeValues.Factory,
      }),
      BindWhenOnFluentSyntaxImplementation,
    ],
    [
      '.toProvider()',
      (
        bindToFluentSyntaxImplementation: BindToFluentSyntaxImplementation<
          Provider<unknown>
        >,
      ): unknown =>
        bindToFluentSyntaxImplementation.toProvider(providerBuilderFixture),
      (): Binding => ({
        cache: {
          isRight: false,
          value: undefined,
        },
        id: bindingIdFixture,
        isSatisfiedBy: expect.any(Function) as unknown as (
          metadata: BindingConstraints,
        ) => boolean,
        moduleId: containerModuleIdFixture,
        onActivation: undefined,
        onDeactivation: undefined,
        provider: providerBuilderFixture,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: serviceIdentifierFixture,
        type: bindingTypeValues.Provider,
      }),
      BindWhenOnFluentSyntaxImplementation,
    ],
  ])(
    '%s',
    (
      _: string,
      buildResult: (
        bindToFluentSyntaxImplementation: BindToFluentSyntaxImplementation<unknown>,
      ) => unknown,
      buildExpectedBinding: () => Binding,
      expectedResultType: NewableFunction,
    ) => {
      describe('when called', () => {
        let expectedBinding: Binding;
        let result: unknown;

        beforeAll(() => {
          expectedBinding = buildExpectedBinding();
          result = buildResult(bindToFluentSyntaxImplementation);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call getBindingId', () => {
          expect(getBindingId).toHaveBeenCalledTimes(1);
          expect(getBindingId).toHaveBeenCalledWith();
        });

        it('should call callback', () => {
          expect(callbackMock).toHaveBeenCalledTimes(1);
          expect(callbackMock).toHaveBeenCalledWith(expectedBinding);
        });

        it('should return expected result', () => {
          expect(result).toBeInstanceOf(expectedResultType);
        });
      });
    },
  );

  describe('.toResolvedValue', () => {
    describe('having no inject options', () => {
      let factoryFixture: (arg: unknown) => unknown;

      beforeAll(() => {
        factoryFixture = (arg: unknown) => arg;
      });

      describe('when called', () => {
        let expectedBinding: Binding;
        let result: unknown;

        beforeAll(() => {
          expectedBinding = {
            cache: {
              isRight: false,
              value: undefined,
            },
            factory: factoryFixture,
            id: bindingIdFixture,
            isSatisfiedBy: BindingConstraintUtils.always,
            metadata: {
              arguments: [],
            },
            moduleId: containerModuleIdFixture,
            onActivation: undefined,
            onDeactivation: undefined,
            scope: defaultScopeFixture,
            serviceIdentifier: serviceIdentifierFixture,
            type: bindingTypeValues.ResolvedValue,
          };

          result =
            bindToFluentSyntaxImplementation.toResolvedValue(factoryFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call getBindingId', () => {
          expect(getBindingId).toHaveBeenCalledTimes(1);
          expect(getBindingId).toHaveBeenCalledWith();
        });

        it('should call callback', () => {
          expect(callbackMock).toHaveBeenCalledTimes(1);
          expect(callbackMock).toHaveBeenCalledWith(expectedBinding);
        });

        it('should return expected result', () => {
          expect(result).toBeInstanceOf(BindInWhenOnFluentSyntaxImplementation);
        });
      });
    });

    describe('having service identifier inject options', () => {
      let factoryFixture: (arg: unknown) => unknown;
      let injectOptions: ResolvedValueInjectOptions<unknown>;

      beforeAll(() => {
        factoryFixture = (arg: unknown) => arg;
        injectOptions = 'service-id';
      });

      describe('when called', () => {
        let expectedBinding: Binding;
        let result: unknown;

        beforeAll(() => {
          expectedBinding = {
            cache: {
              isRight: false,
              value: undefined,
            },
            factory: factoryFixture,
            id: bindingIdFixture,
            isSatisfiedBy: BindingConstraintUtils.always,
            metadata: {
              arguments: [
                {
                  kind: expect.any(Number) as unknown as number,
                  name: undefined,
                  optional: false,
                  tags: new Map(),
                  value: 'service-id',
                },
              ],
            },
            moduleId: containerModuleIdFixture,
            onActivation: undefined,
            onDeactivation: undefined,
            scope: defaultScopeFixture,
            serviceIdentifier: serviceIdentifierFixture,
            type: bindingTypeValues.ResolvedValue,
          };

          vitest
            .mocked(isResolvedValueMetadataInjectOptions)
            .mockReturnValueOnce(false);

          result = bindToFluentSyntaxImplementation.toResolvedValue(
            factoryFixture,
            [injectOptions],
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call isResolvedValueMetadataInjectOptions()', () => {
          expect(isResolvedValueMetadataInjectOptions).toHaveBeenCalledTimes(1);
          expect(isResolvedValueMetadataInjectOptions).toHaveBeenCalledWith(
            injectOptions,
          );
        });

        it('should call getBindingId', () => {
          expect(getBindingId).toHaveBeenCalledTimes(1);
          expect(getBindingId).toHaveBeenCalledWith();
        });

        it('should call callback', () => {
          expect(callbackMock).toHaveBeenCalledTimes(1);
          expect(callbackMock).toHaveBeenCalledWith(expectedBinding);
        });

        it('should return expected result', () => {
          expect(result).toBeInstanceOf(BindInWhenOnFluentSyntaxImplementation);
        });
      });
    });

    describe('having typed service identifier inject options deduce factory signature', () => {
      const uniqueMethodId: unique symbol = Symbol('UniqueMethodId');
      interface UniqueServiceType {
        [uniqueMethodId]: () => unknown;
      }
      let injectOptions: ResolvedValueInjectOptions<UniqueServiceType>;

      beforeAll(() => {
        injectOptions = 'service-id';
      });

      describe('when called', () => {
        let expectedBinding: Binding;
        let result: unknown;

        beforeAll(() => {
          expectedBinding = {
            cache: {
              isRight: false,
              value: undefined,
            },
            factory: expect.any(Function),
            id: bindingIdFixture,
            isSatisfiedBy: BindingConstraintUtils.always,
            metadata: {
              arguments: [
                {
                  kind: expect.any(Number) as unknown as number,
                  name: undefined,
                  optional: false,
                  tags: new Map(),
                  value: 'service-id',
                },
              ],
            },
            moduleId: containerModuleIdFixture,
            onActivation: undefined,
            onDeactivation: undefined,
            scope: defaultScopeFixture,
            serviceIdentifier: serviceIdentifierFixture,
            type: bindingTypeValues.ResolvedValue,
          };

          vitest
            .mocked(isResolvedValueMetadataInjectOptions)
            .mockReturnValueOnce(false);

          result = bindToFluentSyntaxImplementation.toResolvedValue(
            // we want to test that the factory signature is deduced from the service type
            // eslint-disable-next-line @typescript-eslint/typedef
            (serviceDependency) => serviceDependency[uniqueMethodId](),
            [injectOptions],
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call isResolvedValueMetadataInjectOptions()', () => {
          expect(isResolvedValueMetadataInjectOptions).toHaveBeenCalledTimes(1);
          expect(isResolvedValueMetadataInjectOptions).toHaveBeenCalledWith(
            injectOptions,
          );
        });

        it('should call getBindingId', () => {
          expect(getBindingId).toHaveBeenCalledTimes(1);
          expect(getBindingId).toHaveBeenCalledWith();
        });

        it('should call callback', () => {
          expect(callbackMock).toHaveBeenCalledTimes(1);
          expect(callbackMock).toHaveBeenCalledWith(expectedBinding);
        });

        it('should return expected result', () => {
          expect(result).toBeInstanceOf(BindInWhenOnFluentSyntaxImplementation);
        });
      });
    });

    describe('having inject options with service identifier and no optional metadata', () => {
      let factoryFixture: (arg: unknown) => unknown;
      let injectOptions: ResolvedValueInjectOptions<unknown>;

      beforeAll(() => {
        factoryFixture = (arg: unknown) => arg;
        injectOptions = { serviceIdentifier: 'service-id' };
      });

      describe('when called', () => {
        let expectedBinding: Binding;
        let result: unknown;

        beforeAll(() => {
          expectedBinding = {
            cache: {
              isRight: false,
              value: undefined,
            },
            factory: factoryFixture,
            id: bindingIdFixture,
            isSatisfiedBy: BindingConstraintUtils.always,
            metadata: {
              arguments: [
                {
                  kind: ResolvedValueElementMetadataKind.singleInjection,
                  name: undefined,
                  optional: false,
                  tags: new Map(),
                  value: 'service-id',
                },
              ],
            },
            moduleId: containerModuleIdFixture,
            onActivation: undefined,
            onDeactivation: undefined,
            scope: defaultScopeFixture,
            serviceIdentifier: serviceIdentifierFixture,
            type: bindingTypeValues.ResolvedValue,
          };

          vitest
            .mocked(isResolvedValueMetadataInjectOptions)
            .mockReturnValueOnce(true);

          result = bindToFluentSyntaxImplementation.toResolvedValue(
            factoryFixture,
            [injectOptions],
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call isResolvedValueMetadataInjectOptions()', () => {
          expect(isResolvedValueMetadataInjectOptions).toHaveBeenCalledTimes(1);
          expect(isResolvedValueMetadataInjectOptions).toHaveBeenCalledWith(
            injectOptions,
          );
        });

        it('should call getBindingId', () => {
          expect(getBindingId).toHaveBeenCalledTimes(1);
          expect(getBindingId).toHaveBeenCalledWith();
        });

        it('should call callback', () => {
          expect(callbackMock).toHaveBeenCalledTimes(1);
          expect(callbackMock).toHaveBeenCalledWith(expectedBinding);
        });

        it('should return expected result', () => {
          expect(result).toBeInstanceOf(BindInWhenOnFluentSyntaxImplementation);
        });
      });
    });

    describe('having inject options with service identifier and optional metadata', () => {
      let factoryFixture: (arg: unknown) => unknown;
      let injectOptions: ResolvedValueMetadataInjectOptions<unknown>;

      beforeAll(() => {
        factoryFixture = (arg: unknown) => arg;
        injectOptions = {
          isMultiple: true,
          name: 'name',
          optional: true,
          serviceIdentifier: 'service-id',
          tags: [
            {
              key: 'tag',
              value: 'tagValue',
            },
          ],
        };
      });

      describe('when called', () => {
        let expectedBinding: Binding;
        let result: unknown;

        beforeAll(() => {
          expectedBinding = {
            cache: {
              isRight: false,
              value: undefined,
            },
            factory: factoryFixture,
            id: bindingIdFixture,
            isSatisfiedBy: BindingConstraintUtils.always,
            metadata: {
              arguments: [
                {
                  kind: ResolvedValueElementMetadataKind.multipleInjection,
                  name: 'name',
                  optional: true,
                  tags: new Map<MetadataTag, unknown>([['tag', 'tagValue']]),
                  value: 'service-id',
                },
              ],
            },
            moduleId: containerModuleIdFixture,
            onActivation: undefined,
            onDeactivation: undefined,
            scope: defaultScopeFixture,
            serviceIdentifier: serviceIdentifierFixture,
            type: bindingTypeValues.ResolvedValue,
          };

          vitest
            .mocked(isResolvedValueMetadataInjectOptions)
            .mockReturnValueOnce(true);

          result = bindToFluentSyntaxImplementation.toResolvedValue(
            factoryFixture,
            [injectOptions],
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call isResolvedValueMetadataInjectOptions()', () => {
          expect(isResolvedValueMetadataInjectOptions).toHaveBeenCalledTimes(1);
          expect(isResolvedValueMetadataInjectOptions).toHaveBeenCalledWith(
            injectOptions,
          );
        });

        it('should call getBindingId', () => {
          expect(getBindingId).toHaveBeenCalledTimes(1);
          expect(getBindingId).toHaveBeenCalledWith();
        });

        it('should call callback', () => {
          expect(callbackMock).toHaveBeenCalledTimes(1);
          expect(callbackMock).toHaveBeenCalledWith(expectedBinding);
        });

        it('should return expected result', () => {
          expect(result).toBeInstanceOf(BindInWhenOnFluentSyntaxImplementation);
        });
      });
    });
  });

  describe('.toSelf', () => {
    describe('having a non function service identifier', () => {
      let callbackMock: Mock<(binding: Binding) => void>;
      let containerModuleIdFixture: number;
      let defaultScopeFixture: BindingScope;
      let serviceIdentifierFixture: ServiceIdentifier;

      let bindToFluentSyntaxImplementation: BindToFluentSyntaxImplementation<unknown>;

      beforeAll(() => {
        callbackMock = vitest.fn();
        containerModuleIdFixture = 1;
        defaultScopeFixture = bindingScopeValues.Singleton;
        serviceIdentifierFixture = 'service-id';

        bindToFluentSyntaxImplementation = new BindToFluentSyntaxImplementation(
          callbackMock,
          containerModuleIdFixture,
          defaultScopeFixture,
          serviceIdentifierFixture,
        );
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            bindToFluentSyntaxImplementation.toSelf();
          } catch (error: unknown) {
            result = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should trow an Error', () => {
          const expectedErrorProperties: Partial<Error> = {
            message:
              '"toSelf" function can only be applied when a newable function is used as service identifier',
          };

          expect(result).toBeInstanceOf(Error);
          expect(result).toStrictEqual(
            expect.objectContaining(expectedErrorProperties),
          );
        });
      });
    });

    describe('having a function service identifier', () => {
      class Foo {}

      let callbackMock: Mock<(binding: Binding) => void>;
      let containerModuleIdFixture: number;
      let defaultScopeFixture: BindingScope;
      let serviceIdentifierFixture: ServiceIdentifier;

      let bindToFluentSyntaxImplementation: BindToFluentSyntaxImplementation<unknown>;

      beforeAll(() => {
        callbackMock = vitest.fn();
        containerModuleIdFixture = 1;
        defaultScopeFixture = bindingScopeValues.Singleton;
        serviceIdentifierFixture = Foo;

        bindToFluentSyntaxImplementation = new BindToFluentSyntaxImplementation(
          callbackMock,
          containerModuleIdFixture,
          defaultScopeFixture,
          serviceIdentifierFixture,
        );
      });

      describe('when called, and getClassMetadata() returns ClassMetadata with undefined scope', () => {
        let result: unknown;

        beforeAll(() => {
          vitest
            .mocked(getClassMetadata)
            .mockReturnValueOnce(ClassMetadataFixtures.withScopeUndefined);

          result = bindToFluentSyntaxImplementation.toSelf();
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call getClassMetadata()', () => {
          expect(getClassMetadata).toHaveBeenCalledTimes(1);
          expect(getClassMetadata).toHaveBeenCalledWith(
            serviceIdentifierFixture,
          );
        });

        it('should call callback()', () => {
          const expectedBinding: InstanceBinding<unknown> = {
            cache: {
              isRight: false,
              value: undefined,
            },
            id: getBindingId(),
            implementationType: Foo,
            isSatisfiedBy: expect.any(Function) as unknown as (
              metadata: BindingConstraints,
            ) => boolean,
            moduleId: containerModuleIdFixture,
            onActivation: undefined,
            onDeactivation: undefined,
            scope: defaultScopeFixture,
            serviceIdentifier: serviceIdentifierFixture,
            type: bindingTypeValues.Instance,
          };

          expect(callbackMock).toHaveBeenCalledTimes(1);
          expect(callbackMock).toHaveBeenCalledWith(expectedBinding);
        });

        it('should return expected result', () => {
          expect(result).toBeInstanceOf(BindInWhenOnFluentSyntaxImplementation);
        });
      });

      describe('when called, and getClassMetadata() returns ClassMetadata with scope', () => {
        let classMetadataFixture: ClassMetadata;

        let result: unknown;

        beforeAll(() => {
          classMetadataFixture = ClassMetadataFixtures.withScopeRequest;

          vitest
            .mocked(getClassMetadata)
            .mockReturnValueOnce(classMetadataFixture);

          result = bindToFluentSyntaxImplementation.toSelf();
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call getClassMetadata()', () => {
          expect(getClassMetadata).toHaveBeenCalledTimes(1);
          expect(getClassMetadata).toHaveBeenCalledWith(
            serviceIdentifierFixture,
          );
        });

        it('should call callback()', () => {
          const expectedBinding: InstanceBinding<unknown> = {
            cache: {
              isRight: false,
              value: undefined,
            },
            id: getBindingId(),
            implementationType: Foo,
            isSatisfiedBy: expect.any(Function) as unknown as (
              metadata: BindingConstraints,
            ) => boolean,
            moduleId: containerModuleIdFixture,
            onActivation: undefined,
            onDeactivation: undefined,
            scope: classMetadataFixture.scope as BindingScope,
            serviceIdentifier: serviceIdentifierFixture,
            type: bindingTypeValues.Instance,
          };

          expect(callbackMock).toHaveBeenCalledTimes(1);
          expect(callbackMock).toHaveBeenCalledWith(expectedBinding);
        });

        it('should return expected result', () => {
          expect(result).toBeInstanceOf(BindInWhenOnFluentSyntaxImplementation);
        });
      });
    });
  });

  describe('.toService', () => {
    describe('when called', () => {
      let targetServiceFixture: ServiceIdentifier;

      let result: unknown;

      beforeAll(() => {
        targetServiceFixture = 'another-service-id';

        result =
          bindToFluentSyntaxImplementation.toService(targetServiceFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call callback()', () => {
        const expectedBinding: ServiceRedirectionBinding<unknown> = {
          id: bindingIdFixture,
          isSatisfiedBy: expect.any(Function) as unknown as (
            metadata: BindingConstraints,
          ) => boolean,
          moduleId: containerModuleIdFixture,
          serviceIdentifier: serviceIdentifierFixture,
          targetServiceIdentifier: targetServiceFixture,
          type: bindingTypeValues.ServiceRedirection,
        };

        expect(callbackMock).toHaveBeenCalledTimes(1);
        expect(callbackMock).toHaveBeenCalledWith(expectedBinding);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});

describe(BindOnFluentSyntaxImplementation.name, () => {
  let bindingFixture: Writable<ConstantValueBinding<unknown>>;
  let bindingActivationSetterMock: Mock<
    (value: BindingActivation | undefined) => undefined
  >;
  let bindingDeactivationSetterMock: Mock<
    (value: BindingDeactivation | undefined) => undefined
  >;

  let bindOnFluentSyntaxImplementation: BindOnFluentSyntaxImplementation<unknown>;

  beforeAll(() => {
    bindingActivationSetterMock = vitest.fn();
    bindingDeactivationSetterMock = vitest.fn();

    bindingFixture = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: 1,
      isSatisfiedBy: expect.any(Function) as unknown as (
        metadata: BindingConstraints,
      ) => boolean,
      moduleId: undefined,
      get onActivation(): BindingActivation<unknown> | undefined {
        return undefined;
      },
      set onActivation(value: BindingActivation<unknown> | undefined) {
        bindingActivationSetterMock(value);
      },
      get onDeactivation(): BindingDeactivation<unknown> | undefined {
        return undefined;
      },
      set onDeactivation(value: BindingDeactivation<unknown> | undefined) {
        bindingDeactivationSetterMock(value);
      },
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: 'service-id',
      type: bindingTypeValues.ConstantValue,
      value: Symbol.for('constant-value'),
    };

    bindOnFluentSyntaxImplementation = new BindOnFluentSyntaxImplementation(
      bindingFixture,
    );
  });

  describe('.onActivation', () => {
    describe('when called', () => {
      let activationFixture: BindingActivation<unknown>;

      let result: unknown;

      beforeAll(() => {
        activationFixture = (value: unknown) => value;

        result =
          bindOnFluentSyntaxImplementation.onActivation(activationFixture);
      });

      it('should set binding activation', () => {
        expect(bindingActivationSetterMock).toHaveBeenCalledTimes(1);
        expect(bindingActivationSetterMock).toHaveBeenCalledWith(
          activationFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBeInstanceOf(BindWhenFluentSyntaxImplementation);
      });
    });
  });

  describe('.onDeactivation', () => {
    describe('when called', () => {
      let deactivationFixture: BindingDeactivation<unknown>;

      let result: unknown;

      beforeAll(() => {
        deactivationFixture = () => undefined;

        result =
          bindOnFluentSyntaxImplementation.onDeactivation(deactivationFixture);
      });

      it('should set binding deactivation', () => {
        expect(bindingDeactivationSetterMock).toHaveBeenCalledTimes(1);
        expect(bindingDeactivationSetterMock).toHaveBeenCalledWith(
          deactivationFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBeInstanceOf(BindWhenFluentSyntaxImplementation);
      });
    });
  });
});

describe(BindWhenFluentSyntaxImplementation.name, () => {
  let bindingFixture: ConstantValueBinding<unknown>;

  let isSatisfiedBySetterMock: Mock<
    (value: (metadata: BindingConstraints) => boolean) => void
  >;

  let bindWhenFluentSyntaxImplementation: BindWhenFluentSyntaxImplementation<unknown>;

  beforeAll(() => {
    isSatisfiedBySetterMock = vitest.fn();

    bindingFixture = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: 1,
      get isSatisfiedBy() {
        return () => true;
      },
      set isSatisfiedBy(value: (metadata: BindingConstraints) => boolean) {
        isSatisfiedBySetterMock(value);
      },
      moduleId: undefined,
      onActivation: undefined,
      onDeactivation: undefined,
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: 'service-id',
      type: bindingTypeValues.ConstantValue,
      value: Symbol(),
    };

    bindWhenFluentSyntaxImplementation = new BindWhenFluentSyntaxImplementation(
      bindingFixture,
    );
  });

  describe('.when', () => {
    let constraintFixture: (metadata: BindingConstraints) => boolean;

    let result: unknown;

    beforeAll(() => {
      constraintFixture = () => true;

      result = bindWhenFluentSyntaxImplementation.when(constraintFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should set constraint', () => {
      expect(isSatisfiedBySetterMock).toHaveBeenCalledTimes(1);
      expect(isSatisfiedBySetterMock).toHaveBeenCalledWith(constraintFixture);
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });

  describe('.whenAnyAncestor', () => {
    let constraintFixture: (metadata: BindingConstraints) => boolean;

    let result: unknown;

    beforeAll(() => {
      constraintFixture = () => true;

      result =
        bindWhenFluentSyntaxImplementation.whenAnyAncestor(constraintFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isAnyAncestorBindingConstraints', () => {
      expect(isAnyAncestorBindingConstraints).toHaveBeenCalledTimes(1);
      expect(isAnyAncestorBindingConstraints).toHaveBeenCalledWith(
        constraintFixture,
      );
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });

  describe('.whenAnyAncestorIs', () => {
    let serviceIdFixture: ServiceIdentifier;

    let result: unknown;

    beforeAll(() => {
      serviceIdFixture = 'name-fixture';

      result =
        bindWhenFluentSyntaxImplementation.whenAnyAncestorIs(serviceIdFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isAnyAncestorBindingConstraintsWithServiceId', () => {
      expect(
        isAnyAncestorBindingConstraintsWithServiceId,
      ).toHaveBeenCalledTimes(1);
      expect(isAnyAncestorBindingConstraintsWithServiceId).toHaveBeenCalledWith(
        serviceIdFixture,
      );
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });

  describe('.whenAnyAncestorNamed', () => {
    let nameFixture: MetadataName;

    let result: unknown;

    beforeAll(() => {
      nameFixture = 'name-fixture';

      result =
        bindWhenFluentSyntaxImplementation.whenAnyAncestorNamed(nameFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isAnyAncestorBindingConstraintsWithName', () => {
      expect(isAnyAncestorBindingConstraintsWithName).toHaveBeenCalledTimes(1);
      expect(isAnyAncestorBindingConstraintsWithName).toHaveBeenCalledWith(
        nameFixture,
      );
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });

  describe('.whenAnyAncestorTagged', () => {
    let tagFixture: MetadataTag;
    let tagValueFixture: unknown;

    let result: unknown;

    beforeAll(() => {
      tagFixture = 'tag-fixture';
      tagValueFixture = Symbol();

      result = bindWhenFluentSyntaxImplementation.whenAnyAncestorTagged(
        tagFixture,
        tagValueFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isAnyAncestorBindingConstraintsWithTag', () => {
      expect(isAnyAncestorBindingConstraintsWithTag).toHaveBeenCalledTimes(1);
      expect(isAnyAncestorBindingConstraintsWithTag).toHaveBeenCalledWith(
        tagFixture,
        tagValueFixture,
      );
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });

  describe('.whenDefault', () => {
    let result: unknown;

    beforeAll(() => {
      result = bindWhenFluentSyntaxImplementation.whenDefault();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should set constraint', () => {
      expect(isSatisfiedBySetterMock).toHaveBeenCalledTimes(1);
      expect(isSatisfiedBySetterMock).toHaveBeenCalledWith(
        isBindingConstraintsWithNoNameNorTags,
      );
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });

  describe('.whenNamed', () => {
    let nameFixture: MetadataName;

    let result: unknown;

    beforeAll(() => {
      nameFixture = 'name-fixture';

      result = bindWhenFluentSyntaxImplementation.whenNamed(nameFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isBindingConstraintsWithName', () => {
      expect(isBindingConstraintsWithName).toHaveBeenCalledTimes(1);
      expect(isBindingConstraintsWithName).toHaveBeenCalledWith(nameFixture);
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });

  describe('.whenParent', () => {
    let constraintFixture: (metadata: BindingConstraints) => boolean;

    let result: unknown;

    beforeAll(() => {
      constraintFixture = () => true;

      result = bindWhenFluentSyntaxImplementation.whenParent(constraintFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isParentBindingConstraints', () => {
      expect(isParentBindingConstraints).toHaveBeenCalledTimes(1);
      expect(isParentBindingConstraints).toHaveBeenCalledWith(
        constraintFixture,
      );
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });

  describe('.whenParentIs', () => {
    let serviceIdFixture: ServiceIdentifier;

    let result: unknown;

    beforeAll(() => {
      serviceIdFixture = 'name-fixture';

      result =
        bindWhenFluentSyntaxImplementation.whenParentIs(serviceIdFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isParentBindingConstraintsWithServiceId', () => {
      expect(isParentBindingConstraintsWithServiceId).toHaveBeenCalledTimes(1);
      expect(isParentBindingConstraintsWithServiceId).toHaveBeenCalledWith(
        serviceIdFixture,
      );
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });

  describe('.whenParentNamed', () => {
    let nameFixture: MetadataName;

    let result: unknown;

    beforeAll(() => {
      nameFixture = 'name-fixture';

      result = bindWhenFluentSyntaxImplementation.whenParentNamed(nameFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isParentBindingConstraintsWithName', () => {
      expect(isParentBindingConstraintsWithName).toHaveBeenCalledTimes(1);
      expect(isParentBindingConstraintsWithName).toHaveBeenCalledWith(
        nameFixture,
      );
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });

  describe('.whenParentTagged', () => {
    let tagFixture: MetadataTag;
    let tagValueFixture: unknown;

    let result: unknown;

    beforeAll(() => {
      tagFixture = 'tag-fixture';
      tagValueFixture = Symbol();

      result = bindWhenFluentSyntaxImplementation.whenParentTagged(
        tagFixture,
        tagValueFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isParentBindingConstraintsWithTag', () => {
      expect(isParentBindingConstraintsWithTag).toHaveBeenCalledTimes(1);
      expect(isParentBindingConstraintsWithTag).toHaveBeenCalledWith(
        tagFixture,
        tagValueFixture,
      );
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });

  describe('.whenTagged', () => {
    let tagFixture: MetadataTag;
    let tagValueFixture: unknown;

    let result: unknown;

    beforeAll(() => {
      tagFixture = 'tag-fixture';
      tagValueFixture = Symbol();

      result = bindWhenFluentSyntaxImplementation.whenTagged(
        tagFixture,
        tagValueFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isBindingConstraintsWithTag', () => {
      expect(isBindingConstraintsWithTag).toHaveBeenCalledTimes(1);
      expect(isBindingConstraintsWithTag).toHaveBeenCalledWith(
        tagFixture,
        tagValueFixture,
      );
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });

  describe('.whenNoParentIs', () => {
    let serviceIdFixture: ServiceIdentifier;

    let result: unknown;

    beforeAll(() => {
      serviceIdFixture = 'name-fixture';

      result =
        bindWhenFluentSyntaxImplementation.whenNoParentIs(serviceIdFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isNotParentBindingConstraintsWithServiceId', () => {
      expect(isNotParentBindingConstraintsWithServiceId).toHaveBeenCalledTimes(
        1,
      );
      expect(isNotParentBindingConstraintsWithServiceId).toHaveBeenCalledWith(
        serviceIdFixture,
      );
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });

  describe('.whenNoParentNamed', () => {
    let nameFixture: MetadataName;

    let result: unknown;

    beforeAll(() => {
      nameFixture = 'name-fixture';

      result =
        bindWhenFluentSyntaxImplementation.whenNoParentNamed(nameFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isNotParentBindingConstraintsWithName', () => {
      expect(isNotParentBindingConstraintsWithName).toHaveBeenCalledTimes(1);
      expect(isNotParentBindingConstraintsWithName).toHaveBeenCalledWith(
        nameFixture,
      );
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });

  describe('.whenNoParentTagged', () => {
    let tagFixture: MetadataTag;
    let tagValueFixture: unknown;

    let result: unknown;

    beforeAll(() => {
      tagFixture = 'tag-fixture';
      tagValueFixture = Symbol();

      result = bindWhenFluentSyntaxImplementation.whenNoParentTagged(
        tagFixture,
        tagValueFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isNotParentBindingConstraintsWithTag', () => {
      expect(isNotParentBindingConstraintsWithTag).toHaveBeenCalledTimes(1);
      expect(isNotParentBindingConstraintsWithTag).toHaveBeenCalledWith(
        tagFixture,
        tagValueFixture,
      );
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });

  describe('.whenNoParent', () => {
    let constraintFixture: (metadata: BindingConstraints) => boolean;

    let result: unknown;

    beforeAll(() => {
      constraintFixture = () => true;

      result =
        bindWhenFluentSyntaxImplementation.whenNoParent(constraintFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isNotParentBindingConstraints', () => {
      expect(isNotParentBindingConstraints).toHaveBeenCalledTimes(1);
      expect(isNotParentBindingConstraints).toHaveBeenCalledWith(
        constraintFixture,
      );
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });

  describe('.whenNoAncestor', () => {
    let constraintFixture: (metadata: BindingConstraints) => boolean;

    let result: unknown;

    beforeAll(() => {
      constraintFixture = () => true;

      result =
        bindWhenFluentSyntaxImplementation.whenNoAncestor(constraintFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isNoAncestorBindingConstraints', () => {
      expect(isNoAncestorBindingConstraints).toHaveBeenCalledTimes(1);
      expect(isNoAncestorBindingConstraints).toHaveBeenCalledWith(
        constraintFixture,
      );
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });

  describe('.whenNoAncestorIs', () => {
    let serviceIdFixture: ServiceIdentifier;

    let result: unknown;

    beforeAll(() => {
      serviceIdFixture = 'service-id-fixture';

      result =
        bindWhenFluentSyntaxImplementation.whenNoAncestorIs(serviceIdFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isNoAncestorBindingConstraintsWithServiceId', () => {
      expect(isNoAncestorBindingConstraintsWithServiceId).toHaveBeenCalledTimes(
        1,
      );
      expect(isNoAncestorBindingConstraintsWithServiceId).toHaveBeenCalledWith(
        serviceIdFixture,
      );
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });

  describe('.whenNoAncestorNamed', () => {
    let nameFixture: MetadataName;

    let result: unknown;

    beforeAll(() => {
      nameFixture = 'name-fixture';

      result =
        bindWhenFluentSyntaxImplementation.whenNoAncestorNamed(nameFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isNoAncestorBindingConstraintsWithName', () => {
      expect(isNoAncestorBindingConstraintsWithName).toHaveBeenCalledTimes(1);
      expect(isNoAncestorBindingConstraintsWithName).toHaveBeenCalledWith(
        nameFixture,
      );
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });

  describe('.whenNoAncestorTagged', () => {
    let tagFixture: MetadataTag;
    let tagValueFixture: unknown;

    let result: unknown;

    beforeAll(() => {
      tagFixture = 'tag-fixture';
      tagValueFixture = Symbol();

      result = bindWhenFluentSyntaxImplementation.whenNoAncestorTagged(
        tagFixture,
        tagValueFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call isNoAncestorBindingConstraintsWithTag', () => {
      expect(isNoAncestorBindingConstraintsWithTag).toHaveBeenCalledTimes(1);
      expect(isNoAncestorBindingConstraintsWithTag).toHaveBeenCalledWith(
        tagFixture,
        tagValueFixture,
      );
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });
});

describe(BindWhenOnFluentSyntaxImplementation.name, () => {
  let bindingFixture: Writable<ConstantValueBinding<unknown>>;
  let bindingActivationSetterMock: Mock<
    (value: BindingActivation | undefined) => undefined
  >;
  let bindingDeactivationSetterMock: Mock<
    (value: BindingDeactivation | undefined) => undefined
  >;

  let bindWhenOnFluentSyntaxImplementation: BindWhenOnFluentSyntaxImplementation<unknown>;

  beforeAll(() => {
    bindingActivationSetterMock = vitest.fn();
    bindingDeactivationSetterMock = vitest.fn();

    bindingFixture = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: 1,
      isSatisfiedBy: expect.any(Function) as unknown as (
        metadata: BindingConstraints,
      ) => boolean,
      moduleId: undefined,
      get onActivation(): BindingActivation<unknown> | undefined {
        return undefined;
      },
      set onActivation(value: BindingActivation<unknown> | undefined) {
        bindingActivationSetterMock(value);
      },
      get onDeactivation(): BindingDeactivation<unknown> | undefined {
        return undefined;
      },
      set onDeactivation(value: BindingDeactivation<unknown> | undefined) {
        bindingDeactivationSetterMock(value);
      },
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: 'service-id',
      type: bindingTypeValues.ConstantValue,
      value: Symbol.for('constant-value'),
    };

    bindWhenOnFluentSyntaxImplementation =
      new BindWhenOnFluentSyntaxImplementation(bindingFixture);
  });

  describe('.onActivation', () => {
    describe('when called', () => {
      let activationFixture: BindingActivation<unknown>;

      let result: unknown;

      beforeAll(() => {
        activationFixture = (value: unknown) => value;

        result =
          bindWhenOnFluentSyntaxImplementation.onActivation(activationFixture);
      });

      it('should set binding activation', () => {
        expect(bindingActivationSetterMock).toHaveBeenCalledTimes(1);
        expect(bindingActivationSetterMock).toHaveBeenCalledWith(
          activationFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBeInstanceOf(BindWhenFluentSyntaxImplementation);
      });
    });
  });

  describe('.onDeactivation', () => {
    describe('when called', () => {
      let deactivationFixture: BindingDeactivation<unknown>;

      let result: unknown;

      beforeAll(() => {
        deactivationFixture = () => undefined;

        result =
          bindWhenOnFluentSyntaxImplementation.onDeactivation(
            deactivationFixture,
          );
      });

      it('should set binding deactivation', () => {
        expect(bindingDeactivationSetterMock).toHaveBeenCalledTimes(1);
        expect(bindingDeactivationSetterMock).toHaveBeenCalledWith(
          deactivationFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBeInstanceOf(BindWhenFluentSyntaxImplementation);
      });
    });
  });
});

describe(BindInWhenOnFluentSyntaxImplementation.name, () => {
  let bindingMock: Mocked<ScopedBinding<BindingType, BindingScope, unknown>>;

  let bindingMockSetScopeMock: Mock<(value: BindingScope) => void>;

  let bindInWhenOnFluentSyntaxImplementation: BindInWhenOnFluentSyntaxImplementation<unknown>;

  beforeAll(() => {
    let bindingScope: BindingScope = bindingScopeValues.Singleton;

    bindingMockSetScopeMock = vitest.fn();

    bindingMock = {
      get scope(): BindingScope {
        return bindingScope;
      },
      set scope(value: BindingScope) {
        bindingMockSetScopeMock(value);

        bindingScope = value;
      },
    } as Partial<
      Mocked<ScopedBinding<BindingType, BindingScope, unknown>>
    > as Mocked<ScopedBinding<BindingType, BindingScope, unknown>>;

    bindInWhenOnFluentSyntaxImplementation =
      new BindInWhenOnFluentSyntaxImplementation(bindingMock);
  });

  describe.each<
    [
      string,
      (
        bindInFluentSyntaxImplementation: BindInWhenOnFluentSyntaxImplementation<unknown>,
      ) => unknown,
      BindingScope,
    ]
  >([
    [
      '.inRequestScope()',
      (
        bindInFluentSyntaxImplementation: BindInWhenOnFluentSyntaxImplementation<unknown>,
      ) => bindInFluentSyntaxImplementation.inRequestScope(),
      bindingScopeValues.Request,
    ],
    [
      '.inSingletonScope()',
      (
        bindInFluentSyntaxImplementation: BindInWhenOnFluentSyntaxImplementation<unknown>,
      ) => bindInFluentSyntaxImplementation.inSingletonScope(),
      bindingScopeValues.Singleton,
    ],
    [
      '.inTransientScope()',
      (
        bindInFluentSyntaxImplementation: BindInWhenOnFluentSyntaxImplementation<unknown>,
      ) => bindInFluentSyntaxImplementation.inTransientScope(),
      bindingScopeValues.Transient,
    ],
  ])(
    '%s',
    (
      _: string,
      buildResult: (
        bindInFluentSyntaxImplementation: BindInWhenOnFluentSyntaxImplementation<unknown>,
      ) => unknown,
      expectedScope: BindingScope,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = buildResult(bindInWhenOnFluentSyntaxImplementation);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should set binding scope', () => {
          expect(bindingMockSetScopeMock).toHaveBeenCalledTimes(1);
          expect(bindingMockSetScopeMock).toHaveBeenCalledWith(expectedScope);
        });

        it('should return BindWhenOnFluentSyntax', () => {
          expect(result).toBeInstanceOf(BindWhenOnFluentSyntaxImplementation);
        });
      });
    },
  );
});
