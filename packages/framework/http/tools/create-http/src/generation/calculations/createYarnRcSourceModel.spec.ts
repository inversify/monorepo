import { beforeAll, describe, expect, it } from 'vitest';

import { type YarnRcSourceModel } from '../models/YarnRcSourceModel.js';
import { createYarnRcSourceModel } from './createYarnRcSourceModel.js';

describe(createYarnRcSourceModel, () => {
  describe('having the express adapter and prisma+postgresql', () => {
    describe('when called', () => {
      let result: YarnRcSourceModel;

      beforeAll(() => {
        result = createYarnRcSourceModel('express', 'prisma+postgresql');
      });

      it('should include prisma built dependencies without http adapter entries', () => {
        expect(result).toStrictEqual({
          dependenciesMeta: {
            '@prisma/engines': {
              built: true,
            },
            '@scarf/scarf': {
              built: true,
            },
            prisma: {
              built: true,
            },
          },
        });
      });
    });
  });

  describe('having the uwebsockets adapter and prisma+postgresql', () => {
    describe('when called', () => {
      let result: YarnRcSourceModel;

      beforeAll(() => {
        result = createYarnRcSourceModel('uwebsockets', 'prisma+postgresql');
      });

      it('should include prisma and uWebSockets.js built dependencies', () => {
        expect(result).toStrictEqual({
          dependenciesMeta: {
            '@prisma/engines': {
              built: true,
            },
            '@scarf/scarf': {
              built: true,
            },
            prisma: {
              built: true,
            },
            'uWebSockets.js': {
              built: true,
            },
          },
        });
      });
    });
  });
});
