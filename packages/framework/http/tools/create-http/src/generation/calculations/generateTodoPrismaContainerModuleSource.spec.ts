import { beforeAll, describe, expect, it } from 'vitest';

import { generateTodoPrismaContainerModuleSource } from './generateTodoPrismaContainerModuleSource.js';

describe(generateTodoPrismaContainerModuleSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateTodoPrismaContainerModuleSource();
    });

    it('should generate a TodoPrismaContainerModule that binds the Prisma adapter and mapper', () => {
      expect(result).toContain(
        "import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';",
      );
      expect(result).toContain(
        "import { todoPersistencePortIdentifier } from '../../../application/models/todoPersistencePortIdentifier.js';",
      );
      expect(result).toContain(
        "import { PrismaTodoPersistenceAdapter } from '../../prisma/adapters/PrismaTodoPersistenceAdapter.js';",
      );
      expect(result).toContain(
        "import { TodoFromPrismaTodoBuilder } from '../../prisma/builders/TodoFromPrismaTodoBuilder.js';",
      );
      expect(result).toContain(
        'export class TodoPrismaContainerModule extends ContainerModule',
      );
      expect(result).toContain(
        'options.bind(TodoFromPrismaTodoBuilder).toSelf().inSingletonScope();',
      );
      expect(result).toContain(
        '.bind(todoPersistencePortIdentifier)\n        .to(PrismaTodoPersistenceAdapter)\n        .inSingletonScope();',
      );
    });
  });
});
