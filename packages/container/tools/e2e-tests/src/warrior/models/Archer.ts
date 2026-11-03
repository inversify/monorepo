import { inject, injectable, named, tagged } from '@inversifyjs/core';

// oxlint-disable-next-line typescript/consistent-type-imports -- required by emitDecoratorMetadata
import { Bow } from './Bow';

@injectable()
export class Archer {
  constructor(
    @inject('weapon')
    @named('bow')
    @tagged('kind', 'bow')
    public bow: Bow,
  ) {}
}
