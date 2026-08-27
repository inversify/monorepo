import { type Inject, type Injectable } from '@inversifyjs/core';

import { Sword } from './Sword';

export class DualWieldSwordsman implements Injectable {
  public leftSword: Sword;
  public rightSword: Sword;
  constructor(
    leftSword: Inject<Sword>,
    rightSword: Inject<Sword>,
  ) {
    this.leftSword = leftSword;
    this.rightSword = rightSword;
  }
}
