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

vitest.mock('@inversifyjs/common');
vitest.mock('@inversifyjs/core');

vitest.mock('../actions/getBindingId');
vitest.mock('../calculations/buildBindingIdentifier');
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

import {
  ServiceIdentifier,
  stringifyServiceIdentifier,
} from '@inversifyjs/common';
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
  DynamicValueBinding,
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
import { getBindingId } from '@inversifyjs/core';

import { Writable } from '../../common/models/Writable';
import { BindingConstraintUtils } from '../../container/binding/utils/BindingConstraintUtils';
import { InversifyContainerError } from '../../error/models/InversifyContainerError';
import { InversifyContainerErrorKind } from '../../error/models/InversifyContainerErrorKind';
import { ClassMetadataFixtures } from '../../metadata/fixtures/ClassMetadataFixtures';
import { buildBindingIdentifier } from '../calculations/buildBindingIdentifier';
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
import { BindingIdentifier } from './BindingIdentifier';
import {
  ResolvedValueInjectOptions,
  ResolvedValueMetadataInjectOptions,
} from './ResolvedValueInjectOptions';

describe(BindInFluentSyntaxImplementation, () => {
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
          expect(bindingMockSetScopeMock).toHaveBeenCalledExactlyOnceWith(
            expectedScope,
          );
        });

        it('should return BindWhenOnFluentSyntax', () => {
          expect(result).toBeInstanceOf(BindWhenOnFluentSyntaxImplementation);
        });
      });
    },
  );

  describe('.getIdentifier', () => {
    let bindingIdentifierFixture: BindingIdentifier;

    let result: unknown;

    beforeAll(() => {
      bindingIdentifierFixture = Symbol() as unknown as BindingIdentifier;

      vitest
        .mocked(buildBindingIdentifier)
        .mockReturnValue(bindingIdentifierFixture);
      result = bindInFluentSyntaxImplementation.getIdentifier();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call buildBindingIdentifier', () => {
      expect(buildBindingIdentifier).toHaveBeenCalledExactlyOnceWith(
        bindingMock,
      );
    });

    it('should return the mocked identifier', () => {
      expect(result).toBe(bindingIdentifierFixture);
    });
  });
});

