import { describe, expect, it } from 'vitest';

import { es, fr } from './containerApiGetAllNamedAsync';

describe('Container API (getAllNamedAsync)', () => {
  it('should provide translations', async () => {
    await expect(es).resolves.toStrictEqual([
      { hello: 'hola' },
      { goodbye: 'adios' },
    ]);
    await expect(fr).resolves.toStrictEqual([
      { hello: 'bonjour' },
      { goodbye: 'au revoir' },
    ]);
  });
});
