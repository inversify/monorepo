import { beforeAll, describe, expect, it } from 'vitest';

import fs from 'node:fs/promises';

import { getBaseTemplateRoot } from './getTemplatesRoot.js';

describe(getBaseTemplateRoot, () => {
  describe('when called', () => {
    let result: string;
    let templateEntries: string[];

    beforeAll(async () => {
      result = getBaseTemplateRoot();
      templateEntries = await fs.readdir(result);
    });

    it('should include static templates under names that npm pack will publish', () => {
      expect(templateEntries).toContain('.gitignore.template');
      expect(templateEntries).not.toContain('.gitignore');
      expect(templateEntries).toContain('.env.example');
      expect(templateEntries).toContain('docker-compose.yml');
      expect(templateEntries).toContain('eslint.config.mjs.template');
      expect(templateEntries).toContain('package.json');
      expect(templateEntries).toContain('package-managers.json');
      expect(templateEntries).toContain('prettier.config.mjs.template');
      expect(templateEntries).toContain('prisma.config.ts.template');
      expect(templateEntries).toContain('prisma');
      expect(templateEntries).toContain('tsconfig.json');
      expect(templateEntries).toContain('yarn-berry.json');
    });
  });
});
