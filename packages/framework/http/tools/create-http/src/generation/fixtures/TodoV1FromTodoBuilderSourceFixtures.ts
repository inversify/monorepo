import { generateTodoV1FromTodoBuilderSource } from '../calculations/generateTodoV1FromTodoBuilderSource.js';

export class TodoV1FromTodoBuilderSourceFixtures {
  public static get any(): string {
    return generateTodoV1FromTodoBuilderSource();
  }
}
