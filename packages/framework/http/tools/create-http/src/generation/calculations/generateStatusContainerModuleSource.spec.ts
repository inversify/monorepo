import { beforeAll, describe, expect, it } from 'vitest';

import { StatusContainerModuleSourceFixtures } from '../fixtures/StatusContainerModuleSourceFixtures.js';
import { generateStatusContainerModuleSource } from './generateStatusContainerModuleSource.js';

describe(generateStatusContainerModuleSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = StatusContainerModuleSourceFixtures.any;
    });

    it('should generate a StatusContainerModule that binds StatusController and StatusV1 mapper', () => {
      expect(result).toContain(
        "import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';",
      );
      expect(result).toContain(
        "import { StatusV1FromStatusBuilder } from '../../../api/builders/StatusV1FromStatusBuilder.js';",
      );
      expect(result).toContain(
        "import { StatusController } from '../../../api/controllers/StatusController.js';",
      );
      expect(result).toContain(
        'export class StatusContainerModule extends ContainerModule',
      );
      expect(result).toContain(
        'options.bind(StatusController).toSelf().inSingletonScope();',
      );
      expect(result).toContain(
        'options.bind(StatusV1FromStatusBuilder).toSelf().inSingletonScope();',
      );
    });
  });
});
