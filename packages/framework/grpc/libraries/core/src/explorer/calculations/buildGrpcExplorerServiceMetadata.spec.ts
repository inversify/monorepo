import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('../../service/calculations/getRpcMetadataList.js'));
vitest.mock(import('../../service/typeguard/isGrpcMethodDefinition.js'));
vitest.mock(import('./buildGrpcExplorerRpcMetadata.js'));

import { Buffer } from 'node:buffer';

import { type Logger } from '@inversifyjs/logger';

import { InversifyGrpcAdapterError } from '../../error/models/InversifyGrpcAdapterError.js';
import { InversifyGrpcAdapterErrorKind } from '../../error/models/InversifyGrpcAdapterErrorKind.js';
import { getRpcMetadataList } from '../../service/calculations/getRpcMetadataList.js';
import { type GrpcMethodDefinition } from '../../service/models/GrpcMethodDefinition.js';
import { type RpcMetadata } from '../../service/models/RpcMetadata.js';
import { type ServiceMetadata } from '../../service/models/ServiceMetadata.js';
import { isGrpcMethodDefinition } from '../../service/typeguard/isGrpcMethodDefinition.js';
import { type GrpcExplorerRpcMetadata } from '../model/GrpcExplorerRpcMetadata.js';
import { buildGrpcExplorerRpcMetadata } from './buildGrpcExplorerRpcMetadata.js';
import { buildGrpcExplorerServiceMetadata } from './buildGrpcExplorerServiceMetadata.js';

function buildMethodDefinition(): GrpcMethodDefinition {
  return {
    path: '/test.Hero/GetHero',
    requestDeserialize: (bytes: Buffer): Buffer => bytes,
    requestSerialize: (): Buffer => Buffer.alloc(0),
    requestStream: false,
    responseDeserialize: (bytes: Buffer): Buffer => bytes,
    responseSerialize: (): Buffer => Buffer.alloc(0),
    responseStream: false,
  };
}

function captureError(callback: () => unknown): unknown {
  try {
    callback();
  } catch (error: unknown) {
    return error;
  }

  return undefined;
}

class HeroService {
  public getHero(): void {}

  public other(): void {}
}

