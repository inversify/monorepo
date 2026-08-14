import { generateTodoFromPrismaTodoBuilderSource } from '../calculations/generateTodoFromPrismaTodoBuilderSource.js';

export class TodoFromPrismaTodoBuilderSourceFixtures {
  public static get any(): string {
    return generateTodoFromPrismaTodoBuilderSource();
  }
}
