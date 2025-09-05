import { InversifyHttpWorld } from '../../common/models/InversifyHttpWorld';

export async function setServerResponse(
  this: InversifyHttpWorld,
  alias: string,
  response: Response,
): Promise<void> {
  const stringifiedBody: string = await response.text();

  let body: unknown;

  try {
    body = JSON.parse(stringifiedBody);
  } catch {
    body = stringifiedBody;
  }

  this.serverResponses.set(alias, {
    body,
    response,
    statusCode: response.status,
  });
}
