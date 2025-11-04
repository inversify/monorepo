import {
  Controller,
  Get,
  InterceptorTransformObject,
  Next,
  UseInterceptor,
} from '@inversifyjs/http-core';
import { UwebSocketsInterceptor } from '@inversifyjs/http-uwebsockets';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';

export class UwebsocketsNextInterceptor implements UwebSocketsInterceptor {
  public async intercept(
    _request: HttpRequest,
    response: HttpResponse,
    next: () => Promise<InterceptorTransformObject>,
  ): Promise<void> {
    response.cork((): void => {
      response.writeHeader('next-was-called', 'true');
    });

    const transform: InterceptorTransformObject = await next();

    transform.push(() => {
      response.cork((): void => {
        response.end('ok');
      });
    });
  }
}

// Begin-example
@Controller('/next')
export class NextUwebsocketsController {
  @UseInterceptor(UwebsocketsNextInterceptor)
  @Get()
  public getNext(@Next() next: () => void): void {
    next();
  }
}
// End-example
