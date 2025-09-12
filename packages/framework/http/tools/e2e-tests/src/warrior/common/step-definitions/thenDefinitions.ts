import assert from 'node:assert';

import { Then } from '@cucumber/cucumber';
import { HttpStatusCode } from '@inversifyjs/http-core';

import { InversifyHttpWorld } from '../../../common/models/InversifyHttpWorld';
import { ResponseParameter } from '../../../http/models/ResponseParameter';
import { getServerResponseOrFail } from '../../../server/calculations/getServerResponseOrFail';

async function thenResponseStatusCodeIsOkIsh(
  this: InversifyHttpWorld,
  responseAlias?: string,
): Promise<void> {
  const parsedResponseAlias: string = responseAlias ?? 'default';
  const responseParameter: ResponseParameter =
    getServerResponseOrFail.bind(this)(parsedResponseAlias);

  assert(
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    responseParameter.statusCode >= 200 && responseParameter.statusCode < 300,
    `Status code is not Ok-ish: ${JSON.stringify({
      body: responseParameter.body,
      statusCode: responseParameter.statusCode,
    })}`,
  );
}

async function thenResponseStatusCodeIs(
  this: InversifyHttpWorld,
  statusCode: number,
  responseAlias?: string,
): Promise<void> {
  const parsedResponseAlias: string = responseAlias ?? 'default';

  const responseParameter: ResponseParameter =
    getServerResponseOrFail.bind(this)(parsedResponseAlias);

  assert.strictEqual(
    responseParameter.statusCode,
    statusCode,
    `Expected status code to be ${statusCode.toString()}, but got ${String(responseParameter.statusCode)}

Response body:

${JSON.stringify(responseParameter.body)}`,
  );
}

Then<InversifyHttpWorld>(
  'the response status code is ACCEPTED',
  async function (this: InversifyHttpWorld): Promise<void> {
    await thenResponseStatusCodeIs.bind(this)(HttpStatusCode.ACCEPTED);
  },
);

Then<InversifyHttpWorld>(
  'the response status code is FORBIDDEN',
  async function (this: InversifyHttpWorld): Promise<void> {
    await thenResponseStatusCodeIs.bind(this)(HttpStatusCode.FORBIDDEN);
  },
);

Then<InversifyHttpWorld>(
  'the response status code is NO_CONTENT',
  async function (this: InversifyHttpWorld): Promise<void> {
    await thenResponseStatusCodeIs.bind(this)(HttpStatusCode.NO_CONTENT);
  },
);

Then<InversifyHttpWorld>(
  'the response status code is NOT IMPLEMENTED',
  async function (this: InversifyHttpWorld): Promise<void> {
    await thenResponseStatusCodeIs.bind(this)(HttpStatusCode.NOT_IMPLEMENTED);
  },
);

Then<InversifyHttpWorld>(
  'the response status code is Ok-ish',
  async function (this: InversifyHttpWorld): Promise<void> {
    await thenResponseStatusCodeIsOkIsh.bind(this)();
  },
);
