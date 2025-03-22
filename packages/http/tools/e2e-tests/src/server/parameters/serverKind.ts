import { defineParameterType } from '@cucumber/cucumber';

import { ServerKind } from '../models/ServerKind';

defineParameterType({
  name: 'serverKind',
  regexp: new RegExp(`(${Object.values(ServerKind).join('|')})`),
  transformer: function (serverKind: string): ServerKind {
    return serverKind as ServerKind;
  },
});
