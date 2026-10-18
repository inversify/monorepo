import { beforeAll, describe, expect, it } from 'vitest';

import { type Controller as PrismaController } from '../../../../generated/prisma/client.js';
import { type Controller } from '../../../domain/models/Controller.js';
import { PrismaControllerFixtures } from '../fixtures/PrismaControllerFixtures.js';
import { ControllerFromPrismaControllerBuilder } from './ControllerFromPrismaControllerBuilder.js';

describe(ControllerFromPrismaControllerBuilder, () => {
  let controllerFromPrismaControllerBuilder: ControllerFromPrismaControllerBuilder;

  beforeAll(() => {
    controllerFromPrismaControllerBuilder =
      new ControllerFromPrismaControllerBuilder();
  });

  describe('.build', () => {
    describe('when called', () => {
      let prismaControllerFixture: PrismaController;

      let result: unknown;

      beforeAll(() => {
        prismaControllerFixture = PrismaControllerFixtures.any;

        result = controllerFromPrismaControllerBuilder.build(
          prismaControllerFixture,
        );
      });

      it('should return a Controller', () => {
        const expected: Controller = {
          controller: prismaControllerFixture.controller,
          endedAt: prismaControllerFixture.ended_at,
          error: prismaControllerFixture.error,
          id: prismaControllerFixture.id,
          method: prismaControllerFixture.method,
          startedAt: prismaControllerFixture.started_at,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