describe(BindToFluentSyntaxImplementation, () => {
  let bindingIdFixture: number;

  let dynamicValueBuilderfixture: DynamicValueBuilder<unknown>;
  let factoryBuilderFixture: (context: ResolutionContext) => Factory<unknown>;
  let providerBuilderFixture: (context: ResolutionContext) => Provider<unknown>; // eslint-disable-line @typescript-eslint/no-deprecated

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
          Provider<unknown> // eslint-disable-line @typescript-eslint/no-deprecated
        >,
      ): unknown =>
        bindToFluentSyntaxImplementation.toProvider(providerBuilderFixture), // eslint-disable-line @typescript-eslint/no-deprecated
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
          expect(getBindingId).toHaveBeenCalledExactlyOnceWith();
        });

        it('should call callback', () => {
          expect(callbackMock).toHaveBeenCalledExactlyOnceWith(expectedBinding);
        });

        it('should return expected result', () => {
          expect(result).toBeInstanceOf(expectedResultType);
        });
      });
    },
  );

  describe('.toResolvedValue', () => {
    describe('having no inject options', () => {
      let factoryFixture: () => unknown;

      beforeAll(() => {
        factoryFixture = () => Symbol();
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
          expect(getBindingId).toHaveBeenCalledExactlyOnceWith();
        });

        it('should call callback', () => {
          expect(callbackMock).toHaveBeenCalledExactlyOnceWith(expectedBinding);
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
          expect(
            isResolvedValueMetadataInjectOptions,
          ).toHaveBeenCalledExactlyOnceWith(injectOptions);
        });

        it('should call getBindingId', () => {
          expect(getBindingId).toHaveBeenCalledExactlyOnceWith();
        });

        it('should call callback', () => {
          expect(callbackMock).toHaveBeenCalledExactlyOnceWith(expectedBinding);
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
          expect(
            isResolvedValueMetadataInjectOptions,
          ).toHaveBeenCalledExactlyOnceWith(injectOptions);
        });

        it('should call getBindingId', () => {
          expect(getBindingId).toHaveBeenCalledExactlyOnceWith();
        });

        it('should call callback', () => {
          expect(callbackMock).toHaveBeenCalledExactlyOnceWith(expectedBinding);
        });

        it('should return expected result', () => {
          expect(result).toBeInstanceOf(BindInWhenOnFluentSyntaxImplementation);
        });
      });
    });

    describe('having inject options with service identifier and optional metadata', () => {
      let factoryFixture: (arg: unknown[] | undefined) => unknown;
      let injectOptions: ResolvedValueMetadataInjectOptions<
        unknown[] | undefined
      >;

      beforeAll(() => {
        factoryFixture = (arg: unknown[] | undefined) => arg;
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
                  chained: false,
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
          expect(
            isResolvedValueMetadataInjectOptions,
          ).toHaveBeenCalledExactlyOnceWith(injectOptions);
        });

        it('should call getBindingId', () => {
          expect(getBindingId).toHaveBeenCalledExactlyOnceWith();
        });

        it('should call callback', () => {
          expect(callbackMock).toHaveBeenCalledExactlyOnceWith(expectedBinding);
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
          expect(getClassMetadata).toHaveBeenCalledExactlyOnceWith(
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

          expect(callbackMock).toHaveBeenCalledExactlyOnceWith(expectedBinding);
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
          expect(getClassMetadata).toHaveBeenCalledExactlyOnceWith(
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

          expect(callbackMock).toHaveBeenCalledExactlyOnceWith(expectedBinding);
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

        expect(callbackMock).toHaveBeenCalledExactlyOnceWith(expectedBinding);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});

describe(BindOnFluentSyntaxImplementation, () => {
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
        expect(bindingActivationSetterMock).toHaveBeenCalledExactlyOnceWith(
          activationFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBeInstanceOf(BindWhenFluentSyntaxImplementation);
      });
    });
  });

  describe('.onDeactivation', () => {
    describe('having a BindingFluentSyntaxImplementation with non singleton scope', () => {
      let bindingFixture: Writable<DynamicValueBinding<unknown>>;

      let bindOnFluentSyntaxImplementation: BindOnFluentSyntaxImplementation<unknown>;

      beforeAll(() => {
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
          scope: bindingScopeValues.Transient,
          serviceIdentifier: 'service-id',
          type: bindingTypeValues.DynamicValue,
          value: () => Symbol('dynamic-value'),
        };

        bindOnFluentSyntaxImplementation = new BindOnFluentSyntaxImplementation(
          bindingFixture,
        );
      });

      describe('when called', () => {
        let deactivationFixture: BindingDeactivation<unknown>;
        let stringifiedServiceIdentifierFixture: string;

        let result: unknown;

        beforeAll(() => {
          deactivationFixture = () => undefined;
          stringifiedServiceIdentifierFixture = 'service-id';

          vitest
            .mocked(stringifyServiceIdentifier)
            .mockReturnValueOnce(stringifiedServiceIdentifierFixture);

          try {
            bindOnFluentSyntaxImplementation.onDeactivation(
              deactivationFixture,
            );
          } catch (error: unknown) {
            result = error;
          }
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call stringifyServiceIdentifier()', () => {
          expect(stringifyServiceIdentifier).toHaveBeenCalledExactlyOnceWith(
            bindingFixture.serviceIdentifier,
          );
        });

        it('should throw an InversifyContainerError', () => {
          const expectedErrorProperties: Partial<InversifyContainerError> = {
            kind: InversifyContainerErrorKind.invalidOperation,
            message: `Binding for service "${stringifiedServiceIdentifierFixture}" has a deactivation function, but its scope is not singleton. Deactivation functions can only be used with singleton bindings.`,
          };

          expect(result).toBeInstanceOf(InversifyContainerError);
          expect(result).toStrictEqual(
            expect.objectContaining(expectedErrorProperties),
          );
        });
      });
    });

    describe('having a BindingFluentSyntaxImplementation with singleton scope', () => {
      let bindingFixture: Writable<ConstantValueBinding<unknown>>;

      let bindOnFluentSyntaxImplementation: BindOnFluentSyntaxImplementation<unknown>;

      beforeAll(() => {
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

      describe('when called', () => {
        let deactivationFixture: BindingDeactivation<unknown>;

        let result: unknown;

        beforeAll(() => {
          deactivationFixture = () => undefined;

          result =
            bindOnFluentSyntaxImplementation.onDeactivation(
              deactivationFixture,
            );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should set binding deactivation', () => {
          expect(bindingDeactivationSetterMock).toHaveBeenCalledExactlyOnceWith(
            deactivationFixture,
          );
        });

        it('should return expected result', () => {
          expect(result).toBeInstanceOf(BindWhenFluentSyntaxImplementation);
        });
      });
    });
  });

  describe('.getIdentifier', () => {
    let bindingIdentifierFixture: BindingIdentifier;

    let result: unknown;

    beforeAll(() => {
      bindingIdentifierFixture = Symbol() as unknown as BindingIdentifier;

      vitest
        .mocked(buildBindingIdentifier)
        .mockReturnValue(bindingIdentifierFixture);
      result = bindOnFluentSyntaxImplementation.getIdentifier();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call buildBindingIdentifier', () => {
      expect(buildBindingIdentifier).toHaveBeenCalledExactlyOnceWith(
        bindingFixture,
      );
    });

    it('should return the mocked identifier', () => {
      expect(result).toBe(bindingIdentifierFixture);
    });
  });
});

