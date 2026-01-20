import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatusCode,
  Params,
  Post,
  Query,
  StatusCode,
} from '@inversifyjs/http-core';
import { inject, injectable } from 'inversify';

import { FooService } from './migrationServerSetupFooService';

interface CreateFooDto {
  name: string;
}

// Begin-example
@injectable()
@Controller('/foo')
export class FooController {
  constructor(@inject('FooService') private readonly fooService: FooService) {}

  @Get()
  public list(
    @Query({ name: 'start' }) _start: number,
    @Query({ name: 'count' }) count: number,
  ): string[] {
    return this.fooService.findAll(count);
  }

  @StatusCode(HttpStatusCode.CREATED)
  @Post()
  public async create(@Body() body: CreateFooDto): Promise<void> {
    await this.fooService.create(body);
  }

  @Delete('/:id')
  public async delete(@Params({ name: 'id' }) id: string): Promise<void> {
    await this.fooService.delete(id);
  }
}
// End-example
