import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import {
  buildArrayMetadataWithElement,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { queryHandlerMetadataReflectKey } from '../../reflectMetadata/data/queryHandlerMetadataReflectKey.js';
import { type QueryHandlerMetadata } from '../models/QueryHandlerMetadata.js';
import { type QueryHandlerOptions } from '../models/QueryHandlerOptions.js';
import { QueryHandler } from './QueryHandler.js';

describe(QueryHandler, () => {
  describe('having query handler options', () => {
    let optionsFixture: QueryHandlerOptions;
    let targetFixture: NewableFunction;

    beforeAll(() => {
      optionsFixture = {
        query: class GetStock {},
      };
      targetFixture = class GetStockHandler {};
    });

    describe('when called', () => {
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithElement)
          .mockReturnValueOnce(callbackFixture);

        QueryHandler(optionsFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildArrayMetadataWithElement()', () => {
        const expectedMetadata: QueryHandlerMetadata = {
          query: optionsFixture.query,
          serviceIdentifier: undefined,
          target: targetFixture,
        };

        expect(buildArrayMetadataWithElement).toHaveBeenCalledExactlyOnceWith(
          expectedMetadata,
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          Reflect,
          queryHandlerMetadataReflectKey,
          buildEmptyArrayMetadata,
          callbackFixture,
        );
      });
    });
  });

  describe('having query handler options with a service identifier', () => {
    let optionsFixture: QueryHandlerOptions;
    let serviceIdentifierFixture: ServiceIdentifier;
    let targetFixture: NewableFunction;

    beforeAll(() => {
      serviceIdentifierFixture = Symbol('get-stock-handler');
      targetFixture = class GetStockHandler {};
      optionsFixture = {
        query: class GetStock {},
        serviceIdentifier: serviceIdentifierFixture,
      };
    });

    describe('when called', () => {
      let callbackFixture: (arrayMetadata: unknown[]) => unknown[];

      beforeAll(() => {
        callbackFixture = (arrayMetadata: unknown[]): unknown[] =>
          arrayMetadata;

        vitest
          .mocked(buildArrayMetadataWithElement)
          .mockReturnValueOnce(callbackFixture);

        QueryHandler(optionsFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildArrayMetadataWithElement() with the service identifier', () => {
        const expectedMetadata: QueryHandlerMetadata = {
          query: optionsFixture.query,
          serviceIdentifier: serviceIdentifierFixture,
          target: targetFixture,
        };

        expect(buildArrayMetadataWithElement).toHaveBeenCalledExactlyOnceWith(
          expectedMetadata,
        );
      });
    });
  });
});
