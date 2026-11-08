import { beforeAll, describe, expect, it } from 'vitest';

import { buildCallUrl, type CallDetail, readCall } from './callApi.js';
import {
  type InstancePlanBinding,
  type Plan,
  type PlanService,
} from './planDetail.js';

describe(buildCallUrl, () => {
  describe('having a call id', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = buildCallUrl('call/1');
      });

      it('should target that call', () => {
        expect(result).toBe('/.inversify/v1/calls/call%2F1');
      });
    });
  });
});

describe(readCall, () => {
  describe('having a completed call', () => {
    describe('when called', () => {
      let result: CallDetail;

      beforeAll(() => {
        result = readCall({
          controller: {
            controller: 'UserController',
            endedAt: '2026-10-19T20:00:00.016Z',
            error: {
              message: 'boom',
            },
            id: 'controller-1',
            method: 'create',
            startedAt: '2026-10-19T20:00:00.008Z',
          },
          guards: [
            {
              allowed: true,
              endedAt: '2026-10-19T20:00:00.006Z',
              error: null,
              guard: 'AuthGuard',
              id: 'guard-1',
              startedAt: '2026-10-19T20:00:00.004Z',
            },
          ],
          httpErrors: [],
          id: 'call-1',
          interceptors: [],
          middlewares: [
            {
              endedAt: '2026-10-19T20:00:00.004Z',
              error: null,
              id: 'middleware-2',
              middleware: 'LaterMiddleware',
              phase: 'postHandler',
              startedAt: '2026-10-19T20:00:00.003Z',
            },
            {
              endedAt: '2026-10-19T20:00:00.002Z',
              error: null,
              id: 'middleware-1',
              middleware: 'EarlierMiddleware',
              phase: 'preHandler',
              startedAt: '2026-10-19T20:00:00.001Z',
            },
          ],
          nativeMiddlewares: [],
          pipes: [],
          request: {
            headers: {
              accept: ['application/json', 'text/plain'],
              host: 'insights.local',
            },
            id: 'request-1',
            method: 'POST',
            startedAt: '2026-10-19T20:00:00.000Z',
            url: '/users',
          },
          response: {
            aborted: false,
            headers: {
              'content-type': 'application/json',
            },
            id: 'response-1',
            sentAt: '2026-10-19T20:00:00.018Z',
            statusCode: 201,
          },
        });
      });

      it('should map the call', () => {
        expect(result.controller).toMatchObject({
          error: '{\n  "message": "boom"\n}',
          method: 'create',
          name: 'UserController',
        });
        expect(
          result.middlewares.map(
            (middleware: { readonly name: string }): string => middleware.name,
          ),
        ).toStrictEqual(['EarlierMiddleware', 'LaterMiddleware']);
        expect(result.request.headers).toStrictEqual([
          {
            name: 'accept',
            value: 'application/json, text/plain',
          },
          {
            name: 'host',
            value: 'insights.local',
          },
        ]);
        expect(result.response.statusCode).toBe(201);
        expect(result.controller?.errorMessage).toBe('boom');
        expect(result.controller?.errorTraces).toBeNull();
        expect(result.controller?.plan).toBeNull();
        expect(result.guards[0]?.plan).toBeNull();
      });
    });
  });

  describe('having error traces', () => {
    describe('when called', () => {
      let result: CallDetail;

      beforeAll(() => {
        result = readCall({
          controller: null,
          guards: [
            {
              allowed: false,
              endedAt: '2026-10-19T20:00:00.006Z',
              error: {
                message: 'boom',
                name: 'TypeError',
              },
              errorTraces: [
                {
                  location: {
                    column: 5,
                    file: '/app/src/handler.ts',
                    filename: 'handler.ts',
                    functionName: 'handle',
                    line: 12,
                  },
                  nextStatements: ['return value;'],
                  previousStatements: ['const value = read();'],
                  traceStatement: 'throw new Error(value);',
                },
              ],
              guard: 'AuthGuard',
              id: 'guard-1',
              startedAt: '2026-10-19T20:00:00.004Z',
            },
          ],
          httpErrors: [],
          id: 'call-1',
          interceptors: [],
          middlewares: [],
          nativeMiddlewares: [],
          pipes: [],
          request: {
            headers: {},
            id: 'request-1',
            method: 'POST',
            startedAt: '2026-10-19T20:00:00.000Z',
            url: '/users',
          },
          response: {
            aborted: false,
            headers: {},
            id: 'response-1',
            sentAt: '2026-10-19T20:00:00.018Z',
            statusCode: 500,
          },
        });
      });

      it('should keep the message and the traces', () => {
        expect(result.guards[0]).toMatchObject({
          errorMessage: 'TypeError: boom',
          errorTraces: [
            {
              location: {
                column: 5,
                file: '/app/src/handler.ts',
                filename: 'handler.ts',
                functionName: 'handle',
                line: 12,
              },
              nextStatements: ['return value;'],
              previousStatements: ['const value = read();'],
              traceStatement: 'throw new Error(value);',
            },
          ],
        });
      });
    });
  });

  describe('having a controller plan with a cycle', () => {
    describe('when called', () => {
      let binding: InstancePlanBinding;
      let cycledService: PlanService;
      let plan: Plan;
      let propertyWeapon: PlanService;
      let sharedWeapon: PlanService | null;

      beforeAll(() => {
        const result: CallDetail = readCall(planPayload());
        const controllerPlan: Plan | null = result.controller?.plan ?? null;
        const rootBinding: Plan['root']['bindings'][number] | undefined =
          controllerPlan?.root.bindings[0];
        const propertyService: PlanService | undefined =
          rootBinding?.type === 'Instance'
            ? rootBinding.properties[1]?.service
            : undefined;
        const propertyWeaponService: PlanService | undefined =
          rootBinding?.type === 'Instance'
            ? rootBinding.properties[0]?.service
            : undefined;
        const constructorService: PlanService | null | undefined =
          rootBinding?.type === 'Instance'
            ? rootBinding.constructorArguments[0]
            : undefined;

        if (
          controllerPlan === null ||
          rootBinding === undefined ||
          rootBinding.type !== 'Instance' ||
          propertyService === undefined ||
          propertyWeaponService === undefined ||
          constructorService === undefined
        ) {
          throw new Error('Expected an instance plan.');
        }

        binding = rootBinding;
        cycledService = propertyService;
        plan = controllerPlan;
        propertyWeapon = propertyWeaponService;
        sharedWeapon = constructorService;
      });

      it('should keep one service for the cycle', () => {
        expect(plan.root.serviceIdentifier).toStrictEqual({
          kind: 'class',
          value: 'Ninja',
        });
        expect(binding.moduleId).toBe(0);
        expect(binding.constructorArguments[1]).toBeNull();
        expect(cycledService).toBe(plan.root);
        expect(propertyWeapon).toBe(sharedWeapon);
      });
    });
  });

  describe('having a payload without a request', () => {
    describe('when called', () => {
      it('should throw', () => {
        expect(() => {
          readCall({
            id: 'call-1',
          });
        }).toThrow('Call response has an unexpected shape.');
      });
    });
  });
});

