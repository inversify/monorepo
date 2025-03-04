import { describe, expect, it } from 'vitest';

import { es, fr } from './containerApiGetAllTagged';

describe('Container API (getAllTagged)', () => {
  it('should provide translations', () => {
    expect(es).toStrictEqual([{ hello: 'hola' }, { goodbye: 'adios' }]);
    expect(fr).toStrictEqual([{ hello: 'bonjour' }, { goodbye: 'au revoir' }]);
  });
});
