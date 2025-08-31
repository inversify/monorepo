import { defineParameterType } from '@cucumber/cucumber';

import { HttpMethod } from '../models/HttpMethod';

defineParameterType({
  name: 'httpMethod',
  regexp: new RegExp(`(${Object.values(HttpMethod).join('|')})`),
  transformer: function (httpMethod: string): HttpMethod {
    return httpMethod as HttpMethod;
  },
});
