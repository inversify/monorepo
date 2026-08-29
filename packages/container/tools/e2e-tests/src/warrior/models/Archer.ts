import { type InjectNamed, type Injectable } from '@inversifyjs/core';

import { type Weapon } from './Weapon';

export class Archer implements Injectable {
  public bow: Weapon;
  constructor(
    bow: InjectNamed<Weapon, 'bow'>,
  ) {
    this.bow = bow;
  }
}