describe(BindWhenFluentSyntaxImplementation, () => {
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
      expect(isSatisfiedBySetterMock).toHaveBeenCalledExactlyOnceWith(
        constraintFixture,
      );
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
      expect(isAnyAncestorBindingConstraints).toHaveBeenCalledExactlyOnceWith(
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
      ).toHaveBeenCalledExactlyOnceWith(serviceIdFixture);
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
      expect(
        isAnyAncestorBindingConstraintsWithName,
      ).toHaveBeenCalledExactlyOnceWith(nameFixture);
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
      expect(
        isAnyAncestorBindingConstraintsWithTag,
      ).toHaveBeenCalledExactlyOnceWith(tagFixture, tagValueFixture);
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
      expect(isSatisfiedBySetterMock).toHaveBeenCalledExactlyOnceWith(
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
      expect(isBindingConstraintsWithName).toHaveBeenCalledExactlyOnceWith(
        nameFixture,
      );
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
      expect(isParentBindingConstraints).toHaveBeenCalledExactlyOnceWith(
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
      expect(
        isParentBindingConstraintsWithServiceId,
      ).toHaveBeenCalledExactlyOnceWith(serviceIdFixture);
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
      expect(
        isParentBindingConstraintsWithName,
      ).toHaveBeenCalledExactlyOnceWith(nameFixture);
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
      expect(isParentBindingConstraintsWithTag).toHaveBeenCalledExactlyOnceWith(
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
      expect(isBindingConstraintsWithTag).toHaveBeenCalledExactlyOnceWith(
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
      expect(
        isNotParentBindingConstraintsWithServiceId,
      ).toHaveBeenCalledExactlyOnceWith(serviceIdFixture);
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
      expect(
        isNotParentBindingConstraintsWithName,
      ).toHaveBeenCalledExactlyOnceWith(nameFixture);
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
      expect(
        isNotParentBindingConstraintsWithTag,
      ).toHaveBeenCalledExactlyOnceWith(tagFixture, tagValueFixture);
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
      expect(isNotParentBindingConstraints).toHaveBeenCalledExactlyOnceWith(
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
      expect(isNoAncestorBindingConstraints).toHaveBeenCalledExactlyOnceWith(
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
      expect(
        isNoAncestorBindingConstraintsWithServiceId,
      ).toHaveBeenCalledExactlyOnceWith(serviceIdFixture);
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
      expect(
        isNoAncestorBindingConstraintsWithName,
      ).toHaveBeenCalledExactlyOnceWith(nameFixture);
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
      expect(
        isNoAncestorBindingConstraintsWithTag,
      ).toHaveBeenCalledExactlyOnceWith(tagFixture, tagValueFixture);
    });

    it('should return expected result', () => {
      expect(result).toBeInstanceOf(BindOnFluentSyntaxImplementation);
    });
  });

  describe('.getIdentifier', () => {
    let bindingIdentifierFixture: BindingIdentifier;

    let result: unknown;

    beforeAll(() => {
      bindingIdentifierFixture = Symbol() as unknown as BindingIdentifier;

      vitest
        .mocked(buildBindingIdentifier)
        .mockReturnValue(bindingIdentifierFixture);
      result = bindWhenFluentSyntaxImplementation.getIdentifier();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call buildBindingIdentifier', () => {
      expect(buildBindingIdentifier).toHaveBeenCalledExactlyOnceWith(
        bindingFixture,
      );
    });

    it('should return the mocked identifier', () => {
      expect(result).toBe(bindingIdentifierFixture);
    });
  });
});

describe(BindWhenOnFluentSyntaxImplementation, () => {
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
        expect(bindingActivationSetterMock).toHaveBeenCalledExactlyOnceWith(
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
        expect(bindingDeactivationSetterMock).toHaveBeenCalledExactlyOnceWith(
          deactivationFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBeInstanceOf(BindWhenFluentSyntaxImplementation);
      });
    });
  });

  describe('.getIdentifier', () => {
    let bindingIdentifierFixture: BindingIdentifier;

    let result: unknown;

    beforeAll(() => {
      bindingIdentifierFixture = Symbol() as unknown as BindingIdentifier;

      vitest
        .mocked(buildBindingIdentifier)
        .mockReturnValue(bindingIdentifierFixture);
      result = bindWhenOnFluentSyntaxImplementation.getIdentifier();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call buildBindingIdentifier', () => {
      expect(buildBindingIdentifier).toHaveBeenCalledExactlyOnceWith(
        bindingFixture,
      );
    });

    it('should return the mocked identifier', () => {
      expect(result).toBe(bindingIdentifierFixture);
    });
  });
});

describe(BindInWhenOnFluentSyntaxImplementation, () => {
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
          expect(bindingMockSetScopeMock).toHaveBeenCalledExactlyOnceWith(
            expectedScope,
          );
        });

        it('should return BindWhenOnFluentSyntax', () => {
          expect(result).toBeInstanceOf(BindWhenOnFluentSyntaxImplementation);
        });
      });
    },
  );

  describe('.getIdentifier', () => {
    let bindingIdentifierFixture: BindingIdentifier;

    let result: unknown;

    beforeAll(() => {
      bindingIdentifierFixture = Symbol() as unknown as BindingIdentifier;

      vitest
        .mocked(buildBindingIdentifier)
        .mockReturnValue(bindingIdentifierFixture);
      result = bindInWhenOnFluentSyntaxImplementation.getIdentifier();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call buildBindingIdentifier', () => {
      expect(buildBindingIdentifier).toHaveBeenCalledExactlyOnceWith(
        bindingMock,
      );
    });

    it('should return the mocked identifier', () => {
      expect(result).toBe(bindingIdentifierFixture);
    });
  });
});
