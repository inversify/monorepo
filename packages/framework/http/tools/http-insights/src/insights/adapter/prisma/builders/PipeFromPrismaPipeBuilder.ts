import { injectable } from 'inversify';

import { type Builder } from '../../../../foundation/modules/Builder.js';
import { type Pipe as PrismaPipe } from '../../../../generated/prisma/client.js';
import { type Pipe } from '../../../domain/models/Pipe.js';

@injectable()
export class PipeFromPrismaPipeBuilder implements Builder<PrismaPipe, Pipe> {
  public build(input: PrismaPipe): Pipe {
    return {
      endedAt: input.ended_at,
      error: input.error,
      id: input.id,
      method: input.method,
      parameterIndex: input.parameter_index,
      pipe: input.pipe,
      startedAt: input.started_at,
    };
  }
}
