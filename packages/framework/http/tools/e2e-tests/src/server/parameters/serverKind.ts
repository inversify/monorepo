import { defineParameterType } from '@cucumber/cucumber';

import { ServerKind } from '../models/ServerKind';

defineParameterType({
  name: 'serverKind',
  regexp: new RegExp(`(${Object.values(ServerKind).join('|')})`),
  transformer: function (serverKind: string): ServerKind {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment
    return serverKind as ServerKind;
  },
});
