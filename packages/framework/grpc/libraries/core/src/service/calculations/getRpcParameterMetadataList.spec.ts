import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/prototype-utils'));
vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { findInPrototypeChain } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type Newable } from 'inversify';

import { rpcParameterMetadataReflectKey } from '../../reflectMetadata/data/rpcParameterMetadataReflectKey.js';
import { type RpcParameterMetadata } from '../models/RpcParameterMetadata.js';
import { RpcParameterType } from '../models/RpcParameterType.js';
import { getRpcParameterMetadataList } from './getRpcParameterMetadataList.js';

describe(getRpcParameterMetadataList, () => {
  let methodKeyFixture: string;
  let targetFixture: Newable;

  beforeAll(() => {
    methodKeyFixture = 'getHero';
    targetFixture = class HeroService {};
  });

  describe('when called, and findInPrototypeChain() returns undefined', () => {
    let result: unknown;

    beforeAll(() => {
      vitest.mocked(findInPrototypeChain).mockReturnValueOnce(undefined);

      result = getRpcParameterMetadataList(targetFixture, methodKeyFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call findInPrototypeChain()', () => {
      expect(findInPrototypeChain).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        expect.any(Function),
      );
    });

    it('should return an empty array', () => {
      expect(result).toStrictEqual([]);
    });
  });

  describe('when called, and findInPrototypeChain() returns metadata', () => {
    let parameterMetadataListFixture: (RpcParameterMetadata | undefined)[];
    let result: unknown;

    beforeAll(() => {
      parameterMetadataListFixture = [
        {
          parameterType: RpcParameterType.Call,
          pipeList: [],
        },
      ];

      vitest
        .mocked(findInPrototypeChain)
        .mockImplementationOnce(
          <T>(type: Newable, find: (type: Newable) => T | undefined) =>
            find(type),
        );
      vitest
        .mocked(getOwnReflectMetadata)
        .mockReturnValueOnce(parameterMetadataListFixture);

      result = getRpcParameterMetadataList(targetFixture, methodKeyFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getOwnReflectMetadata() for the method', () => {
      expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        targetFixture,
        rpcParameterMetadataReflectKey,
        methodKeyFixture,
      );
    });

    it('should return the parameter metadata', () => {
      expect(result).toBe(parameterMetadataListFixture);
    });
  });
});
