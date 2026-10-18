import { beforeAll, describe, expect, it } from 'vitest';

import { type Pipe as PrismaPipe } from '../../../../generated/prisma/client.js';
import { type Pipe } from '../../../domain/models/Pipe.js';
import { PrismaPipeFixtures } from '../fixtures/PrismaPipeFixtures.js';
import { PipeFromPrismaPipeBuilder } from './PipeFromPrismaPipeBuilder.js';

describe(PipeFromPrismaPipeBuilder, () => {
  let pipeFromPrismaPipeBuilder: PipeFromPrismaPipeBuilder;

  beforeAll(() => {
    pipeFromPrismaPipeBuilder = new PipeFromPrismaPipeBuilder();
  });

  describe('.build', () => {
    describe('when called', () => {
      let prismaPipeFixture: PrismaPipe;

      let result: unknown;

      beforeAll(() => {
        prismaPipeFixture = PrismaPipeFixtures.any;

        result = pipeFromPrismaPipeBuilder.build(prismaPipeFixture);
      });

      it('should return a Pipe', () => {
        const expected: Pipe = {
          endedAt: prismaPipeFixture.ended_at,
          error: prismaPipeFixture.error,
          id: prismaPipeFixture.id,
          method: prismaPipeFixture.method,
          parameterIndex: prismaPipeFixture.parameter_index,
          pipe: prismaPipeFixture.pipe,
          startedAt: prismaPipeFixture.started_at,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
