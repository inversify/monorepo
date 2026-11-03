import { injectable } from '@inversifyjs/core';

// oxlint-disable-next-line typescript/consistent-type-imports -- required by emitDecoratorMetadata
import { Sword } from './Sword';

@injectable()
export class DualWieldSwordsman {
  constructor(
    public leftSword: Sword,
    public rightSword: Sword,
  ) {}
}
