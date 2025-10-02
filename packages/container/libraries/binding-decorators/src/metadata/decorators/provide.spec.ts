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
vitest.mock('../actions/updateMetadataMap');

import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import {
  BindInWhenOnFluentSyntax,
  BindToFluentSyntax,
  ServiceIdentifier,
} from 'inversify';

import { bindingMetadataMapReflectKey } from '../../reflectMetadata/data/bindingMetadataMapReflectKey';
import { updateMetadataMap } from '../actions/updateMetadataMap';
import { buildDefaultBindingMetadataMap } from '../calculations/buildDefaultBindingMetadataMap';
import { BindingMetadataMap } from '../models/BindingMetadataMap';
import { provide } from './provide';

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
