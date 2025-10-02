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

vitest.mock('../actions/addRootServiceNodeBindingIfContextFree');
vitest.mock('../actions/addServiceNodeBindingIfContextFree');

import { Binding } from '../../binding/models/Binding';
import { InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation';
import { bindingScopeValues } from '../../binding/models/BindingScope';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList';
import { ClassElementMetadataKind } from '../../metadata/models/ClassElementMetadataKind';
import { PlanServiceNodeBindingAddedResult } from '../../metadata/models/PlanServiceNodeBindingAddedResult';
import { ResolvedValueElementMetadataKind } from '../../metadata/models/ResolvedValueElementMetadataKind';
import { addRootServiceNodeBindingIfContextFree } from '../actions/addRootServiceNodeBindingIfContextFree';
import { addServiceNodeBindingIfContextFree } from '../actions/addServiceNodeBindingIfContextFree';
import { BasePlanParams } from '../models/BasePlanParams';
import { CacheBindingInvalidation } from '../models/CacheBindingInvalidation';
import { CacheBindingInvalidationKind } from '../models/CacheBindingInvalidationKind';
import { GetPlanOptions } from '../models/GetPlanOptions';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode';
import { NonCachedServiceNodeContext } from '../models/NonCachedServiceNodeContext';
import { PlanParams } from '../models/PlanParams';
import { PlanParamsOperations } from '../models/PlanParamsOperations';
import { PlanResult } from '../models/PlanResult';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { PlanResultCacheService } from './PlanResultCacheService';

class LazyPlanServiceNodeMock extends LazyPlanServiceNode {
  public readonly buildPlanServiceNodeMock: Mock<() => PlanServiceNode>;

  constructor(
    serviceNode: PlanServiceNode,
    buildPlanServiceNodeMock: Mock<() => PlanServiceNode>,
  ) {
    super(serviceNode, serviceNode.serviceIdentifier);

    this.buildPlanServiceNodeMock = buildPlanServiceNodeMock;
  }

  public get internalServiceNode(): PlanServiceNode | undefined {
    return this._serviceNode;
  }

  protected override _buildPlanServiceNode(): PlanServiceNode {
    return this.buildPlanServiceNodeMock();
  }
}

function buildExpectedPlanParamsFixture(
  optionsFixture: GetPlanOptions,
  planResultCacheServiceInvalidationFixture: CacheBindingInvalidation,
): PlanParams {
  const expectedPlanParamsFixture: PlanParams = optionsFixture.isMultiple
    ? {
        autobindOptions: undefined,
        operations: planResultCacheServiceInvalidationFixture.operations,
        rootConstraints: {
          chained: optionsFixture.chained,
          isMultiple: optionsFixture.isMultiple,
          serviceIdentifier:
            planResultCacheServiceInvalidationFixture.binding.serviceIdentifier,
        },
        servicesBranch: [],
      }
    : {
        autobindOptions: undefined,
        operations: planResultCacheServiceInvalidationFixture.operations,
        rootConstraints: {
          isMultiple: optionsFixture.isMultiple,
          serviceIdentifier:
            planResultCacheServiceInvalidationFixture.binding.serviceIdentifier,
        },
        servicesBranch: [],
      };

  if (optionsFixture.name !== undefined) {
    expectedPlanParamsFixture.rootConstraints.name = optionsFixture.name;
  }

  if (optionsFixture.tag !== undefined) {
    expectedPlanParamsFixture.rootConstraints.tag = optionsFixture.tag;
  }

  return expectedPlanParamsFixture;
}

const planOptionsAndStringDescriptionPairList: [string, GetPlanOptions][] = [
  [
    'isMultiple false and optional false',
    {
      isMultiple: false,
      name: undefined,
      optional: false,
      serviceIdentifier: 'service-id',
      tag: undefined,
    },
  ],
  [
    'isMultiple false and optional true',
    {
      isMultiple: false,
      name: undefined,
      optional: true,
      serviceIdentifier: 'service-id',
      tag: undefined,
    },
  ],
  [
    'isMultiple true and optional false',
    {
      chained: false,
      isMultiple: true,
      name: undefined,
      optional: false,
      serviceIdentifier: 'service-id',
      tag: undefined,
    },
  ],
  [
    'isMultiple true and optional true',
    {
      chained: false,
      isMultiple: true,
      name: undefined,
      optional: true,
      serviceIdentifier: 'service-id',
      tag: undefined,
    },
  ],
  [
    'isMultiple false, optional false and name',
    {
      isMultiple: false,
      name: 'name',
      optional: false,
      serviceIdentifier: 'service-id',
      tag: undefined,
    },
  ],
  [
    'isMultiple false, optional true and name',
    {
      isMultiple: false,
      name: 'name',
      optional: true,
      serviceIdentifier: 'service-id',
      tag: undefined,
    },
  ],
  [
    'isMultiple true, optional false and name',
    {
      chained: false,
      isMultiple: true,
      name: 'name',
      optional: false,
      serviceIdentifier: 'service-id',
      tag: undefined,
    },
  ],
  [
    'isMultiple true, optional true and name',
    {
      chained: false,
      isMultiple: true,
      name: 'name',
      optional: true,
      serviceIdentifier: 'service-id',
      tag: undefined,
    },
  ],
  [
    'isMultiple false, optional false and tag',
    {
      isMultiple: false,
      name: undefined,
      optional: false,
      serviceIdentifier: 'service-id',
      tag: {
        key: 'key',
        value: 'value',
      },
    },
  ],
  [
    'isMultiple false, optional true and tag',
    {
      isMultiple: false,
      name: undefined,
      optional: true,
      serviceIdentifier: 'service-id',
      tag: {
        key: 'key',
        value: 'value',
      },
    },
  ],
  [
    'isMultiple true, optional false and tag',
    {
      chained: false,
      isMultiple: true,
      name: undefined,
      optional: false,
      serviceIdentifier: 'service-id',
      tag: {
        key: 'key',
        value: 'value',
      },
    },
  ],
  [
    'isMultiple true, optional true and tag',
    {
      chained: false,
      isMultiple: true,
      name: undefined,
      optional: true,
      serviceIdentifier: 'service-id',
      tag: {
        key: 'key',
        value: 'value',
      },
    },
  ],
  [
    'isMultiple false, optional false, name and tag',
    {
      isMultiple: false,
      name: 'name',
      optional: false,
      serviceIdentifier: 'service-id',
      tag: {
        key: 'key',
        value: 'value',
      },
    },
  ],
  [
    'isMultiple false, optional true, name and tag',
    {
      isMultiple: false,
      name: 'name',
      optional: true,
      serviceIdentifier: 'service-id',
      tag: {
        key: 'key',
        value: 'value',
      },
    },
  ],
  [
    'isMultiple true, optional false, name and tag',
    {
      chained: false,
      isMultiple: true,
      name: 'name',
      optional: false,
      serviceIdentifier: 'service-id',
      tag: {
        key: 'key',
        value: 'value',
      },
    },
  ],
  [
    'isMultiple true, optional true, name and tag',
    {
      chained: false,
      isMultiple: true,
      name: 'name',
      optional: true,
      serviceIdentifier: 'service-id',
      tag: {
        key: 'key',
        value: 'value',
      },
    },
  ],
  [
    'chained true, isMultiple true and optional false',
    {
      chained: true,
      isMultiple: true,
      name: undefined,
      optional: false,
      serviceIdentifier: 'service-id',
      tag: undefined,
    },
  ],
  [
    'chained true, isMultiple true and optional true',
    {
      chained: true,
      isMultiple: true,
      name: undefined,
      optional: true,
      serviceIdentifier: 'service-id',
      tag: undefined,
    },
  ],
  [
    'chained true, isMultiple true, optional false and name',
    {
      chained: true,
      isMultiple: true,
      name: 'name',
      optional: false,
      serviceIdentifier: 'service-id',
      tag: undefined,
    },
  ],
  [
    'chained true, isMultiple true, optional true and name',
    {
      chained: true,
      isMultiple: true,
      name: 'name',
      optional: true,
      serviceIdentifier: 'service-id',
      tag: undefined,
    },
  ],
  [
    'chained true, isMultiple true, optional false and tag',
    {
      chained: true,
      isMultiple: true,
      name: undefined,
      optional: false,
      serviceIdentifier: 'service-id',
      tag: {
        key: 'key',
        value: 'value',
      },
    },
  ],
  [
    'chained true, isMultiple true, optional true and tag',
    {
      chained: true,
      isMultiple: true,
      name: undefined,
      optional: true,
      serviceIdentifier: 'service-id',
      tag: {
        key: 'key',
        value: 'value',
      },
    },
  ],
  [
    'chained true, isMultiple true, optional false, name and tag',
    {
      chained: true,
      isMultiple: true,
      name: 'name',
      optional: false,
      serviceIdentifier: 'service-id',
      tag: {
        key: 'key',
        value: 'value',
      },
    },
  ],
  [
    'chained true, isMultiple true, optional true, name and tag',
    {
      chained: true,
      isMultiple: true,
      name: 'name',
      optional: true,
      serviceIdentifier: 'service-id',
      tag: {
        key: 'key',
        value: 'value',
      },
    },
  ],
];

const planOptionsList: GetPlanOptions[] =
  planOptionsAndStringDescriptionPairList.map(
    ([_, options]: [string, GetPlanOptions]) => options,
  );

const stringDescriptionAndPlanOptionsAndOtherPlanOptionsListTupleList: [
  string,
  GetPlanOptions,
  GetPlanOptions[],
][] = planOptionsAndStringDescriptionPairList.map(
  ([stringDescription, options]: [string, GetPlanOptions]) => [
    stringDescription,
    options,
    planOptionsList.filter(
      (planOptions: GetPlanOptions) => planOptions !== options,
    ),
  ],
);

describe(PlanResultCacheService, () => {
  describe('.invalidateService', () => {
    describe('having a plan result for a service identifier with a lazy plan service node with empty children array', () => {
      describe.each<[string, (planResult: PlanResult) => GetPlanOptions]>([
        [
          '',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: undefined,
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: undefined,
          }),
        ],
        [
          ' with name',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: 'name fixture',
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: undefined,
          }),
        ],
        [
          ' with name and tag',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: 'name fixture',
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: {
              key: 'key fixture',
              value: 'value fixture',
            },
          }),
        ],
        [
          ' with tag',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: undefined,
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: {
              key: 'key fixture',
              value: 'value fixture',
            },
          }),
        ],
      ])(
        'having GetPlanOptions%s and PlanResultCacheServiceInvalidation with binding added kind',
        (_: string, getOptions: (planResult: PlanResult) => GetPlanOptions) => {
          let buildPlanServiceNodeMock: Mock<() => PlanServiceNode>;
          let planServiceNodeFixture: PlanServiceNode;
          let lazyPlanServiceNodeFixture: LazyPlanServiceNode;
          let planResultCacheServiceInvalidationFixture: CacheBindingInvalidation;

          let planResultFixture: PlanResult;

          let optionsFixture: GetPlanOptions;

          beforeAll(() => {
            buildPlanServiceNodeMock = vitest.fn();
            planServiceNodeFixture = {
              bindings: [],
              isContextFree: true,
              serviceIdentifier: 'service-id',
            };
            lazyPlanServiceNodeFixture = new LazyPlanServiceNodeMock(
              planServiceNodeFixture,
              buildPlanServiceNodeMock,
            );
            planResultCacheServiceInvalidationFixture = {
              binding: {
                serviceIdentifier: planServiceNodeFixture.serviceIdentifier,
              } as unknown as Binding<unknown>,
              kind: CacheBindingInvalidationKind.bindingAdded,
              operations: Symbol() as unknown as PlanParamsOperations,
            };

            planResultFixture = {
              tree: {
                root: lazyPlanServiceNodeFixture,
              },
            };

            optionsFixture = getOptions(planResultFixture);
          });

          describe('when called .set(), and called .invalidateService() and addRootServiceNodeBindingIfContextFree() returns result with shouldInvalidateServiceNode', () => {
            let expectedPlanParamsFixture: PlanParams;
            let planResultCacheService: PlanResultCacheService;
            let planServiceNodeBindingAddedResultFixture: PlanServiceNodeBindingAddedResult;

            let servicePlanResult: PlanResult | undefined;

            beforeAll(() => {
              expectedPlanParamsFixture = buildExpectedPlanParamsFixture(
                optionsFixture,
                planResultCacheServiceInvalidationFixture,
              );

              planServiceNodeBindingAddedResultFixture = {
                isContextFreeBinding: true,
                shouldInvalidateServiceNode: true,
              };

              planResultCacheService = new PlanResultCacheService();
              planResultCacheService.set(optionsFixture, planResultFixture);

              vitest
                .mocked(addRootServiceNodeBindingIfContextFree)
                .mockReturnValueOnce(planServiceNodeBindingAddedResultFixture);

              planResultCacheService.invalidateServiceBinding(
                planResultCacheServiceInvalidationFixture,
              );

              servicePlanResult = planResultCacheService.get(optionsFixture);
            });

            afterAll(() => {
              vitest.clearAllMocks();
            });

            it('should call addRootServiceNodeBindingIfContextFree()', () => {
              expect(
                addRootServiceNodeBindingIfContextFree,
              ).toHaveBeenCalledExactlyOnceWith(
                expectedPlanParamsFixture,
                planResultFixture.tree.root,
                planResultCacheServiceInvalidationFixture.binding,
              );
            });

            it('should keep an invalidated PlanResult for the service', () => {
              expect(servicePlanResult).toBeDefined();
              expect(
                (servicePlanResult?.tree.root as LazyPlanServiceNodeMock)
                  .internalServiceNode,
              ).toBeUndefined();
            });
          });
        },
      );
    });

    describe('having a plan result for a service identifier with a lazy plan service node with no children', () => {
      describe.each<[string, (planResult: PlanResult) => GetPlanOptions]>([
        [
          '',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: undefined,
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: undefined,
          }),
        ],
        [
          ' with name',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: 'name fixture',
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: undefined,
          }),
        ],
        [
          ' with name and tag',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: 'name fixture',
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: {
              key: 'key fixture',
              value: 'value fixture',
            },
          }),
        ],
        [
          ' with tag',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: undefined,
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: {
              key: 'key fixture',
              value: 'value fixture',
            },
          }),
        ],
      ])(
        'having GetPlanOptions%s and PlanResultCacheServiceInvalidation with binding added kind',
        (_: string, getOptions: (planResult: PlanResult) => GetPlanOptions) => {
          let buildPlanServiceNodeMock: Mock<() => PlanServiceNode>;
          let planServiceNodeFixture: PlanServiceNode;
          let lazyPlanServiceNodeFixture: LazyPlanServiceNode;
          let planResultCacheServiceInvalidationFixture: CacheBindingInvalidation;

          let planResultFixture: PlanResult;

          let optionsFixture: GetPlanOptions;

          beforeAll(() => {
            buildPlanServiceNodeMock = vitest.fn();
            planServiceNodeFixture = {
              bindings: undefined,
              isContextFree: true,
              serviceIdentifier: 'service-id',
            };
            lazyPlanServiceNodeFixture = new LazyPlanServiceNodeMock(
              planServiceNodeFixture,
              buildPlanServiceNodeMock,
            );
            planResultCacheServiceInvalidationFixture = {
              binding: {
                serviceIdentifier: planServiceNodeFixture.serviceIdentifier,
              } as unknown as Binding<unknown>,
              kind: CacheBindingInvalidationKind.bindingAdded,
              operations: Symbol() as unknown as PlanParamsOperations,
            };

            planResultFixture = {
              tree: {
                root: lazyPlanServiceNodeFixture,
              },
            };

            optionsFixture = getOptions(planResultFixture);
          });

          describe('when called .set(), and called .invalidateService() and addRootServiceNodeBindingIfContextFree() returns result with shouldInvalidateServiceNode', () => {
            let expectedPlanParamsFixture: PlanParams;
            let planResultCacheService: PlanResultCacheService;
            let planServiceNodeBindingAddedResultFixture: PlanServiceNodeBindingAddedResult;

            let servicePlanResult: PlanResult | undefined;

            beforeAll(() => {
              expectedPlanParamsFixture = buildExpectedPlanParamsFixture(
                optionsFixture,
                planResultCacheServiceInvalidationFixture,
              );

              planResultCacheService = new PlanResultCacheService();
              planResultCacheService.set(optionsFixture, planResultFixture);

              planServiceNodeBindingAddedResultFixture = {
                isContextFreeBinding: true,
                shouldInvalidateServiceNode: true,
              };

              vitest
                .mocked(addRootServiceNodeBindingIfContextFree)
                .mockReturnValueOnce(planServiceNodeBindingAddedResultFixture);

              planResultCacheService.invalidateServiceBinding(
                planResultCacheServiceInvalidationFixture,
              );

              servicePlanResult = planResultCacheService.get(optionsFixture);
            });

            afterAll(() => {
              vitest.clearAllMocks();
            });

            it('should call addRootServiceNodeBindingIfContextFree()', () => {
              expect(
                addRootServiceNodeBindingIfContextFree,
              ).toHaveBeenCalledExactlyOnceWith(
                expectedPlanParamsFixture,
                planResultFixture.tree.root,
                planResultCacheServiceInvalidationFixture.binding,
              );
            });

            it('should keep an invalidated PlanResult for the service', () => {
              expect(servicePlanResult).toBeDefined();
              expect(
                (servicePlanResult?.tree.root as LazyPlanServiceNodeMock)
                  .internalServiceNode,
              ).toBeUndefined();
            });
          });
        },
      );
    });

    describe('having a plan result for a service identifier with a lazy plan service node with a context free child', () => {
      describe.each<[string, (planResult: PlanResult) => GetPlanOptions]>([
        [
          '',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: undefined,
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: undefined,
          }),
        ],
        [
          ' with name',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: 'name fixture',
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: undefined,
          }),
        ],
        [
          ' with name and tag',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: 'name fixture',
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: {
              key: 'key fixture',
              value: 'value fixture',
            },
          }),
        ],
        [
          ' with tag',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: undefined,
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: {
              key: 'key fixture',
              value: 'value fixture',
            },
          }),
        ],
      ])(
        'having GetPlanOptions%s and PlanResultCacheServiceInvalidation with binding added kind',
        (_: string, getOptions: (planResult: PlanResult) => GetPlanOptions) => {
          let buildPlanServiceNodeMock: Mock<() => PlanServiceNode>;
          let childPlanServiceNodeFixture: PlanServiceNode;
          let planServiceNodeFixture: PlanServiceNode;
          let childLazyPlanServiceNodeFixture: LazyPlanServiceNode;
          let lazyPlanServiceNode: LazyPlanServiceNode;
          let optionsFixture: GetPlanOptions;
          let planResultCacheServiceInvalidationFixture: CacheBindingInvalidation;

          let childPlanResultFixture: PlanResult;
          let planResultFixture: PlanResult;

          beforeAll(() => {
            buildPlanServiceNodeMock = vitest.fn();
            childPlanServiceNodeFixture = {
              bindings: [],
              isContextFree: true,
              serviceIdentifier: 'child-service-id',
            };
            childLazyPlanServiceNodeFixture = new LazyPlanServiceNodeMock(
              childPlanServiceNodeFixture,
              buildPlanServiceNodeMock,
            );
            planServiceNodeFixture = {
              bindings: {
                binding: {
                  cache: {
                    isRight: false,
                    value: undefined,
                  },
                  factory: () => undefined,
                  id: 1,
                  isSatisfiedBy: () => true,
                  metadata: {
                    arguments: [
                      {
                        kind: ResolvedValueElementMetadataKind.singleInjection,
                        name: undefined,
                        optional: false,
                        tags: new Map(),
                        value: childPlanServiceNodeFixture.serviceIdentifier,
                      },
                    ],
                  },
                  moduleId: undefined,
                  onActivation: undefined,
                  onDeactivation: undefined,
                  scope: bindingScopeValues.Singleton,
                  serviceIdentifier:
                    childPlanServiceNodeFixture.serviceIdentifier,
                  type: bindingTypeValues.ResolvedValue,
                },
                params: [childLazyPlanServiceNodeFixture],
              },
              isContextFree: true,
              serviceIdentifier: 'service-id',
            };

            lazyPlanServiceNode = new LazyPlanServiceNodeMock(
              planServiceNodeFixture,
              buildPlanServiceNodeMock,
            );

            childPlanResultFixture = {
              tree: {
                root: childLazyPlanServiceNodeFixture,
              },
            };

            planResultFixture = {
              tree: {
                root: lazyPlanServiceNode,
              },
            };

            optionsFixture = getOptions(planResultFixture);

            planResultCacheServiceInvalidationFixture = {
              binding: {
                serviceIdentifier: planServiceNodeFixture.serviceIdentifier,
              } as unknown as Binding<unknown>,
              kind: CacheBindingInvalidationKind.bindingAdded,
              operations: Symbol() as unknown as PlanParamsOperations,
            };
          });

          describe('when called .set(), and called .invalidateService() and addRootServiceNodeBindingIfContextFree() returns result with shouldInvalidateServiceNode', () => {
            let expectedPlanParamsFixture: PlanParams;
            let planResultCacheService: PlanResultCacheService;
            let planServiceNodeBindingAddedResultFixture: PlanServiceNodeBindingAddedResult;

            let childServicePlanResult: PlanResult | undefined;
            let servicePlanResult: PlanResult | undefined;

            beforeAll(() => {
              expectedPlanParamsFixture = buildExpectedPlanParamsFixture(
                optionsFixture,
                planResultCacheServiceInvalidationFixture,
              );

              planResultCacheService = new PlanResultCacheService();
              planResultCacheService.set(
                {
                  ...optionsFixture,
                  serviceIdentifier:
                    childPlanServiceNodeFixture.serviceIdentifier,
                },
                childPlanResultFixture,
              );
              planResultCacheService.set(optionsFixture, planResultFixture);

              planServiceNodeBindingAddedResultFixture = {
                isContextFreeBinding: true,
                shouldInvalidateServiceNode: true,
              };

              vitest
                .mocked(addRootServiceNodeBindingIfContextFree)
                .mockReturnValueOnce(planServiceNodeBindingAddedResultFixture);

              planResultCacheService.invalidateServiceBinding(
                planResultCacheServiceInvalidationFixture,
              );

              childServicePlanResult = planResultCacheService.get({
                ...optionsFixture,
                serviceIdentifier:
                  childPlanServiceNodeFixture.serviceIdentifier,
              });
              servicePlanResult = planResultCacheService.get(optionsFixture);
            });

            afterAll(() => {
              vitest.clearAllMocks();
            });

            it('should call addRootServiceNodeBindingIfContextFree()', () => {
              expect(
                addRootServiceNodeBindingIfContextFree,
              ).toHaveBeenCalledExactlyOnceWith(
                expectedPlanParamsFixture,
                planResultFixture.tree.root,
                planResultCacheServiceInvalidationFixture.binding,
              );
            });

            it('should keep an invalidated PlanResult for the service', () => {
              expect(servicePlanResult).toBeDefined();
              expect(
                (servicePlanResult?.tree.root as LazyPlanServiceNodeMock)
                  .internalServiceNode,
              ).toBeUndefined();
            });

            it('should not invalidate the child PlanServiceNode', () => {
              expect(childServicePlanResult).toBeDefined();
              expect(
                (childServicePlanResult?.tree.root as LazyPlanServiceNodeMock)
                  .internalServiceNode,
              ).toBeDefined();
            });
          });
        },
      );
    });

    describe('having a plan result for a service identifier with a lazy plan service node with a context free child array', () => {
      describe.each<[string, (planResult: PlanResult) => GetPlanOptions]>([
        [
          '',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: undefined,
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: undefined,
          }),
        ],
        [
          ' with name',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: 'name fixture',
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: undefined,
          }),
        ],
        [
          ' with name and tag',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: 'name fixture',
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: {
              key: 'key fixture',
              value: 'value fixture',
            },
          }),
        ],
        [
          ' with tag',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: undefined,
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: {
              key: 'key fixture',
              value: 'value fixture',
            },
          }),
        ],
      ])(
        'having GetPlanOptions%s and PlanResultCacheServiceInvalidation with binding added kind',
        (_: string, getOptions: (planResult: PlanResult) => GetPlanOptions) => {
          let buildPlanServiceNodeMock: Mock<() => PlanServiceNode>;
          let childPlanServiceNodeFixture: PlanServiceNode;
          let planServiceNodeFixture: PlanServiceNode;
          let childLazyPlanServiceNodeFixture: LazyPlanServiceNode;
          let lazyPlanServiceNode: LazyPlanServiceNode;
          let optionsFixture: GetPlanOptions;

          let childPlanResultFixture: PlanResult;
          let planResultFixture: PlanResult;
          let planResultCacheServiceInvalidationFixture: CacheBindingInvalidation;

          beforeAll(() => {
            buildPlanServiceNodeMock = vitest.fn();
            childPlanServiceNodeFixture = {
              bindings: [],
              isContextFree: true,
              serviceIdentifier: 'child-service-id',
            };
            childLazyPlanServiceNodeFixture = new LazyPlanServiceNodeMock(
              childPlanServiceNodeFixture,
              buildPlanServiceNodeMock,
            );
            planServiceNodeFixture = {
              bindings: [
                {
                  binding: {
                    cache: {
                      isRight: false,
                      value: undefined,
                    },
                    factory: () => undefined,
                    id: 1,
                    isSatisfiedBy: () => true,
                    metadata: {
                      arguments: [
                        {
                          kind: ResolvedValueElementMetadataKind.singleInjection,
                          name: undefined,
                          optional: false,
                          tags: new Map(),
                          value: childPlanServiceNodeFixture.serviceIdentifier,
                        },
                      ],
                    },
                    moduleId: undefined,
                    onActivation: undefined,
                    onDeactivation: undefined,
                    scope: bindingScopeValues.Singleton,
                    serviceIdentifier:
                      childPlanServiceNodeFixture.serviceIdentifier,
                    type: bindingTypeValues.ResolvedValue,
                  },
                  params: [childLazyPlanServiceNodeFixture],
                },
              ],
              isContextFree: true,
              serviceIdentifier: 'service-id',
            };

            lazyPlanServiceNode = new LazyPlanServiceNodeMock(
              planServiceNodeFixture,
              buildPlanServiceNodeMock,
            );

            childPlanResultFixture = {
              tree: {
                root: childLazyPlanServiceNodeFixture,
              },
            };

            planResultFixture = {
              tree: {
                root: lazyPlanServiceNode,
              },
            };

            optionsFixture = getOptions(planResultFixture);

            planResultCacheServiceInvalidationFixture = {
              binding: {
                serviceIdentifier: planServiceNodeFixture.serviceIdentifier,
              } as unknown as Binding<unknown>,
              kind: CacheBindingInvalidationKind.bindingAdded,
              operations: Symbol() as unknown as PlanParamsOperations,
            };
          });

          describe('when called .set(), and called .invalidateService() and addRootServiceNodeBindingIfContextFree() returns result with shouldInvalidateServiceNode', () => {
            let expectedPlanParamsFixture: PlanParams;
            let planResultCacheService: PlanResultCacheService;
            let planServiceNodeBindingAddedResultFixture: PlanServiceNodeBindingAddedResult;

            let childServicePlanResult: PlanResult | undefined;
            let servicePlanResult: PlanResult | undefined;

            beforeAll(() => {
              expectedPlanParamsFixture = buildExpectedPlanParamsFixture(
                optionsFixture,
                planResultCacheServiceInvalidationFixture,
              );

              planResultCacheService = new PlanResultCacheService();
              planResultCacheService.set(
                {
                  ...optionsFixture,
                  serviceIdentifier:
                    childPlanServiceNodeFixture.serviceIdentifier,
                },
                childPlanResultFixture,
              );
              planResultCacheService.set(optionsFixture, planResultFixture);

              planServiceNodeBindingAddedResultFixture = {
                isContextFreeBinding: true,
                shouldInvalidateServiceNode: true,
              };

              vitest
                .mocked(addRootServiceNodeBindingIfContextFree)
                .mockReturnValueOnce(planServiceNodeBindingAddedResultFixture);

              planResultCacheService.invalidateServiceBinding(
                planResultCacheServiceInvalidationFixture,
              );

              childServicePlanResult = planResultCacheService.get({
                ...optionsFixture,
                serviceIdentifier:
                  childPlanServiceNodeFixture.serviceIdentifier,
              });
              servicePlanResult = planResultCacheService.get(optionsFixture);
            });

            afterAll(() => {
              vitest.clearAllMocks();
            });

            it('should call addRootServiceNodeBindingIfContextFree()', () => {
              expect(
                addRootServiceNodeBindingIfContextFree,
              ).toHaveBeenCalledExactlyOnceWith(
                expectedPlanParamsFixture,
                planResultFixture.tree.root,
                planResultCacheServiceInvalidationFixture.binding,
              );
            });

            it('should keep an invalidated PlanResult for the service', () => {
              expect(servicePlanResult).toBeDefined();
              expect(
                (servicePlanResult?.tree.root as LazyPlanServiceNodeMock)
                  .internalServiceNode,
              ).toBeUndefined();
            });

            it('should not invalidate the child PlanServiceNode', () => {
              expect(childServicePlanResult).toBeDefined();
              expect(
                (childServicePlanResult?.tree.root as LazyPlanServiceNodeMock)
                  .internalServiceNode,
              ).toBeDefined();
            });
          });
        },
      );
    });

    describe('having a plan result for a service identifier with a redirection to a lazy plan service node with a context free child', () => {
      describe.each<[string, (planResult: PlanResult) => GetPlanOptions]>([
        [
          '',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: undefined,
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: undefined,
          }),
        ],
        [
          ' with name',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: 'name fixture',
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: undefined,
          }),
        ],
        [
          ' with name and tag',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: 'name fixture',
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: {
              key: 'key fixture',
              value: 'value fixture',
            },
          }),
        ],
        [
          ' with tag',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: undefined,
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: {
              key: 'key fixture',
              value: 'value fixture',
            },
          }),
        ],
      ])(
        'having GetPlanOptions%s and PlanResultCacheServiceInvalidation with binding added kind',
        (_: string, getOptions: (planResult: PlanResult) => GetPlanOptions) => {
          let buildPlanServiceNodeMock: Mock<() => PlanServiceNode>;
          let childPlanServiceNodeFixture: PlanServiceNode;
          let planServiceNodeFixture: PlanServiceNode;
          let childLazyPlanServiceNodeFixture: LazyPlanServiceNode;
          let lazyPlanServiceNode: LazyPlanServiceNode;
          let optionsFixture: GetPlanOptions;
          let planResultCacheServiceInvalidationFixture: CacheBindingInvalidation;

          let childPlanResultFixture: PlanResult;
          let planResultFixture: PlanResult;

          beforeAll(() => {
            buildPlanServiceNodeMock = vitest.fn();
            childPlanServiceNodeFixture = {
              bindings: [],
              isContextFree: true,
              serviceIdentifier: 'child-service-id',
            };
            childLazyPlanServiceNodeFixture = new LazyPlanServiceNodeMock(
              childPlanServiceNodeFixture,
              buildPlanServiceNodeMock,
            );
            planServiceNodeFixture = {
              bindings: {
                binding: {
                  id: 1,
                  isSatisfiedBy: () => true,
                  moduleId: undefined,
                  serviceIdentifier: 'redirection-service-id',
                  targetServiceIdentifier:
                    childPlanServiceNodeFixture.serviceIdentifier,
                  type: bindingTypeValues.ServiceRedirection,
                },
                redirections: [
                  {
                    binding: {
                      cache: {
                        isRight: false,
                        value: undefined,
                      },
                      factory: () => undefined,
                      id: 1,
                      isSatisfiedBy: () => true,
                      metadata: {
                        arguments: [
                          {
                            kind: ResolvedValueElementMetadataKind.singleInjection,
                            name: undefined,
                            optional: false,
                            tags: new Map(),
                            value:
                              childPlanServiceNodeFixture.serviceIdentifier,
                          },
                        ],
                      },
                      moduleId: undefined,
                      onActivation: undefined,
                      onDeactivation: undefined,
                      scope: bindingScopeValues.Singleton,
                      serviceIdentifier:
                        childPlanServiceNodeFixture.serviceIdentifier,
                      type: bindingTypeValues.ResolvedValue,
                    },
                    params: [childLazyPlanServiceNodeFixture],
                  },
                ],
              },
              isContextFree: true,
              serviceIdentifier: 'service-id',
            };

            lazyPlanServiceNode = new LazyPlanServiceNodeMock(
              planServiceNodeFixture,
              buildPlanServiceNodeMock,
            );

            childPlanResultFixture = {
              tree: {
                root: childLazyPlanServiceNodeFixture,
              },
            };

            planResultFixture = {
              tree: {
                root: lazyPlanServiceNode,
              },
            };

            optionsFixture = getOptions(planResultFixture);

            planResultCacheServiceInvalidationFixture = {
              binding: {
                serviceIdentifier: planServiceNodeFixture.serviceIdentifier,
              } as unknown as Binding<unknown>,
              kind: CacheBindingInvalidationKind.bindingAdded,
              operations: Symbol() as unknown as PlanParamsOperations,
            };
          });

          describe('when called .set(), and called .invalidateService() and addRootServiceNodeBindingIfContextFree() returns result with shouldInvalidateServiceNode', () => {
            let expectedPlanParamsFixture: PlanParams;
            let planResultCacheService: PlanResultCacheService;
            let planServiceNodeBindingAddedResultFixture: PlanServiceNodeBindingAddedResult;

            let childServicePlanResult: PlanResult | undefined;
            let servicePlanResult: PlanResult | undefined;

            beforeAll(() => {
              expectedPlanParamsFixture = buildExpectedPlanParamsFixture(
                optionsFixture,
                planResultCacheServiceInvalidationFixture,
              );

              planResultCacheService = new PlanResultCacheService();
              planResultCacheService.set(
                {
                  ...optionsFixture,
                  serviceIdentifier:
                    childPlanServiceNodeFixture.serviceIdentifier,
                },
                childPlanResultFixture,
              );
              planResultCacheService.set(optionsFixture, planResultFixture);

              planServiceNodeBindingAddedResultFixture = {
                isContextFreeBinding: true,
                shouldInvalidateServiceNode: true,
              };

              vitest
                .mocked(addRootServiceNodeBindingIfContextFree)
                .mockReturnValueOnce(planServiceNodeBindingAddedResultFixture);

              planResultCacheService.invalidateServiceBinding(
                planResultCacheServiceInvalidationFixture,
              );

              childServicePlanResult = planResultCacheService.get({
                ...optionsFixture,
                serviceIdentifier:
                  childPlanServiceNodeFixture.serviceIdentifier,
              });
              servicePlanResult = planResultCacheService.get(optionsFixture);
            });

            afterAll(() => {
              vitest.clearAllMocks();
            });

            it('should call addRootServiceNodeBindingIfContextFree()', () => {
              expect(
                addRootServiceNodeBindingIfContextFree,
              ).toHaveBeenCalledExactlyOnceWith(
                expectedPlanParamsFixture,
                planResultFixture.tree.root,
                planResultCacheServiceInvalidationFixture.binding,
              );
            });

            it('should keep an invalidated PlanResult for the service', () => {
              expect(servicePlanResult).toBeDefined();
              expect(
                (servicePlanResult?.tree.root as LazyPlanServiceNodeMock)
                  .internalServiceNode,
              ).toBeUndefined();
            });

            it('should not invalidate the child PlanServiceNode', () => {
              expect(childServicePlanResult).toBeDefined();
              expect(
                (childServicePlanResult?.tree.root as LazyPlanServiceNodeMock)
                  .internalServiceNode,
              ).toBeDefined();
            });
          });
        },
      );
    });

    describe('having a plan result for a service identifier with a lazy plan service node with a non cacheable resolved value child', () => {
      describe.each<[string, (planResult: PlanResult) => GetPlanOptions]>([
        [
          '',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: undefined,
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: undefined,
          }),
        ],
        [
          ' with name',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: 'name fixture',
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: undefined,
          }),
        ],
        [
          ' with name and tag',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: 'name fixture',
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: {
              key: 'key fixture',
              value: 'value fixture',
            },
          }),
        ],
        [
          ' with tag',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: undefined,
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: {
              key: 'key fixture',
              value: 'value fixture',
            },
          }),
        ],
      ])(
        'having GetPlanOptions%s and PlanResultCacheServiceInvalidation with binding added kind',
        (_: string, getOptions: (planResult: PlanResult) => GetPlanOptions) => {
          let buildPlanServiceNodeMock: Mock<() => PlanServiceNode>;
          let childPlanServiceNodeFixture: PlanServiceNode;
          let planServiceNodeFixture: PlanServiceNode;
          let childLazyPlanServiceNodeFixture: LazyPlanServiceNode;
          let lazyPlanServiceNode: LazyPlanServiceNode;
          let planResultCacheServiceInvalidationFixture: CacheBindingInvalidation;
          let childPlanResultCacheServiceInvalidationFixture: CacheBindingInvalidation;

          let planResultFixture: PlanResult;
          let optionsFixture: GetPlanOptions;

          beforeAll(() => {
            buildPlanServiceNodeMock = vitest.fn();
            childPlanServiceNodeFixture = {
              bindings: [],
              isContextFree: false,
              serviceIdentifier: 'child-service-id',
            };
            childLazyPlanServiceNodeFixture = new LazyPlanServiceNodeMock(
              childPlanServiceNodeFixture,
              buildPlanServiceNodeMock,
            );
            planServiceNodeFixture = {
              bindings: [
                {
                  binding: {
                    cache: {
                      isRight: false,
                      value: undefined,
                    },
                    factory: () => undefined,
                    id: 1,
                    isSatisfiedBy: () => true,
                    metadata: {
                      arguments: [
                        {
                          kind: ResolvedValueElementMetadataKind.singleInjection,
                          name: undefined,
                          optional: false,
                          tags: new Map(),
                          value: childPlanServiceNodeFixture.serviceIdentifier,
                        },
                      ],
                    },
                    moduleId: undefined,
                    onActivation: undefined,
                    onDeactivation: undefined,
                    scope: bindingScopeValues.Singleton,
                    serviceIdentifier:
                      childPlanServiceNodeFixture.serviceIdentifier,
                    type: bindingTypeValues.ResolvedValue,
                  },
                  params: [childLazyPlanServiceNodeFixture],
                },
              ],
              isContextFree: true,
              serviceIdentifier: 'service-id',
            };

            lazyPlanServiceNode = new LazyPlanServiceNodeMock(
              planServiceNodeFixture,
              buildPlanServiceNodeMock,
            );

            planResultFixture = {
              tree: {
                root: lazyPlanServiceNode,
              },
            };
            optionsFixture = getOptions(planResultFixture);

            planResultCacheServiceInvalidationFixture = {
              binding: {
                serviceIdentifier: planServiceNodeFixture.serviceIdentifier,
              } as unknown as Binding<unknown>,
              kind: CacheBindingInvalidationKind.bindingAdded,
              operations: Symbol() as unknown as PlanParamsOperations,
            };
            childPlanResultCacheServiceInvalidationFixture = {
              binding: {
                serviceIdentifier:
                  childPlanServiceNodeFixture.serviceIdentifier,
              } as unknown as Binding<unknown>,
              kind: CacheBindingInvalidationKind.bindingAdded,
              operations: Symbol() as unknown as PlanParamsOperations,
            };
          });

          describe('when called .set(), and called .invalidateService() and addRootServiceNodeBindingIfContextFree() returns result with shouldInvalidateServiceNode', () => {
            let expectedPlanParamsFixture: PlanParams;
            let planResultCacheService: PlanResultCacheService;
            let planServiceNodeBindingAddedResultFixture: PlanServiceNodeBindingAddedResult;

            let servicePlanResult: PlanResult | undefined;

            beforeAll(() => {
              expectedPlanParamsFixture = buildExpectedPlanParamsFixture(
                optionsFixture,
                planResultCacheServiceInvalidationFixture,
              );

              planResultCacheService = new PlanResultCacheService();
              planResultCacheService.setNonCachedServiceNode(
                childLazyPlanServiceNodeFixture,
                {
                  bindingConstraintsList:
                    Symbol() as unknown as SingleImmutableLinkedList<InternalBindingConstraints>,
                  chainedBindings: false,
                  optionalBindings: false,
                },
              );
              planResultCacheService.set(optionsFixture, planResultFixture);

              planServiceNodeBindingAddedResultFixture = {
                isContextFreeBinding: true,
                shouldInvalidateServiceNode: true,
              };

              vitest
                .mocked(addRootServiceNodeBindingIfContextFree)
                .mockReturnValueOnce(planServiceNodeBindingAddedResultFixture);

              planResultCacheService.invalidateServiceBinding(
                planResultCacheServiceInvalidationFixture,
              );

              servicePlanResult = planResultCacheService.get(optionsFixture);

              planResultCacheService.invalidateServiceBinding(
                childPlanResultCacheServiceInvalidationFixture,
              );
            });

            afterAll(() => {
              vitest.clearAllMocks();
            });

            it('should call addRootServiceNodeBindingIfContextFree()', () => {
              expect(
                addRootServiceNodeBindingIfContextFree,
              ).toHaveBeenCalledExactlyOnceWith(
                expectedPlanParamsFixture,
                planResultFixture.tree.root,
                planResultCacheServiceInvalidationFixture.binding,
              );
            });

            it('should keep an invalidated PlanResult for the service', () => {
              expect(servicePlanResult).toBeDefined();
              expect(
                (servicePlanResult?.tree.root as LazyPlanServiceNodeMock)
                  .internalServiceNode,
              ).toBeUndefined();
            });

            it('should not invalidate the child PlanServiceNode', () => {
              expect(
                (childLazyPlanServiceNodeFixture as LazyPlanServiceNodeMock)
                  .internalServiceNode,
              ).toBeDefined();
            });
          });
        },
      );
    });

    describe('having a plan result for a service identifier with a lazy plan service node with a non cacheable instance constructor param child', () => {
      describe.each<[string, (planResult: PlanResult) => GetPlanOptions]>([
        [
          '',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: undefined,
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: undefined,
          }),
        ],
        [
          ' with name',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: 'name fixture',
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: undefined,
          }),
        ],
        [
          ' with name and tag',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: 'name fixture',
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: {
              key: 'key fixture',
              value: 'value fixture',
            },
          }),
        ],
        [
          ' with tag',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: undefined,
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: {
              key: 'key fixture',
              value: 'value fixture',
            },
          }),
        ],
      ])(
        'having GetPlanOptions%s and PlanResultCacheServiceInvalidation with binding added kind',
        (_: string, getOptions: (planResult: PlanResult) => GetPlanOptions) => {
          let buildPlanServiceNodeMock: Mock<() => PlanServiceNode>;
          let childPlanServiceNodeFixture: PlanServiceNode;
          let planServiceNodeFixture: PlanServiceNode;
          let childLazyPlanServiceNodeFixture: LazyPlanServiceNode;
          let lazyPlanServiceNode: LazyPlanServiceNode;
          let planResultCacheServiceInvalidationFixture: CacheBindingInvalidation;
          let childPlanResultCacheServiceInvalidationFixture: CacheBindingInvalidation;

          let planResultFixture: PlanResult;
          let optionsFixture: GetPlanOptions;

          beforeAll(() => {
            buildPlanServiceNodeMock = vitest.fn();
            childPlanServiceNodeFixture = {
              bindings: [],
              isContextFree: false,
              serviceIdentifier: 'child-service-id',
            };
            childLazyPlanServiceNodeFixture = new LazyPlanServiceNodeMock(
              childPlanServiceNodeFixture,
              buildPlanServiceNodeMock,
            );
            planServiceNodeFixture = {
              bindings: [
                {
                  binding: {
                    cache: {
                      isRight: false,
                      value: undefined,
                    },
                    id: 1,
                    implementationType: class {},
                    isSatisfiedBy: () => true,
                    moduleId: undefined,
                    onActivation: undefined,
                    onDeactivation: undefined,
                    scope: bindingScopeValues.Singleton,
                    serviceIdentifier:
                      childPlanServiceNodeFixture.serviceIdentifier,
                    type: bindingTypeValues.Instance,
                  },
                  classMetadata: {
                    constructorArguments: [
                      {
                        kind: ClassElementMetadataKind.singleInjection,
                        name: undefined,
                        optional: false,
                        tags: new Map(),
                        value: childPlanServiceNodeFixture.serviceIdentifier,
                      },
                    ],
                    lifecycle: {
                      postConstructMethodNames: new Set(),
                      preDestroyMethodNames: new Set(),
                    },
                    properties: new Map(),
                    scope: bindingScopeValues.Singleton,
                  },
                  constructorParams: [childLazyPlanServiceNodeFixture],
                  propertyParams: new Map(),
                },
              ],
              isContextFree: true,
              serviceIdentifier: 'service-id',
            };

            lazyPlanServiceNode = new LazyPlanServiceNodeMock(
              planServiceNodeFixture,
              buildPlanServiceNodeMock,
            );

            planResultFixture = {
              tree: {
                root: lazyPlanServiceNode,
              },
            };
            optionsFixture = getOptions(planResultFixture);

            planResultCacheServiceInvalidationFixture = {
              binding: {
                serviceIdentifier: planServiceNodeFixture.serviceIdentifier,
              } as unknown as Binding<unknown>,
              kind: CacheBindingInvalidationKind.bindingAdded,
              operations: Symbol() as unknown as PlanParamsOperations,
            };
            childPlanResultCacheServiceInvalidationFixture = {
              binding: {
                serviceIdentifier:
                  childPlanServiceNodeFixture.serviceIdentifier,
              } as unknown as Binding<unknown>,
              kind: CacheBindingInvalidationKind.bindingAdded,
              operations: Symbol() as unknown as PlanParamsOperations,
            };
          });

          describe('when called .set(), and called .invalidateService() and addRootServiceNodeBindingIfContextFree() returns result with shouldInvalidateServiceNode', () => {
            let expectedPlanParamsFixture: PlanParams;
            let planResultCacheService: PlanResultCacheService;
            let planServiceNodeBindingAddedResultFixture: PlanServiceNodeBindingAddedResult;

            let servicePlanResult: PlanResult | undefined;

            beforeAll(() => {
              expectedPlanParamsFixture = buildExpectedPlanParamsFixture(
                optionsFixture,
                planResultCacheServiceInvalidationFixture,
              );

              planResultCacheService = new PlanResultCacheService();
              planResultCacheService.setNonCachedServiceNode(
                childLazyPlanServiceNodeFixture,
                {
                  bindingConstraintsList:
                    Symbol() as unknown as SingleImmutableLinkedList<InternalBindingConstraints>,
                  chainedBindings: false,
                  optionalBindings: false,
                },
              );
              planResultCacheService.set(optionsFixture, planResultFixture);

              planServiceNodeBindingAddedResultFixture = {
                isContextFreeBinding: true,
                shouldInvalidateServiceNode: true,
              };

              vitest
                .mocked(addRootServiceNodeBindingIfContextFree)
                .mockReturnValueOnce(planServiceNodeBindingAddedResultFixture);

              planResultCacheService.invalidateServiceBinding(
                planResultCacheServiceInvalidationFixture,
              );

              servicePlanResult = planResultCacheService.get(optionsFixture);

              planResultCacheService.invalidateServiceBinding(
                childPlanResultCacheServiceInvalidationFixture,
              );
            });

            afterAll(() => {
              vitest.clearAllMocks();
            });

            it('should call addRootServiceNodeBindingIfContextFree()', () => {
              expect(
                addRootServiceNodeBindingIfContextFree,
              ).toHaveBeenCalledExactlyOnceWith(
                expectedPlanParamsFixture,
                planResultFixture.tree.root,
                planResultCacheServiceInvalidationFixture.binding,
              );
            });

            it('should keep an invalidated PlanResult for the service', () => {
              expect(servicePlanResult).toBeDefined();
              expect(
                (servicePlanResult?.tree.root as LazyPlanServiceNodeMock)
                  .internalServiceNode,
              ).toBeUndefined();
            });

            it('should not invalidate the child PlanServiceNode', () => {
              expect(
                (childLazyPlanServiceNodeFixture as LazyPlanServiceNodeMock)
                  .internalServiceNode,
              ).toBeDefined();
            });
          });
        },
      );
    });

    describe('having a plan result for a service identifier with a lazy plan service node with a non cacheable instance property param child', () => {
      describe.each<[string, (planResult: PlanResult) => GetPlanOptions]>([
        [
          '',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: undefined,
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: undefined,
          }),
        ],
        [
          ' with name',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: 'name fixture',
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: undefined,
          }),
        ],
        [
          ' with name and tag',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: 'name fixture',
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: {
              key: 'key fixture',
              value: 'value fixture',
            },
          }),
        ],
        [
          ' with tag',
          (planResult: PlanResult): GetPlanOptions => ({
            isMultiple: false,
            name: undefined,
            optional: false,
            serviceIdentifier: planResult.tree.root.serviceIdentifier,
            tag: {
              key: 'key fixture',
              value: 'value fixture',
            },
          }),
        ],
      ])(
        'having GetPlanOptions%s and PlanResultCacheServiceInvalidation with binding added kind',
        (_: string, getOptions: (planResult: PlanResult) => GetPlanOptions) => {
          let buildPlanServiceNodeMock: Mock<() => PlanServiceNode>;
          let childPlanServiceNodeFixture: PlanServiceNode;
          let planServiceNodeFixture: PlanServiceNode;
          let childLazyPlanServiceNodeFixture: LazyPlanServiceNode;
          let lazyPlanServiceNode: LazyPlanServiceNode;
          let planResultCacheServiceInvalidationFixture: CacheBindingInvalidation;
          let childPlanResultCacheServiceInvalidationFixture: CacheBindingInvalidation;

          let planResultFixture: PlanResult;
          let optionsFixture: GetPlanOptions;

          beforeAll(() => {
            buildPlanServiceNodeMock = vitest.fn();
            childPlanServiceNodeFixture = {
              bindings: [],
              isContextFree: false,
              serviceIdentifier: 'child-service-id',
            };
            childLazyPlanServiceNodeFixture = new LazyPlanServiceNodeMock(
              childPlanServiceNodeFixture,
              buildPlanServiceNodeMock,
            );
            planServiceNodeFixture = {
              bindings: [
                {
                  binding: {
                    cache: {
                      isRight: false,
                      value: undefined,
                    },
                    id: 1,
                    implementationType: class {},
                    isSatisfiedBy: () => true,
                    moduleId: undefined,
                    onActivation: undefined,
                    onDeactivation: undefined,
                    scope: bindingScopeValues.Singleton,
                    serviceIdentifier:
                      childPlanServiceNodeFixture.serviceIdentifier,
                    type: bindingTypeValues.Instance,
                  },
                  classMetadata: {
                    constructorArguments: [],
                    lifecycle: {
                      postConstructMethodNames: new Set(),
                      preDestroyMethodNames: new Set(),
                    },
                    properties: new Map([
                      [
                        'foo',
                        {
                          kind: ClassElementMetadataKind.singleInjection,
                          name: undefined,
                          optional: false,
                          tags: new Map(),
                          value: childPlanServiceNodeFixture.serviceIdentifier,
                        },
                      ],
                    ]),
                    scope: bindingScopeValues.Singleton,
                  },
                  constructorParams: [],
                  propertyParams: new Map([
                    ['foo', childLazyPlanServiceNodeFixture],
                  ]),
                },
              ],
              isContextFree: true,
              serviceIdentifier: 'service-id',
            };

            lazyPlanServiceNode = new LazyPlanServiceNodeMock(
              planServiceNodeFixture,
              buildPlanServiceNodeMock,
            );

            planResultFixture = {
              tree: {
                root: lazyPlanServiceNode,
              },
            };
            optionsFixture = getOptions(planResultFixture);

            planResultCacheServiceInvalidationFixture = {
              binding: {
                serviceIdentifier: planServiceNodeFixture.serviceIdentifier,
              } as unknown as Binding<unknown>,
              kind: CacheBindingInvalidationKind.bindingAdded,
              operations: Symbol() as unknown as PlanParamsOperations,
            };
            childPlanResultCacheServiceInvalidationFixture = {
              binding: {
                serviceIdentifier:
                  childPlanServiceNodeFixture.serviceIdentifier,
              } as unknown as Binding<unknown>,
              kind: CacheBindingInvalidationKind.bindingAdded,
              operations: Symbol() as unknown as PlanParamsOperations,
            };
          });

          describe('when called .set(), and called .invalidateService() and addRootServiceNodeBindingIfContextFree() returns result with shouldInvalidateServiceNode', () => {
            let expectedPlanParamsFixture: PlanParams;
            let planResultCacheService: PlanResultCacheService;
            let planServiceNodeBindingAddedResultFixture: PlanServiceNodeBindingAddedResult;

            let servicePlanResult: PlanResult | undefined;

            beforeAll(() => {
              expectedPlanParamsFixture = buildExpectedPlanParamsFixture(
                optionsFixture,
                planResultCacheServiceInvalidationFixture,
              );

              planResultCacheService = new PlanResultCacheService();
              planResultCacheService.setNonCachedServiceNode(
                childLazyPlanServiceNodeFixture,
                {
                  bindingConstraintsList:
                    Symbol() as unknown as SingleImmutableLinkedList<InternalBindingConstraints>,
                  chainedBindings: false,
                  optionalBindings: false,
                },
              );
              planResultCacheService.set(optionsFixture, planResultFixture);

              planServiceNodeBindingAddedResultFixture = {
                isContextFreeBinding: true,
                shouldInvalidateServiceNode: true,
              };

              vitest
                .mocked(addRootServiceNodeBindingIfContextFree)
                .mockReturnValueOnce(planServiceNodeBindingAddedResultFixture);

              planResultCacheService.invalidateServiceBinding(
                planResultCacheServiceInvalidationFixture,
              );
              servicePlanResult = planResultCacheService.get(optionsFixture);

              planResultCacheService.invalidateServiceBinding(
                childPlanResultCacheServiceInvalidationFixture,
              );
            });

            afterAll(() => {
              vitest.clearAllMocks();
            });

            it('should call addRootServiceNodeBindingIfContextFree()', () => {
              expect(
                addRootServiceNodeBindingIfContextFree,
              ).toHaveBeenCalledExactlyOnceWith(
                expectedPlanParamsFixture,
                planResultFixture.tree.root,
                planResultCacheServiceInvalidationFixture.binding,
              );
            });

            it('should keep an invalidated PlanResult for the service', () => {
              expect(servicePlanResult).toBeDefined();
              expect(
                (servicePlanResult?.tree.root as LazyPlanServiceNodeMock)
                  .internalServiceNode,
              ).toBeUndefined();
            });

            it('should not invalidate the child PlanServiceNode', () => {
              expect(
                (childLazyPlanServiceNodeFixture as LazyPlanServiceNodeMock)
                  .internalServiceNode,
              ).toBeDefined();
            });
          });
        },
      );
    });

    describe('having a non cached lazy service node and PlanResultCacheServiceInvalidation with binding added kind', () => {
      describe('when called .setNonCachedServiceNode(), and called .invalidateService() and addServiceNodeBindingIfContextFree() returns result with shouldInvalidateServiceNode', () => {
        let buildPlanServiceNodeMock: Mock<() => PlanServiceNode>;
        let planServiceNodeFixture: PlanServiceNode;
        let lazyPlanServiceNodeFixture: LazyPlanServiceNode;
        let planResultCacheServiceInvalidationFixture: CacheBindingInvalidation;
        let nonCachedServiceNodeContextFixture: NonCachedServiceNodeContext;
        let planServiceNodeBindingAddedResultFixture: PlanServiceNodeBindingAddedResult;

        let planResultCacheService: PlanResultCacheService;

        beforeAll(() => {
          buildPlanServiceNodeMock = vitest.fn();
          planServiceNodeFixture = {
            bindings: [],
            isContextFree: true,
            serviceIdentifier: 'service-id',
          };
          lazyPlanServiceNodeFixture = new LazyPlanServiceNodeMock(
            planServiceNodeFixture,
            buildPlanServiceNodeMock,
          );

          planResultCacheServiceInvalidationFixture = {
            binding: {
              serviceIdentifier: planServiceNodeFixture.serviceIdentifier,
            } as unknown as Binding<unknown>,
            kind: CacheBindingInvalidationKind.bindingAdded,
            operations: Symbol() as unknown as PlanParamsOperations,
          };

          nonCachedServiceNodeContextFixture = {
            bindingConstraintsList:
              Symbol() as unknown as SingleImmutableLinkedList<InternalBindingConstraints>,
            chainedBindings: false,
            optionalBindings: false,
          };

          planServiceNodeBindingAddedResultFixture = {
            isContextFreeBinding: true,
            shouldInvalidateServiceNode: true,
          };

          planResultCacheService = new PlanResultCacheService();
          planResultCacheService.setNonCachedServiceNode(
            lazyPlanServiceNodeFixture,
            nonCachedServiceNodeContextFixture,
          );

          vitest
            .mocked(addServiceNodeBindingIfContextFree)
            .mockReturnValueOnce(planServiceNodeBindingAddedResultFixture);

          planResultCacheService.invalidateServiceBinding(
            planResultCacheServiceInvalidationFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call addServiceNodeBindingIfContextFree()', () => {
          const expectedBasePlanParams: BasePlanParams = {
            autobindOptions: undefined,
            operations: planResultCacheServiceInvalidationFixture.operations,
            servicesBranch: [],
          };

          expect(
            addServiceNodeBindingIfContextFree,
          ).toHaveBeenCalledExactlyOnceWith(
            expectedBasePlanParams,
            lazyPlanServiceNodeFixture,
            planResultCacheServiceInvalidationFixture.binding,
            nonCachedServiceNodeContextFixture.bindingConstraintsList,
            nonCachedServiceNodeContextFixture.chainedBindings,
          );
        });

        it('should invalidate the non cached lazy plan service node', () => {
          expect(
            (lazyPlanServiceNodeFixture as LazyPlanServiceNodeMock)
              .internalServiceNode,
          ).toBeUndefined();
        });
      });

      describe('when called .setNonCachedServiceNode(), and called .invalidateService() in a parent service and addRootServiceNodeBindingIfContextFree() returns result with shouldInvalidateServiceNode', () => {
        let buildPlanServiceNodeMock: Mock<() => PlanServiceNode>;
        let planServiceNodeFixture: PlanServiceNode;
        let lazyPlanServiceNodeFixture: LazyPlanServiceNode;
        let planResultCacheServiceInvalidationFixture: CacheBindingInvalidation;
        let nonCachedServiceNodeContextFixture: NonCachedServiceNodeContext;
        let planServiceNodeBindingAddedResultFixture: PlanServiceNodeBindingAddedResult;

        let parentPlanResultCacheService: PlanResultCacheService;
        let planResultCacheService: PlanResultCacheService;

        beforeAll(() => {
          buildPlanServiceNodeMock = vitest.fn();
          planServiceNodeFixture = {
            bindings: [],
            isContextFree: true,
            serviceIdentifier: 'service-id',
          };
          lazyPlanServiceNodeFixture = new LazyPlanServiceNodeMock(
            planServiceNodeFixture,
            buildPlanServiceNodeMock,
          );

          planResultCacheServiceInvalidationFixture = {
            binding: {
              serviceIdentifier: planServiceNodeFixture.serviceIdentifier,
            } as unknown as Binding<unknown>,
            kind: CacheBindingInvalidationKind.bindingAdded,
            operations: Symbol() as unknown as PlanParamsOperations,
          };

          parentPlanResultCacheService = new PlanResultCacheService();
          planResultCacheService = new PlanResultCacheService();

          parentPlanResultCacheService.subscribe(planResultCacheService);

          planServiceNodeBindingAddedResultFixture = {
            isContextFreeBinding: true,
            shouldInvalidateServiceNode: true,
          };

          nonCachedServiceNodeContextFixture = {
            bindingConstraintsList:
              Symbol() as unknown as SingleImmutableLinkedList<InternalBindingConstraints>,
            chainedBindings: false,
            optionalBindings: false,
          };

          planResultCacheService = new PlanResultCacheService();
          planResultCacheService.setNonCachedServiceNode(
            lazyPlanServiceNodeFixture,
            nonCachedServiceNodeContextFixture,
          );

          vitest
            .mocked(addServiceNodeBindingIfContextFree)
            .mockReturnValueOnce(planServiceNodeBindingAddedResultFixture);

          planResultCacheService.invalidateServiceBinding(
            planResultCacheServiceInvalidationFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call addServiceNodeBindingIfContextFree()', () => {
          const expectedBasePlanParams: BasePlanParams = {
            autobindOptions: undefined,
            operations: planResultCacheServiceInvalidationFixture.operations,
            servicesBranch: [],
          };

          expect(
            addServiceNodeBindingIfContextFree,
          ).toHaveBeenCalledExactlyOnceWith(
            expectedBasePlanParams,
            lazyPlanServiceNodeFixture,
            planResultCacheServiceInvalidationFixture.binding,
            nonCachedServiceNodeContextFixture.bindingConstraintsList,
            nonCachedServiceNodeContextFixture.chainedBindings,
          );
        });

        it('should invalidate the non cached lazy plan service node', () => {
          expect(
            (lazyPlanServiceNodeFixture as LazyPlanServiceNodeMock)
              .internalServiceNode,
          ).toBeUndefined();
        });
      });
    });
  });

  describe('.set', () => {
    describe.each<[string, GetPlanOptions, GetPlanOptions[]]>(
      stringDescriptionAndPlanOptionsAndOtherPlanOptionsListTupleList,
    )(
      'having options with  %s',
      (_: string, options: GetPlanOptions, otherPlans: GetPlanOptions[]) => {
        describe('when called', () => {
          let planService: PlanResultCacheService;

          let planResultFixture: PlanResult;

          beforeAll(() => {
            planService = new PlanResultCacheService();

            planResultFixture = {} as PlanResult;
            planService.set(options, planResultFixture);
          });

          it('should store the plan result', () => {
            expect(planService.get(options)).toBe(planResultFixture);
          });

          it('should not store the plan result for other options', () => {
            for (const otherPlan of otherPlans) {
              expect(planService.get(otherPlan)).toBeUndefined();
            }
          });
        });
      },
    );
  });

  describe('.clearCache', () => {
    let options: GetPlanOptions;

    beforeAll(() => {
      options = {
        isMultiple: false,
        name: undefined,
        optional: false,
        serviceIdentifier: 'service-id',
        tag: undefined,
      };
    });

    describe('when called', () => {
      let planService: PlanResultCacheService;

      let planResult: PlanResult;

      beforeAll(() => {
        planService = new PlanResultCacheService();

        planResult = {} as PlanResult;
        planService.set(options, planResult);
        planService.clearCache();
      });

      it('should clear the cache', () => {
        expect(planService.get(options)).toBeUndefined();
      });
    });

    describe('when called with subscribers', () => {
      let planService: PlanResultCacheService;
      let subscriberMock: Mocked<PlanResultCacheService>;

      beforeAll(() => {
        planService = new PlanResultCacheService();
        subscriberMock = {
          clearCache: vitest.fn(),
          // ...other mocked methods...
        } as unknown as Mocked<PlanResultCacheService>;

        planService.subscribe(subscriberMock);
        planService.clearCache();
      });

      it('should call subscriber.clearCache()', () => {
        expect(subscriberMock.clearCache).toHaveBeenCalledExactlyOnceWith();
      });
    });
  });
});
