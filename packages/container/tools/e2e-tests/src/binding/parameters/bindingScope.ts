import { defineParameterType } from '@cucumber/cucumber';
import { type BindingScope, bindingScopeValues } from '@inversifyjs/core';

defineParameterType({
  name: 'bindingScope',
  regexp: new RegExp(`"(${Object.values(bindingScopeValues).join('|')})"`),
  transformer: function (bindingScope: string): BindingScope {
    return bindingScope as BindingScope;
  },
});
