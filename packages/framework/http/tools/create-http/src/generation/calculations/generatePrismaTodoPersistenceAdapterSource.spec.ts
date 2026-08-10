import { beforeAll, describe, expect, it } from 'vitest';

import { PrismaTodoPersistenceAdapterSourceFixtures } from '../fixtures/PrismaTodoPersistenceAdapterSourceFixtures.js';
import { generatePrismaTodoPersistenceAdapterSource } from './generatePrismaTodoPersistenceAdapterSource.js';

describe(generatePrismaTodoPersistenceAdapterSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = PrismaTodoPersistenceAdapterSourceFixtures.any;
    });

    it('should generate a Prisma adapter that implements TodoPersistencePort', () => {
      expect(result).toContain(
        "import { PrismaClient, type Todo as PrismaTodo } from '../../../generated/prisma/client.js';",
      );
      expect(result).toContain(
        'export class PrismaTodoPersistenceAdapter implements TodoPersistencePort',
      );
      expect(result).toContain('@inject(PrismaClient)');
      expect(result).toContain('this.#prismaClient.todo.create');
    });
  });
});
