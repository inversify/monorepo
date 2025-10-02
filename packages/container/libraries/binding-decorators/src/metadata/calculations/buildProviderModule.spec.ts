import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import { getReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { ContainerModuleLoadOptions } from 'inversify';

import { bindingMetadataMapReflectKey } from '../../reflectMetadata/data/bindingMetadataMapReflectKey';
import { BindingMetadata } from '../models/BindingMetadata';
import { buildProviderModule } from './buildProviderModule';

describe(buildProviderModule, () => {
  let optionsFixture: ContainerModuleLoadOptions;

  beforeAll(() => {
    optionsFixture = {
      bind: vitest.fn(),
    } as Partial<ContainerModuleLoadOptions> as ContainerModuleLoadOptions;
  });

  describe('when called, and getReflectMetadata() returns undefined', () => {
    let result: unknown;

    beforeAll(async () => {
      vitest.mocked(getReflectMetadata).mockReturnValueOnce(undefined);

      result = await buildProviderModule().load(optionsFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getReflectMetadata()', () => {
      expect(getReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        Object,
        bindingMetadataMapReflectKey,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });

  describe('when called, and getReflectMetadata() returns a map with metadata', () => {
    let result: unknown;

    let bindingMetadataMock: Mocked<BindingMetadata<unknown>>;

    beforeAll(async () => {
      bindingMetadataMock = {
        action: vitest.fn(),
        serviceIdentifier: Symbol.for('serviceIdentifier'),
      };

      vitest
        .mocked(getReflectMetadata)
        .mockReturnValueOnce(new Map([[Object, [bindingMetadataMock]]]));

      result = await buildProviderModule().load(optionsFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getReflectMetadata()', () => {
      expect(getReflectMetadata).toHaveBeenCalledExactlyOnceWith(
        Object,
        bindingMetadataMapReflectKey,
      );
    });

    it('should call bindingMetadata.action()', () => {
      expect(bindingMetadataMock.action).toHaveBeenCalledExactlyOnceWith(
        optionsFixture.bind,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });
});
