import { type HeroResponse } from '../generated/hero.js';

export type { HeroResponse };

export function isHeroResponse(value: unknown): value is HeroResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return 'name' in value && typeof value.name === 'string';
}

export function isHeroResponseList(value: unknown): value is HeroResponse[] {
  return Array.isArray(value) && value.every(isHeroResponse);
}
