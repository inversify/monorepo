import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld';
import { ResponseParameter } from '../../http/models/ResponseParameter';

export function getServerResponseOrFail(
  this: InversifyHttpWorld,
  alias: string,
): ResponseParameter {
  const responseParameter: ResponseParameter | undefined =
    this.serverResponses.get(alias);

  if (responseParameter === undefined) {
    throw new Error('Server response not found');
  }

  return responseParameter;
}
