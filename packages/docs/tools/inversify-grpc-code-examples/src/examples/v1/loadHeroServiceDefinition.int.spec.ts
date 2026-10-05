import { describe, expect, it } from 'vitest';

import {
  heroChatServiceDefinition,
  heroListServiceDefinition,
  heroServiceDefinition,
  heroUploadServiceDefinition,
} from './loadHeroServiceDefinition.js';

describe('loadHeroServiceDefinition', () => {
  it('should expose every hero RPC kind', () => {
    expect(heroServiceDefinition['GetHero']).toMatchObject({
      requestStream: false,
      responseStream: false,
    });
    expect(heroUploadServiceDefinition['UploadHeroes']).toMatchObject({
      requestStream: true,
      responseStream: false,
    });
    expect(heroListServiceDefinition['ListHeroes']).toMatchObject({
      requestStream: false,
      responseStream: true,
    });
    expect(heroChatServiceDefinition['Chat']).toMatchObject({
      requestStream: true,
      responseStream: true,
    });
  });
});
