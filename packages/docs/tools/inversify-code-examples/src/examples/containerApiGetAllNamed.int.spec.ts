import { describe, expect, it } from 'vitest';

import { es, fr } from './containerApiGetAllNamed';

describe('Container API (getAllNamed)', () => {
  it('should provide translations', () => {
    expect(es).toStrictEqual([{ hello: 'hola' }, { goodbye: 'adios' }]);
    expect(fr).toStrictEqual([{ hello: 'bonjour' }, { goodbye: 'au revoir' }]);
  });
});
