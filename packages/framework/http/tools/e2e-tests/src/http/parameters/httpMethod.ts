import { defineParameterType } from '@cucumber/cucumber';

import { HttpMethod } from '../models/HttpMethod';

defineParameterType({
  name: 'httpMethod',
  regexp: new RegExp(`(${Object.values(HttpMethod).join('|')})`),
  transformer: function (httpMethod: string): HttpMethod {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment
    return httpMethod as HttpMethod;
  },
});