describe(buildGrpcExplorerServiceMetadata, () => {
  let loggerFixture: Logger;

  beforeAll(() => {
    loggerFixture = Symbol() as unknown as Logger;
  });

  describe('when called, and isGrpcMethodDefinition() returns false', () => {
    let errorFixture: unknown;

    beforeAll(() => {
      const serviceMetadata: ServiceMetadata = {
        definition: {
          getHero: buildMethodDefinition(),
        },
        serviceIdentifier: HeroService,
        target: HeroService,
      };

      vitest.mocked(isGrpcMethodDefinition).mockReturnValueOnce(false);

      errorFixture = captureError(() =>
        buildGrpcExplorerServiceMetadata(loggerFixture, serviceMetadata),
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should throw InversifyGrpcAdapterError', () => {
      expect(errorFixture).toBeInstanceOf(InversifyGrpcAdapterError);
      expect((errorFixture as InversifyGrpcAdapterError).kind).toBe(
        InversifyGrpcAdapterErrorKind.invalidServiceDefinition,
      );
      expect((errorFixture as InversifyGrpcAdapterError).message).toBe(
        'Service definition method "getHero" on HeroService is not a valid method definition',
      );
    });
  });

  describe('when called, and getRpcMetadataList() returns an RPC not declared by the definition', () => {
    let errorFixture: unknown;

    beforeAll(() => {
      const serviceMetadata: ServiceMetadata = {
        definition: {
          getHero: buildMethodDefinition(),
        },
        serviceIdentifier: HeroService,
        target: HeroService,
      };

      vitest.mocked(isGrpcMethodDefinition).mockReturnValueOnce(true);
      vitest.mocked(getRpcMetadataList).mockReturnValueOnce([
        {
          methodKey: 'other',
          name: 'Other',
        },
      ]);

      errorFixture = captureError(() =>
        buildGrpcExplorerServiceMetadata(loggerFixture, serviceMetadata),
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should throw InversifyGrpcAdapterError', () => {
      expect((errorFixture as InversifyGrpcAdapterError).kind).toBe(
        InversifyGrpcAdapterErrorKind.invalidRpc,
      );
      expect((errorFixture as InversifyGrpcAdapterError).message).toBe(
        'RPC "Other" on HeroService is not declared by the service definition',
      );
    });
  });

  describe('when called, and getRpcMetadataList() returns an RPC whose method is not a function', () => {
    let errorFixture: unknown;

    beforeAll(() => {
      const serviceMetadata: ServiceMetadata = {
        definition: {
          getHero: buildMethodDefinition(),
        },
        serviceIdentifier: HeroService,
        target: HeroService,
      };

      vitest.mocked(isGrpcMethodDefinition).mockReturnValueOnce(true);
      vitest.mocked(getRpcMetadataList).mockReturnValueOnce([
        {
          methodKey: 'missing',
          name: 'getHero',
        },
      ]);

      errorFixture = captureError(() =>
        buildGrpcExplorerServiceMetadata(loggerFixture, serviceMetadata),
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should throw InversifyGrpcAdapterError', () => {
      expect((errorFixture as InversifyGrpcAdapterError).kind).toBe(
        InversifyGrpcAdapterErrorKind.invalidRpc,
      );
      expect((errorFixture as InversifyGrpcAdapterError).message).toBe(
        'RPC "getHero" on HeroService is not a function',
      );
    });

    it('should not call buildGrpcExplorerRpcMetadata()', () => {
      expect(buildGrpcExplorerRpcMetadata).not.toHaveBeenCalled();
    });
  });

  describe('when called, and the definition declares a method without RPC', () => {
    let errorFixture: unknown;

    beforeAll(() => {
      const serviceMetadata: ServiceMetadata = {
        definition: {
          getHero: buildMethodDefinition(),
          other: buildMethodDefinition(),
        },
        serviceIdentifier: HeroService,
        target: HeroService,
      };

      vitest
        .mocked(isGrpcMethodDefinition)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true);
      vitest.mocked(getRpcMetadataList).mockReturnValueOnce([
        {
          methodKey: 'getHero',
          name: 'getHero',
        },
      ]);

      errorFixture = captureError(() =>
        buildGrpcExplorerServiceMetadata(loggerFixture, serviceMetadata),
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should throw InversifyGrpcAdapterError', () => {
      expect((errorFixture as InversifyGrpcAdapterError).kind).toBe(
        InversifyGrpcAdapterErrorKind.invalidRpc,
      );
      expect((errorFixture as InversifyGrpcAdapterError).message).toBe(
        'Service definition method "other" on HeroService has no @RPC() method',
      );
    });
  });

  describe('when called, and every definition method has an RPC', () => {
    let methodDefinitionFixture: GrpcMethodDefinition;
    let rpcExplorerMetadataFixture: GrpcExplorerRpcMetadata;
    let rpcMetadataFixture: RpcMetadata;
    let serviceMetadataFixture: ServiceMetadata;
    let result: unknown;

    beforeAll(() => {
      methodDefinitionFixture = buildMethodDefinition();
      rpcMetadataFixture = {
        methodKey: 'getHero',
        name: 'GetHero',
      };
      serviceMetadataFixture = {
        definition: {
          GetHero: methodDefinitionFixture,
        },
        serviceIdentifier: Symbol('hero-service'),
        target: HeroService,
      };
      rpcExplorerMetadataFixture =
        Symbol() as unknown as GrpcExplorerRpcMetadata;

      vitest.mocked(isGrpcMethodDefinition).mockReturnValueOnce(true);
      vitest
        .mocked(getRpcMetadataList)
        .mockReturnValueOnce([rpcMetadataFixture]);
      vitest
        .mocked(buildGrpcExplorerRpcMetadata)
        .mockReturnValueOnce(rpcExplorerMetadataFixture);

      result = buildGrpcExplorerServiceMetadata(
        loggerFixture,
        serviceMetadataFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getRpcMetadataList()', () => {
      expect(getRpcMetadataList).toHaveBeenCalledExactlyOnceWith(HeroService);
    });

    it('should call buildGrpcExplorerRpcMetadata()', () => {
      expect(buildGrpcExplorerRpcMetadata).toHaveBeenCalledExactlyOnceWith(
        loggerFixture,
        HeroService,
        rpcMetadataFixture,
        methodDefinitionFixture,
      );
    });

    it('should return GrpcExplorerServiceMetadata', () => {
      expect(result).toStrictEqual({
        definition: serviceMetadataFixture.definition,
        rpcList: [rpcExplorerMetadataFixture],
        serviceIdentifier: serviceMetadataFixture.serviceIdentifier,
        target: HeroService,
      });
    });
  });
});
