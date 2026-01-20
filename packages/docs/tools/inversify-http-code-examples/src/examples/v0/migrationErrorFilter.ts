import {
  CatchError,
  Controller,
  ErrorFilter,
  Get,
  InternalServerErrorHttpResponse,
  UseErrorFilter,
} from '@inversifyjs/http-core';
import { injectable } from 'inversify';

// Begin-example
@CatchError(Error)
export class GlobalErrorFilter implements ErrorFilter<Error> {
  public catch(error: Error): void {
    console.error(error);
    throw new InternalServerErrorHttpResponse(
      { error: error.message },
      'Internal server error',
      { cause: error },
    );
  }
}

@injectable()
@UseErrorFilter(GlobalErrorFilter)
@Controller('/example')
export class ExampleController {
  @Get()
  public example(): string {
    throw new Error('Something went wrong');
  }
}
// End-example
