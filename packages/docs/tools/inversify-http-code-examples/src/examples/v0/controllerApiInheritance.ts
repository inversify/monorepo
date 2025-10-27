import { Controller, Get, Params } from '@inversifyjs/http-core';

export interface Resource {
  id: number;
  name: string;
}

// Begin-example
abstract class BaseResourceController {
  @Get()
  public async list(): Promise<Resource[]> {
    return [
      { id: 1, name: 'Resource 1' },
      { id: 2, name: 'Resource 2' },
    ];
  }

  @Get('/:id')
  public async getById(
    @Params({
      name: 'id',
    })
    id: string,
  ): Promise<Resource> {
    return { id: parseInt(id), name: `Resource ${id}` };
  }
}

@Controller('/users')
export class UsersController extends BaseResourceController {}

@Controller('/products')
export class ProductsController extends BaseResourceController {
  // Override the list method with custom implementation
  @Get()
  public override async list(): Promise<Resource[]> {
    return [
      { id: 1, name: 'Product A' },
      { id: 2, name: 'Product B' },
      { id: 3, name: 'Product C' },
    ];
  }
}
// End-example
