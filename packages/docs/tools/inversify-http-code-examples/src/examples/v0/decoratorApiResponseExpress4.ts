import { Controller, Get, Response } from '@inversifyjs/http-core';
import express from 'express4';

// Begin-example
@Controller('/message')
export class ResponseExpressController {
  @Get()
  public async sendMessage(
    @Response() response: express.Response,
  ): Promise<void> {
    response.send({ message: 'hello' });
  }
}
