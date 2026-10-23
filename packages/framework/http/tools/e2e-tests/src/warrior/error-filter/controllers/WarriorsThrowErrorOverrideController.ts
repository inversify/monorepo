import { Controller, Get, UseErrorFilter } from '@inversifyjs/http-core';

import { BadRequestOperationErrorFilter } from '../error-filters/BadRequestOperationErrorFilter.js';
import { NotImplementedOperationErrorFilter } from '../error-filters/NotImplementedOperationErrorFilter.js';
import { NotImplementedOperationError } from '../errors/NotImplementedOperationError.js';

@Controller('/warriors')
@UseErrorFilter(BadRequestOperationErrorFilter)
export class WarriorsThrowErrorOverrideController {
  @UseErrorFilter(NotImplementedOperationErrorFilter)
  @Get()
  public async getWarriors(): Promise<void> {
    throw new NotImplementedOperationError(
      'Getting warriors is not implemented',
    );
  }
}
