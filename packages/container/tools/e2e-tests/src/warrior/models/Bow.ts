import { injectable } from '@inversifyjs/core';

import { type Weapon } from './Weapon';

@injectable()
export class Bow implements Weapon {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  public damage: number = 7;
}
