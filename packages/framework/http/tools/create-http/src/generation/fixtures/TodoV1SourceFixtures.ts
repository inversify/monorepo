import { generateTodoV1Source } from '../calculations/generateTodoV1Source.js';

export class TodoV1SourceFixtures {
  public static get any(): string {
    return generateTodoV1Source();
  }
}
