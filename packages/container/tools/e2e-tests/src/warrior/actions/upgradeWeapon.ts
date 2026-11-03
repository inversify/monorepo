import { type ResolutionContext } from '@inversifyjs/core';

import { type Weapon } from '../models/Weapon';

export function upgradeWeapon(
  _context: ResolutionContext,
  weapon: Weapon,
): Weapon {
  weapon.damage += 2;

  return weapon;
}
