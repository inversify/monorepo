import { generateTodoDomainModelSource } from '../calculations/generateTodoDomainModelSource.js';

export class TodoDomainModelSourceFixtures {
  public static get any(): string {
    return generateTodoDomainModelSource();
  }
}
