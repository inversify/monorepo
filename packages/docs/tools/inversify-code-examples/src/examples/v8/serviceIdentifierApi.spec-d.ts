import { describe, expectTypeOf, it } from 'vitest';

import {
  firstUserService,
  fourthUserService,
  secondUserService,
  thirdUserService,
  type UserService,
} from './serviceIdentifierApi.js';

describe('Service Identifier', () => {
  it('should resolve services using different identifiers', () => {
    expectTypeOf(firstUserService).toEqualTypeOf<UserService>();
    expectTypeOf(secondUserService).not.toEqualTypeOf<UserService>();
    expectTypeOf(thirdUserService).not.toEqualTypeOf<UserService>();
    expectTypeOf(fourthUserService).toEqualTypeOf<UserService>();
  });
});
