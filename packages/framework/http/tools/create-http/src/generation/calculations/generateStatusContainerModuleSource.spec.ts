import { beforeAll, describe, expect, it } from 'vitest';

import { generateStatusContainerModuleSource } from './generateStatusContainerModuleSource.js';

describe(generateStatusContainerModuleSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateStatusContainerModuleSource();
    });

    it('should generate a StatusContainerModule that binds StatusController', () => {
      expect(result).toContain(
        "import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify';",
      );
      expect(result).toContain(
        "import { StatusController } from '../controllers/StatusController.js';",
      );
      expect(result).toContain(
        'export class StatusContainerModule extends ContainerModule',
      );
      expect(result).toContain(
        'options.bind(StatusController).toSelf().inSingletonScope();',
      );
    });
  });
});
