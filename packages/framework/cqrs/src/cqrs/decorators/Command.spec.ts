import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import {
  getOwnReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { commandMetadataReflectKey } from '../../reflectMetadata/data/commandMetadataReflectKey.js';
import { type CommandMetadata } from '../models/CommandMetadata.js';
import { Command, type CommandOptions } from './Command.js';

describe(Command, () => {
  describe('having an identifier', () => {
    let optionsFixture: CommandOptions;
    let targetFixture: NewableFunction;

    beforeAll(() => {
      optionsFixture = {
        identifier: 'stock.reserve',
      };
      targetFixture = class ReserveStock {};
    });

    describe('when called, and the command is not defined', () => {
      beforeAll(() => {
        vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(undefined);

        Command(optionsFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          commandMetadataReflectKey,
        );
      });

      it('should call setReflectMetadata()', () => {
        const expectedMetadata: CommandMetadata = {
          identifier: optionsFixture.identifier,
        };

        expect(setReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          commandMetadataReflectKey,
          expectedMetadata,
        );
      });
    });

    describe('when called, and the command is already defined', () => {
      let errorFixture: unknown;

      beforeAll(() => {
        vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce({
          identifier: 'stock.existing',
        });

        try {
          Command(optionsFixture)(targetFixture);
        } catch (error: unknown) {
          errorFixture = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          commandMetadataReflectKey,
        );
      });

      it('should throw an Error', () => {
        expect(errorFixture).toBeInstanceOf(Error);
        expect((errorFixture as Error).message).toBe(
          `Command already defined on target "${targetFixture.name}".`,
        );
      });

      it('should not call setReflectMetadata()', () => {
        expect(setReflectMetadata).not.toHaveBeenCalled();
      });
    });
  });

  describe('having no identifier', () => {
    describe('when called, and the command is not defined', () => {
      let optionsFixture: CommandOptions;
      let targetFixture: NewableFunction;

      beforeAll(() => {
        optionsFixture = {};
        targetFixture = class ReleaseStock {};

        vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(undefined);

        Command(optionsFixture)(targetFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call setReflectMetadata() with an undefined identifier', () => {
        const expectedMetadata: CommandMetadata = {
          identifier: undefined,
        };

        expect(setReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          targetFixture,
          commandMetadataReflectKey,
          expectedMetadata,
        );
      });
    });
  });
});
