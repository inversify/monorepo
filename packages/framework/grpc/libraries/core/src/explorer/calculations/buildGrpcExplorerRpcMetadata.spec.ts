import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/framework-core'));
vitest.mock(
  import('../../service/calculations/getRpcParameterMetadataList.js'),
);
vitest.mock(import('./buildErrorFilterMaps.js'));

import { Buffer } from 'node:buffer';

import {
  buildMiddlewareOptionsFromApplyMiddlewareOptions,
  getClassGuardList,
  getClassInterceptorList,
  getClassMethodGuardList,
  getClassMethodInterceptorList,
  getClassMethodMiddlewareList,
  getClassMiddlewareList,
} from '@inversifyjs/framework-core';
import { type Logger } from '@inversifyjs/logger';

import { InversifyGrpcAdapterError } from '../../error/models/InversifyGrpcAdapterError.js';
import { InversifyGrpcAdapterErrorKind } from '../../error/models/InversifyGrpcAdapterErrorKind.js';
import { getRpcParameterMetadataList } from '../../service/calculations/getRpcParameterMetadataList.js';
import { type GrpcMethodDefinition } from '../../service/models/GrpcMethodDefinition.js';
import { type RpcMetadata } from '../../service/models/RpcMetadata.js';
import { type RpcParameterMetadata } from '../../service/models/RpcParameterMetadata.js';
import { RpcParameterType } from '../../service/models/RpcParameterType.js';
import {
  buildErrorFilterMaps,
  type ErrorFilterMaps,
} from './buildErrorFilterMaps.js';
import { buildGrpcExplorerRpcMetadata } from './buildGrpcExplorerRpcMetadata.js';

function buildMethodDefinition(responseStream: boolean): GrpcMethodDefinition {
  return {
    path: '/test.Hero/GetHero',
    requestDeserialize: (bytes: Buffer): Buffer => bytes,
    requestSerialize: (): Buffer => Buffer.alloc(0),
    requestStream: false,
    responseDeserialize: (bytes: Buffer): Buffer => bytes,
    responseSerialize: (): Buffer => Buffer.alloc(0),
    responseStream,
  };
}

