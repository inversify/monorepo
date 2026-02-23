import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));
vitest.mock(import('../actions/updateMetadataMap.js'));

import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import {
  type BindInWhenOnFluentSyntax,
  type BindToFluentSyntax,
  type ServiceIdentifier,
} from 'inversify';

import { bindingMetadataMapReflectKey } from '../../reflectMetadata/data/bindingMetadataMapReflectKey.js';
import { updateMetadataMap } from '../actions/updateMetadataMap.js';
import { buildDefaultBindingMetadataMap } from '../calculations/buildDefaultBindingMetadataMap.js';
import { type BindingMetadataMap } from '../models/BindingMetadataMap.js';
import { provide } from './provide.js';

describe(provide, () => {
  describe('having no service identifier', () => {
    let bindInWhenOnFluentSyntaxFixture: BindInWhenOnFluentSyntax<unknown>;
    let bindToFluentSyntaxMock: Mocked<BindToFluentSyntax<unknown>>;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;
    let updateMetadataMapResultFixture: (
      bindingMetadataMap: BindingMetadataMap,
    ) => BindingMetadataMap;

    beforeAll(() => {
      bindInWhenOnFluentSyntaxFixture =
        Symbol() as unknown as BindInWhenOnFluentSyntax<unknown>;
      bindToFluentSyntaxMock = {
        to: vitest.fn(),
      } as Partial<Mocked<BindToFluentSyntax<unknown>>> as Mocked<
        BindToFluentSyntax<unknown>
      >;
      targetFixture = class {};
      updateMetadataMapResultFixture = Symbol() as unknown as (
        bindingMetadataMap: BindingMetadataMap,
      ) => BindingMetadataMap;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        bindToFluentSyntaxMock.to.mockReturnValueOnce(
          bindInWhenOnFluentSyntaxFixture,
        );

        vitest
          .mocked(updateMetadataMap)
          .mockReturnValueOnce(updateMetadataMapResultFixture);

        result = provide()(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateMetadataMap()', () => {
        expect(updateMetadataMap).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          {
            action: expect.any(Function),
            serviceIdentifier: targetFixture,
          },
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          Object,
          bindingMetadataMapReflectKey,
          buildDefaultBindingMetadataMap,
          updateMetadataMapResultFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having service identifier', () => {
    let bindInWhenOnFluentSyntaxFixture: BindInWhenOnFluentSyntax<unknown>;
    let bindToFluentSyntaxMock: Mocked<BindToFluentSyntax<unknown>>;
    let serviceIdentifierFixture: ServiceIdentifier;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    let targetFixture: Function;
    let updateMetadataMapResultFixture: (
      bindingMetadataMap: BindingMetadataMap,
    ) => BindingMetadataMap;

    beforeAll(() => {
      bindInWhenOnFluentSyntaxFixture =
        Symbol() as unknown as BindInWhenOnFluentSyntax<unknown>;
      bindToFluentSyntaxMock = {
        to: vitest.fn(),
      } as Partial<Mocked<BindToFluentSyntax<unknown>>> as Mocked<
        BindToFluentSyntax<unknown>
      >;
      serviceIdentifierFixture = Symbol.for('serviceIdentifier');
      targetFixture = class {};
      updateMetadataMapResultFixture = Symbol() as unknown as (
        bindingMetadataMap: BindingMetadataMap,
      ) => BindingMetadataMap;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        bindToFluentSyntaxMock.to.mockReturnValueOnce(
          bindInWhenOnFluentSyntaxFixture,
        );

        vitest
          .mocked(updateMetadataMap)
          .mockReturnValueOnce(updateMetadataMapResultFixture);

        result = provide(serviceIdentifierFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call updateMetadataMap()', () => {
        expect(updateMetadataMap).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          {
            action: expect.any(Function),
            serviceIdentifier: serviceIdentifierFixture,
          },
        );
      });

      it('should call updateOwnReflectMetadata()', () => {
        expect(updateOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          Object,
          bindingMetadataMapReflectKey,
          buildDefaultBindingMetadataMap,
          updateMetadataMapResultFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
