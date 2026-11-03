import { type FastifyMiddleware } from '@inversifyjs/http-fastify';
import { type FastifyReply, type FastifyRequest } from 'fastify';
import { injectable } from 'inversify';

@injectable()
export class NextFastifyMiddleware implements FastifyMiddleware {
  public async execute(
    _request: FastifyRequest,
    response: FastifyReply,
  ): Promise<void> {
    response.send();
  }
}
