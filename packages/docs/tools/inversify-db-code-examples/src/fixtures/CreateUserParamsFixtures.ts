export interface CreateUserParams {
  email: string;
  name: string | null;
}

export class CreateUserParamsFixtures {
  public static get any(): CreateUserParams {
    return {
      email: 'ada@example.com',
      name: 'Ada Lovelace',
    };
  }
}
