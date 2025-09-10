import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  UseErrorFilter,
} from '@inversifyjs/http-core';

import { NotImplementedOperationErrorFilter } from '../error-filters/NotImplementedOperationErrorFilter';
import { NotImplementedOperationError } from '../errors/NotImplementedOperationError';

@Controller('/warriors')
@UseErrorFilter(NotImplementedOperationErrorFilter)
export class WarriorsThrowErrorController {
  @Delete()
  public async deleteWarrior(): Promise<void> {
    throw new NotImplementedOperationError(
      'Deleting a warrior is not implemented',
    );
  }

  @Get()
  public async getWarriors(): Promise<void> {
    throw new NotImplementedOperationError(
      'Getting warriors is not implemented',
    );
  }

  @Post()
  public async createWarrior(): Promise<void> {
    throw new NotImplementedOperationError(
      'Creating a warrior is not implemented',
    );
  }

  @Patch()
  public async updateWarrior(): Promise<void> {
    throw new NotImplementedOperationError(
      'Updating a warrior is not implemented',
    );
  }

  @Put()
  public async replaceWarrior(): Promise<void> {
    throw new NotImplementedOperationError(
      'Replacing a warrior is not implemented',
    );
  }
}
