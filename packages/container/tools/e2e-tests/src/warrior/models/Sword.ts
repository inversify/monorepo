import { type Injectable } from '@inversifyjs/core';

import { type Weapon } from './Weapon';

export class Sword implements Weapon, Injectable {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  public damage: number = 10;
}
