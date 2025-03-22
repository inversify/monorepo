import { defineParameterType } from '@cucumber/cucumber';

defineParameterType({
  name: 'stringList',
  regexp: /("\w+"(?:(?:, "\w+")* and "\w+")?)/,
  transformer: function (stringList: string): string[] {
    return stringList
      .split(/ and |, /)
      .map((item: string): string => item.replaceAll('"', ''));
  },
});