function planPayload(): unknown {
  const weapon: unknown = {
    bindings: [
      {
        bindingId: 2,
        id: 'weapon-binding',
        moduleId: null,
        scope: 'Singleton',
        serviceIdentifier: {
          kind: 'string',
          value: 'Weapon',
        },
        type: 'ConstantValue',
      },
    ],
    chained: null,
    id: 'weapon-service',
    isMultiple: false,
    name: null,
    optional: false,
    serviceIdentifier: {
      kind: 'string',
      value: 'Weapon',
    },
    tags: [],
  };

  return {
    controller: {
      controller: 'UserController',
      endedAt: '2026-10-19T20:00:00.016Z',
      error: null,
      id: 'controller-1',
      method: 'create',
      plan: {
        id: 'plan-1',
        root: {
          bindings: [
            {
              bindingId: 4,
              constructorArguments: [weapon, null],
              id: 'root-binding',
              implementationType: {
                kind: 'class',
                value: 'Ninja',
              },
              moduleId: 0,
              properties: [
                {
                  key: {
                    kind: 'string',
                    value: 'weapon',
                  },
                  service: {
                    id: 'weapon-service',
                  },
                },
                {
                  key: {
                    kind: 'symbol',
                    value: 'Symbol(self)',
                  },
                  service: {
                    id: 'root-service',
                  },
                },
              ],
              scope: 'Transient',
              serviceIdentifier: {
                kind: 'class',
                value: 'Ninja',
              },
              type: 'Instance',
            },
          ],
          chained: null,
          id: 'root-service',
          isMultiple: false,
          name: {
            kind: 'number',
            value: '3',
          },
          optional: true,
          serviceIdentifier: {
            kind: 'class',
            value: 'Ninja',
          },
          tags: [
            {
              key: {
                kind: 'string',
                value: 'kind',
              },
              value: 'sharp',
            },
          ],
        },
      },
      startedAt: '2026-10-19T20:00:00.008Z',
    },
    guards: [],
    httpErrors: [],
    id: 'call-1',
    interceptors: [],
    middlewares: [],
    nativeMiddlewares: [],
    pipes: [],
    request: {
      headers: {},
      id: 'request-1',
      method: 'POST',
      startedAt: '2026-10-19T20:00:00.000Z',
      url: '/users',
    },
    response: {
      aborted: false,
      headers: {},
      id: 'response-1',
      sentAt: '2026-10-19T20:00:00.018Z',
      statusCode: 201,
    },
  };
}
