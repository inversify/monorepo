import { describe, expect, it } from 'vitest';

import {
  gameContainer,
  Katana,
  Ninja,
  NINJA_EXPANSION_TYPES,
  Samurai,
  SAMURAI_EXPANSION_TYPES,
  Shuriken,
} from './containerApiMerge';

describe('Container API (merge)', () => {
  it('should provide expected services', () => {
    expect(
      gameContainer.get<Ninja>(NINJA_EXPANSION_TYPES.Ninja),
    ).toBeInstanceOf(Ninja);
    expect(
      gameContainer.get<Shuriken>(NINJA_EXPANSION_TYPES.Shuriken),
    ).toBeInstanceOf(Shuriken);
    expect(
      gameContainer.get<Samurai>(SAMURAI_EXPANSION_TYPES.Samurai),
    ).toBeInstanceOf(Samurai);
    expect(
      gameContainer.get<Katana>(SAMURAI_EXPANSION_TYPES.Katana),
    ).toBeInstanceOf(Katana);
  });
});
