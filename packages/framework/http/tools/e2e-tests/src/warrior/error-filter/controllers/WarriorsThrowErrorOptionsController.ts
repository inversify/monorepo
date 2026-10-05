import { Controller, Options, UseErrorFilter } from '@inversifyjs/http-core';

import { NotImplementedOperationErrorFilter } from '../error-filters/NotImplementedOperationErrorFilter.js';
import { NotImplementedOperationError } from '../errors/NotImplementedOperationError.js';

@Controller('/warriors')
export class WarriorsThrowErrorOptionsController {
  @UseErrorFilter(NotImplementedOperationErrorFilter)
  @Options()
  public async optionsWarrior(): Promise<void> {
    throw new NotImplementedOperationError(
      'Deleting a warrior is not implemented',
    );
  }
}
