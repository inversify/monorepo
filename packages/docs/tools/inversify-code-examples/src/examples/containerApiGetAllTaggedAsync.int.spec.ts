import { describe, expect, it } from 'vitest';

import { es, fr } from './containerApiGetAllTaggedAsync';

describe('Container API (getAllTaggedAsync)', () => {
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