describe(buildGrpcExplorerRpcMetadata, () => {
  let loggerFixture: Logger;
  let rpcMetadataFixture: RpcMetadata;
  let targetFixture: NewableFunction;

  beforeAll(() => {
    loggerFixture = Symbol() as unknown as Logger;
    rpcMetadataFixture = {
      methodKey: 'getHero',
      name: 'GetHero',
    };
    targetFixture = class HeroService {};
  });

  describe('when called', () => {
    let errorFilterMapsFixture: ErrorFilterMaps;
    let methodDefinitionFixture: GrpcMethodDefinition;
    let parameterMetadataListFixture: (RpcParameterMetadata | undefined)[];
    let result: unknown;

    beforeAll(() => {
      errorFilterMapsFixture = {
        errorDiscriminatorToErrorFilterMap: new Map(),
        errorTypeToErrorFilterMap: new Map(),
      };
      methodDefinitionFixture = buildMethodDefinition(false);
      parameterMetadataListFixture = [
        {
          parameterType: RpcParameterType.Callback,
          pipeList: [],
        },
      ];

      vitest
        .mocked(getRpcParameterMetadataList)
        .mockReturnValueOnce(parameterMetadataListFixture);
      vitest.mocked(getClassMiddlewareList).mockReturnValueOnce(['classMw']);
      vitest
        .mocked(getClassMethodMiddlewareList)
        .mockReturnValueOnce(['methodMw']);
      vitest
        .mocked(buildMiddlewareOptionsFromApplyMiddlewareOptions)
        .mockReturnValueOnce({
          postHandlerMiddlewareList: ['classPost'],
          preHandlerMiddlewareList: ['classPre'],
        })
        .mockReturnValueOnce({
          postHandlerMiddlewareList: ['methodPost'],
          preHandlerMiddlewareList: ['methodPre'],
        });
      vitest
        .mocked(buildErrorFilterMaps)
        .mockReturnValueOnce(errorFilterMapsFixture);
      vitest.mocked(getClassGuardList).mockReturnValueOnce(['classGuard']);
      vitest
        .mocked(getClassMethodGuardList)
        .mockReturnValueOnce(['methodGuard']);
      vitest
        .mocked(getClassInterceptorList)
        .mockReturnValueOnce(['classInterceptor']);
      vitest
        .mocked(getClassMethodInterceptorList)
        .mockReturnValueOnce(['methodInterceptor']);

      result = buildGrpcExplorerRpcMetadata(
        loggerFixture,
        targetFixture,
        rpcMetadataFixture,
        methodDefinitionFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getRpcParameterMetadataList()', () => {
      expect(getRpcParameterMetadataList).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        rpcMetadataFixture.methodKey,
      );
    });

    it('should call buildMiddlewareOptionsFromApplyMiddlewareOptions() with class and method middleware', () => {
      expect(
        buildMiddlewareOptionsFromApplyMiddlewareOptions,
      ).toHaveBeenCalledTimes(2);
      expect(
        buildMiddlewareOptionsFromApplyMiddlewareOptions,
      ).toHaveBeenNthCalledWith(1, ['classMw']);
      expect(
        buildMiddlewareOptionsFromApplyMiddlewareOptions,
      ).toHaveBeenNthCalledWith(2, ['methodMw']);
    });

    it('should call buildErrorFilterMaps()', () => {
      expect(buildErrorFilterMaps).toHaveBeenCalledExactlyOnceWith(
        loggerFixture,
        targetFixture,
        rpcMetadataFixture.methodKey,
      );
    });

    it('should return GrpcExplorerRpcMetadata with class entries before method entries', () => {
      expect(result).toStrictEqual({
        errorDiscriminatorToErrorFilterMap:
          errorFilterMapsFixture.errorDiscriminatorToErrorFilterMap,
        errorTypeToErrorFilterMap:
          errorFilterMapsFixture.errorTypeToErrorFilterMap,
        guardList: ['classGuard', 'methodGuard'],
        interceptorList: ['classInterceptor', 'methodInterceptor'],
        methodDefinition: methodDefinitionFixture,
        methodKey: rpcMetadataFixture.methodKey,
        name: rpcMetadataFixture.name,
        parameterMetadataList: parameterMetadataListFixture,
        postHandlerMiddlewareList: ['classPost', 'methodPost'],
        preHandlerMiddlewareList: ['classPre', 'methodPre'],
        useNativeHandler: true,
      });
    });
  });

  describe.each<
    [string, boolean, (RpcParameterMetadata | undefined)[], boolean]
  >([
    ['a unary RPC without @Callback()', false, [], false],
    [
      'a unary RPC with @Call() only',
      false,
      [
        {
          parameterType: RpcParameterType.Call,
          pipeList: [],
        },
      ],
      false,
    ],
    ['a response-streaming RPC', true, [], true],
  ])(
    'having %s',
    (
      _: string,
      responseStream: boolean,
      parameterMetadataList: (RpcParameterMetadata | undefined)[],
      expectedUseNativeHandler: boolean,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          vitest
            .mocked(getRpcParameterMetadataList)
            .mockReturnValueOnce(parameterMetadataList);
          vitest.mocked(getClassMiddlewareList).mockReturnValueOnce([]);
          vitest.mocked(getClassMethodMiddlewareList).mockReturnValueOnce([]);
          vitest
            .mocked(buildMiddlewareOptionsFromApplyMiddlewareOptions)
            .mockReturnValue({
              postHandlerMiddlewareList: [],
              preHandlerMiddlewareList: [],
            });
          vitest.mocked(buildErrorFilterMaps).mockReturnValueOnce({
            errorDiscriminatorToErrorFilterMap: new Map(),
            errorTypeToErrorFilterMap: new Map(),
          });
          vitest.mocked(getClassGuardList).mockReturnValueOnce([]);
          vitest.mocked(getClassMethodGuardList).mockReturnValueOnce([]);
          vitest.mocked(getClassInterceptorList).mockReturnValueOnce([]);
          vitest.mocked(getClassMethodInterceptorList).mockReturnValueOnce([]);

          result = buildGrpcExplorerRpcMetadata(
            loggerFixture,
            targetFixture,
            rpcMetadataFixture,
            buildMethodDefinition(responseStream),
          );
        });

        afterAll(() => {
          vitest.resetAllMocks();
        });

        it(`should return useNativeHandler ${String(expectedUseNativeHandler)}`, () => {
          expect(result).toHaveProperty(
            'useNativeHandler',
            expectedUseNativeHandler,
          );
        });
      });
    },
  );

  describe('when called, and a response-streaming RPC uses @Callback()', () => {
    let errorFixture: unknown;

    beforeAll(() => {
      vitest.mocked(getRpcParameterMetadataList).mockReturnValueOnce([
        undefined,
        {
          parameterType: RpcParameterType.Callback,
          pipeList: [],
        },
      ]);

      try {
        buildGrpcExplorerRpcMetadata(
          loggerFixture,
          targetFixture,
          rpcMetadataFixture,
          buildMethodDefinition(true),
        );
      } catch (error: unknown) {
        errorFixture = error;
      }
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should throw InversifyGrpcAdapterError', () => {
      expect(errorFixture).toBeInstanceOf(InversifyGrpcAdapterError);
      expect((errorFixture as InversifyGrpcAdapterError).kind).toBe(
        InversifyGrpcAdapterErrorKind.invalidRpc,
      );
      expect((errorFixture as InversifyGrpcAdapterError).message).toBe(
        'RPC "GetHero" on HeroService uses @Callback(), but response-streaming RPCs have no callback',
      );
    });

    it('should not read middleware metadata', () => {
      expect(getClassMiddlewareList).not.toHaveBeenCalled();
    });
  });
});
