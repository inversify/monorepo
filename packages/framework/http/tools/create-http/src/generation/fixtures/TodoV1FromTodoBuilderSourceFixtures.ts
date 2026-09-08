import { ApiStyle } from '../../models/ApiStyle.js';
import { generateTodoV1FromTodoBuilderSource } from '../calculations/generateTodoV1FromTodoBuilderSource.js';

export class TodoV1FromTodoBuilderSourceFixtures {
  public static get any(): string {
    return TodoV1FromTodoBuilderSourceFixtures.withApiStyleCodeFirst;
  }

  public static get withApiStyleCodeFirst(): string {
    return generateTodoV1FromTodoBuilderSource(ApiStyle.codeFirst);
  }

  public static get withApiStyleSchemaFirst(): string {
    return generateTodoV1FromTodoBuilderSource(ApiStyle.schemaFirst);
  }
}
