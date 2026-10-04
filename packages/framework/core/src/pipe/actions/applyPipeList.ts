import { type Container, type ServiceIdentifier } from 'inversify';

import { type Pipe } from '../models/Pipe.js';
import { type PipeMetadata } from '../models/PipeMetadata.js';
import { isPipe } from '../typeguard/isPipe.js';

export async function applyPipeList(
  container: Container,
  params: unknown[],
  pipeList: (ServiceIdentifier<Pipe> | Pipe)[],
  pipeMetadata: PipeMetadata,
): Promise<void> {
  for (const pipeOrServiceIdentifier of pipeList) {
    const pipe: Pipe = isPipe(pipeOrServiceIdentifier)
      ? pipeOrServiceIdentifier
      : await container.getAsync(pipeOrServiceIdentifier);

    params[pipeMetadata.parameterIndex] = await pipe.execute(
      params[pipeMetadata.parameterIndex],
      pipeMetadata,
    );
  }
}
