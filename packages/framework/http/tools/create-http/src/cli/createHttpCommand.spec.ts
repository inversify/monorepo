import { beforeAll, describe, expect, it } from 'vitest';

import { renderUsage } from 'citty';

import { createHttpCommand } from './createHttpCommand.js';

describe(renderUsage, () => {
  describe('having createHttpCommand', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(async () => {
        result = await renderUsage(createHttpCommand);
      });

      it('should include args from the command definition', () => {
        expect(result).toContain('create-inversify-http');
        expect(result).toContain('<PATH>');
        expect(result).toContain('--packageManager');
        expect(result).toContain('npm|pnpm|yarn');
        expect(result).toContain('--adapter');
        expect(result).toContain('express|fastify|hono|uwebsockets');
      });
    });
  });
});
