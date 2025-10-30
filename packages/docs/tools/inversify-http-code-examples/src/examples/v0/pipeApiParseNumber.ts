import { BadRequestHttpResponse, Pipe } from '@inversifyjs/http-core';

// Begin-example
export class ParseNumberPipe implements Pipe<unknown, number> {
  public execute(input: unknown): number {
    const parsed: number = Number(input);

    if (Number.isNaN(parsed)) {
      throw new BadRequestHttpResponse(
        { message: 'Invalid number' },
        'Invalid number',
      );
    }

    return parsed;
  }
}
// End-example
