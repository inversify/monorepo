import { type Injectable } from '@inversifyjs/core';

import { Sword } from './Sword';

export class DualWieldSwordsman implements Injectable {
  public leftSword: Sword;
  public rightSword: Sword;
  constructor(
    leftSword: Sword,
    rightSword: Sword,
  ) {
    this.leftSword = leftSword;
    this.rightSword = rightSword;
  }
}
