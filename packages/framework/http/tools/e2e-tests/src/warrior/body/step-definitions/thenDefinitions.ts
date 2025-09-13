import assert from 'node:assert';

import { Then } from '@cucumber/cucumber';

import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { RequestParameter } from '../../../http/models/RequestParameter';
import { ResponseParameter } from '../../../http/models/ResponseParameter';
import { getServerRequestOrFail } from '../../../server/calculations/getServerRequestOrFail';
import { getServerResponseOrFail } from '../../../server/calculations/getServerResponseOrFail';
import { WarriorCreationResponse } from '../models/WarriorCreationResponse';
import { WarriorRequest } from '../models/WarriorRequest';

async function thenResponseContainsTheCorrectBodyData(
  this: InversifyHttpWorld,
  requestAlias?: string,
  responseAlias?: string,
): Promise<void> {
  const parsedRequestAlias: string = requestAlias ?? 'default';
  const parsedResponseAlias: string = responseAlias ?? 'default';
  const request: RequestParameter =
    getServerRequestOrFail.bind(this)(parsedRequestAlias);

  const requestBody: WarriorRequest | undefined = request.body as
    | WarriorRequest
    | undefined;

  assert(requestBody !== undefined);

  const responseParameter: ResponseParameter =
    getServerResponseOrFail.bind(this)(parsedResponseAlias);

  const warriorCreationResponse: WarriorCreationResponse =
    responseParameter.body as WarriorCreationResponse;

  assert(warriorCreationResponse.name === requestBody.name);
  assert(warriorCreationResponse.type === requestBody.type);
}

Then<InversifyHttpWorld>(
  'the response contains the correct body data',
  async function (this: InversifyHttpWorld): Promise<void> {
    await thenResponseContainsTheCorrectBodyData.bind(this)();
  },
);
